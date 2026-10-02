import { AI_PROVIDER_CONFIG, DEFAULT_CHANNEL_NAME } from "@/constants/ai";
import { HOOK_ANALYSIS_SYSTEM_PROMPT } from "@/constants/hook-system-prompt";
import { handleApiError } from "@/lib/api-error";
import { requireUser } from "@/lib/session";
import { generateHookPlaceholderSvg } from "@/lib/svg-placeholder";
import {
  aiHookBreakdownSchema,
  analyzeHookRequestSchema,
} from "@/lib/validations";
import type { DeepSeekChatMessage } from "@/types/hook-analysis";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await requireUser();
    const rawBody = await req.json();
    const input = analyzeHookRequestSchema.parse(rawBody);

    const {
      baseUrl,
      apiKey: staticApiKey,
      textModel,
      visionModel,
      SCRAPE_TIMEOUT_MS,
      TIMEOUT_MS,
      TEMPERATURE,
      provider,
      extraHeaders,
    } = AI_PROVIDER_CONFIG;

    const apiKey =
      (provider === "gemini"
        ? process.env.GEMINI_API_KEY
        : provider === "openrouter"
          ? process.env.OPENROUTER_API_KEY
          : process.env.DEEPSEEK_API_KEY) || staticApiKey;

    if (!apiKey) {
      const keyName =
        provider === "gemini"
          ? "GEMINI_API_KEY"
          : provider === "openrouter"
            ? "OPENROUTER_API_KEY"
            : "DEEPSEEK_API_KEY";
      return NextResponse.json(
        {
          error: `${keyName} is not configured. Add it to your .env.local file.`,
        },
        { status: 500 },
      );
    }

    const isImageAnalysis = Boolean(input.imageBase64 || input.imageUrl);

    // DeepSeek API is text-only. Guard against sending image payloads directly to DeepSeek.
    if (isImageAnalysis && provider === "deepseek") {
      return NextResponse.json(
        {
          error:
            "Thumbnail visual analysis is not supported with DeepSeek (text-only provider). Please paste video/hook text or switch to a vision-capable provider.",
        },
        { status: 400 },
      );
    }

    let analyzedContent = input.manualText?.trim() || "";
    let thumbnailUrl = input.imageUrl || "";
    const sourceUrl = input.url || "";
    let channelName: string | undefined;

    // 1. Process URL if provided
    if (input.url) {
      const url = input.url.trim();
      const isYoutube = url.includes("youtube.com") || url.includes("youtu.be");

      if (isYoutube) {
        try {
          const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
          const res = await fetch(oembedUrl, {
            signal: AbortSignal.timeout(5000),
          });
          if (res.ok) {
            const oembed = await res.json();
            const idMatch = url.match(/(?:v=|youtu\.be\/)([\w-]{11})/);
            const videoId = idMatch?.[1];
            thumbnailUrl = videoId
              ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
              : oembed.thumbnail_url || "";
            channelName = oembed.author_name;
            analyzedContent = `Title: "${oembed.title}"\nChannel: ${oembed.author_name}\nURL: ${url}${
              analyzedContent ? `\nAdditional Notes: ${analyzedContent}` : ""
            }`;
          }
        } catch {
          analyzedContent = analyzedContent || `URL: ${url}`;
        }
      } else {
        try {
          const res = await fetch(url, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            },
            signal: AbortSignal.timeout(SCRAPE_TIMEOUT_MS),
          });

          if (res.ok) {
            const html = await res.text();
            const ogTitleMatch =
              html.match(
                /<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i,
              ) || html.match(/<title>(.*?)<\/title>/i);
            const ogImageMatch = html.match(
              /<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i,
            );

            if (ogTitleMatch?.[1]) {
              analyzedContent = `Title: "${ogTitleMatch[1]}"\nURL: ${url}${
                analyzedContent ? `\nNotes: ${analyzedContent}` : ""
              }`;
            }
            if (ogImageMatch?.[1] && !thumbnailUrl) {
              thumbnailUrl = ogImageMatch[1];
            }
          } else if (!analyzedContent) {
            return NextResponse.json({
              needsManualFallback: true,
              error:
                "Could not automatically extract content from this URL due to platform bot restrictions. Please paste the hook text directly.",
            });
          }
        } catch {
          if (!analyzedContent) {
            return NextResponse.json({
              needsManualFallback: true,
              error:
                "URL extraction timed out. Please paste the hook copy or title directly into the field below.",
            });
          }
        }
      }
    }

    // 2. Determine model and construct messages with explicit input type
    const selectedModel = isImageAnalysis ? visionModel : textModel;

    const messages: DeepSeekChatMessage[] = [
      { role: "system", content: HOOK_ANALYSIS_SYSTEM_PROMPT },
    ];

    if (isImageAnalysis) {
      const imgTarget = input.imageBase64 || input.imageUrl || "";
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: `Input type: image\n${
              analyzedContent
                ? `Analyze this thumbnail and context: ${analyzedContent}`
                : "Analyze this thumbnail and break down its retention hook."
            }`,
          },
          {
            type: "image_url",
            image_url: { url: imgTarget },
          },
        ],
      });
    } else {
      messages.push({
        role: "user",
        content: `Input type: text-only title\nPlease analyze this content:\n${
          analyzedContent || "Analyze this hook copy and title."
        }`,
      });
    }

    // 3. Dispatch to AI provider with single retry on malformed JSON
    const executeProviderCall = async (): Promise<string> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      try {
        const res = await fetch(baseUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            ...extraHeaders,
          },
          body: JSON.stringify({
            model: selectedModel,
            messages,
            ...(isImageAnalysis
              ? {}
              : { response_format: { type: "json_object" } }),
            temperature: TEMPERATURE,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errorText = await res.text();
          const err = new Error(
            `DeepSeek API returned status ${res.status}: ${errorText}`,
          );
          (err as { status?: number }).status = res.status;
          throw err;
        }

        const json = await res.json();
        return json.choices?.[0]?.message?.content || "";
      } catch (networkErr: unknown) {
        if (
          networkErr instanceof Error &&
          (networkErr.name === "AbortError" ||
            networkErr.message.includes("abort"))
        ) {
          const timeoutErr = new Error(
            "DeepSeek API request timed out. Please verify your connection or try again.",
          );
          (timeoutErr as { status?: number }).status = 504;
          throw timeoutErr;
        }
        throw networkErr;
      } finally {
        clearTimeout(timeoutId);
      }
    };

    let rawContent = "";
    try {
      rawContent = await executeProviderCall();
    } catch (apiErr: unknown) {
      const status = (apiErr as { status?: number })?.status || 500;
      return NextResponse.json(
        {
          error:
            apiErr instanceof Error
              ? apiErr.message
              : "Failed to connect to AI provider",
        },
        { status },
      );
    }

    const cleanJson = (str: string) =>
      str.replace(/^```(?:json)?\s*|\s*```$/gi, "").trim();

    let parsedBreakdown: ReturnType<typeof aiHookBreakdownSchema.parse>;
    try {
      const cleaned = cleanJson(rawContent);
      const parsedJson = JSON.parse(cleaned);
      parsedBreakdown = aiHookBreakdownSchema.parse(parsedJson);
    } catch {
      // Single retry on malformed JSON
      try {
        rawContent = await executeProviderCall();
        const retryCleaned = cleanJson(rawContent);
        const retryJson = JSON.parse(retryCleaned);
        parsedBreakdown = aiHookBreakdownSchema.parse(retryJson);
      } catch (retryErr: unknown) {
        return NextResponse.json(
          {
            error: `Failed to parse DeepSeek response into expected hook breakdown format: ${
              retryErr instanceof Error ? retryErr.message : "Malformed JSON"
            }`,
            raw: rawContent,
          },
          { status: 502 },
        );
      }
    }

    // 4. Ensure valid thumbnailUrl (fallback to SVG if empty)
    if (!thumbnailUrl) {
      thumbnailUrl = input.imageBase64 || "";
    }
    if (!thumbnailUrl) {
      thumbnailUrl = generateHookPlaceholderSvg(
        parsedBreakdown.perceived_copy,
        parsedBreakdown.triggered_emotion,
      );
    }

    return NextResponse.json({
      ...parsedBreakdown,
      thumbnailUrl,
      sourceUrl,
      channelName: channelName || DEFAULT_CHANNEL_NAME,
    });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

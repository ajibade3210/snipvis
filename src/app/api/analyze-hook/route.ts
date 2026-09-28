import { AI_PROVIDER_CONFIG, DEFAULT_CHANNEL_NAME } from "@/constants/ai";
import { handleApiError } from "@/lib/api-error";
import { generateHookPlaceholderSvg } from "@/lib/svg-placeholder";
import {
  aiHookBreakdownSchema,
  analyzeHookRequestSchema,
} from "@/lib/validations";
import { type NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are an expert content strategist and hook analyst. Analyze the provided input (text or image).

You MUST respond with ONLY a raw JSON object — no markdown, no code fences, no explanation. The JSON must have exactly these fields:
{
  "perceived_copy": "The core text, title, or copy perceived from the input.",
  "why_it_works": "A brief psychological breakdown of why this post/video works.",
  "triggered_emotion": "The primary emotion triggered in viewers (e.g., Curiosity, Fear, Ambition).",
  "recreation_ideas": ["Idea one.", "Idea two.", "Idea three."]
}`;

interface DeepSeekChatMessage {
  role: "system" | "user" | "assistant";
  content:
    | string
    | Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
      >;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const input = analyzeHookRequestSchema.parse(rawBody);

    const {
      baseUrl,
      apiKey,
      textModel,
      visionModel,
      SCRAPE_TIMEOUT_MS,
      TIMEOUT_MS,
      TEMPERATURE,
      provider,
      extraHeaders,
    } = AI_PROVIDER_CONFIG;

    if (!apiKey) {
      const keyName =
        provider === "openrouter" ? "OPENROUTER_API_KEY" : "DEEPSEEK_API_KEY";
      return NextResponse.json(
        {
          error: `${keyName} is not configured. Add it to your .env.local file.`,
        },
        { status: 500 },
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
          // If YouTube oembed fails, proceed with raw URL or manual text
          analyzedContent = analyzedContent || `URL: ${url}`;
        }
      } else {
        // Non-YouTube URL: attempt fast 3-second scrape for OpenGraph metadata
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

    // 2. Determine model and construct messages
    const isImageAnalysis = Boolean(input.imageBase64 || input.imageUrl);
    const selectedModel = isImageAnalysis ? visionModel : textModel;

    const messages: DeepSeekChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    if (isImageAnalysis) {
      const imgTarget = input.imageBase64 || input.imageUrl || "";
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: analyzedContent
              ? `Analyze this thumbnail and context: ${analyzedContent}`
              : "Analyze this thumbnail and break down its retention hook.",
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
        content: analyzedContent
          ? `Please analyze this content:\n${analyzedContent}`
          : "Please analyze this viral hook and title.",
      });
    }

    // 3. Dispatch to AI provider
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let deepseekRes: Response;
    try {
      deepseekRes = await fetch(baseUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          ...extraHeaders,
        },
        body: JSON.stringify({
          model: selectedModel,
          messages,
          // response_format json_object is only supported by the text model.
          // The vision model returns an empty output error when this is set.
          ...(isImageAnalysis
            ? {}
            : { response_format: { type: "json_object" } }),
          temperature: TEMPERATURE,
        }),
        signal: controller.signal,
      });
    } catch (networkErr: unknown) {
      clearTimeout(timeoutId);
      if (
        networkErr instanceof Error &&
        (networkErr.name === "AbortError" ||
          networkErr.message.includes("abort"))
      ) {
        return NextResponse.json(
          {
            error:
              "DeepSeek API request timed out. Please verify your connection or try again.",
          },
          { status: 504 },
        );
      }
      throw networkErr;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!deepseekRes.ok) {
      const errorText = await deepseekRes.text();
      return NextResponse.json(
        {
          error: `DeepSeek API returned status ${deepseekRes.status}: ${errorText}`,
        },
        { status: deepseekRes.status },
      );
    }

    const json = await deepseekRes.json();
    const rawContent = json.choices?.[0]?.message?.content || "";

    // 4. Strip markdown code fences before JSON.parse
    const cleanedContent = rawContent
      .replace(/^```(?:json)?\s*|\s*```$/gi, "")
      .trim();

    let parsedBreakdown: ReturnType<typeof aiHookBreakdownSchema.parse>;
    try {
      const parsedJson = JSON.parse(cleanedContent);
      parsedBreakdown = aiHookBreakdownSchema.parse(parsedJson);
    } catch (parseErr: unknown) {
      return NextResponse.json(
        {
          error: `Failed to parse DeepSeek response into expected hook breakdown format: ${
            parseErr instanceof Error ? parseErr.message : "Malformed JSON"
          }`,
          raw: rawContent,
        },
        { status: 502 },
      );
    }

    // 5. Ensure valid thumbnailUrl (fallback to SVG if empty)
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

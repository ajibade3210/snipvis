import { AI_PROVIDER_CONFIG } from "@/constants/ai";
import {
  type ChatMessage,
  type ThumbnailPromptInput,
  buildMessages,
} from "./build-messages";
import { parseConcepts } from "./parse-concepts";
import type { ThumbnailPromptConcept } from "./schema";

export class ThumbnailGenerationError extends Error {
  status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.name = "ThumbnailGenerationError";
    this.status = status;
  }
}

export function resolveApiKey(): string {
  const { provider, apiKey: staticApiKey } = AI_PROVIDER_CONFIG;
  if (provider === "gemini") {
    return process.env.GEMINI_API_KEY || staticApiKey;
  }
  if (provider === "openrouter") {
    return process.env.OPENROUTER_API_KEY || staticApiKey;
  }
  return process.env.DEEPSEEK_API_KEY || staticApiKey;
}

export async function requestCompletion(
  apiKey: string,
  messages: ChatMessage[],
): Promise<string> {
  const {
    baseUrl,
    textModel,
    TIMEOUT_MS,
    TEMPERATURE,
    provider,
    extraHeaders,
  } = AI_PROVIDER_CONFIG;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    console.info(
      `[ThumbnailPrompt] Sending request to ${provider} using model "${textModel}" (timeout: ${TIMEOUT_MS}ms)...`,
    );
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...extraHeaders,
      },
      body: JSON.stringify({
        model: textModel,
        messages,
        temperature: TEMPERATURE,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error(
        `[ThumbnailPrompt] Provider ${provider} (${textModel}) returned ${response.status}:`,
        errorText,
      );
      let providerError = "";
      try {
        const parsed = JSON.parse(errorText);
        providerError =
          parsed.error?.message ||
          parsed.message ||
          (typeof parsed.error === "string" ? parsed.error : "");
      } catch {
        providerError = errorText;
      }
      const message = providerError
        ? `AI provider (${provider}) returned status ${response.status}: ${providerError}`
        : `AI provider (${provider}) returned status ${response.status}`;
      throw new ThumbnailGenerationError(message, 502);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      console.error("[ThumbnailPrompt] Empty content from provider");
      throw new ThumbnailGenerationError(
        "Empty response from AI provider",
        502,
      );
    }

    return content;
  } catch (err: unknown) {
    if (err instanceof ThumbnailGenerationError) {
      throw err;
    }
    if (
      controller.signal.aborted ||
      (err instanceof Error && err.name === "AbortError")
    ) {
      console.error(
        `[ThumbnailPrompt] Request to ${provider} (${textModel}) timed out after ${TIMEOUT_MS}ms`,
      );
      throw new ThumbnailGenerationError("AI generation timed out", 504);
    }
    const message = err instanceof Error ? err.message : "Request failed";
    throw new ThumbnailGenerationError(message, 502);
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function generateConcepts(
  input: ThumbnailPromptInput,
): Promise<ThumbnailPromptConcept[]> {
  const apiKey = resolveApiKey();
  if (!apiKey) {
    throw new ThumbnailGenerationError("AI provider is not configured.", 503);
  }

  let feedback: string[] = [];

  for (let attempt = 1; attempt <= 2; attempt++) {
    const messages = buildMessages(input, feedback);
    const raw = await requestCompletion(apiKey, messages);
    const result = parseConcepts(raw, input.topic);

    if (result.ok) {
      return result.concepts;
    }

    console.warn(
      `[ThumbnailPrompt] Attempt ${attempt} failed validation:`,
      result.problems,
    );
    feedback = result.problems;
  }

  throw new ThumbnailGenerationError(
    "Could not generate concepts that meet the thumbnail rules.",
    502,
  );
}

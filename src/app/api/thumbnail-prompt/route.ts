import { AI_PROVIDER_CONFIG } from "@/constants/ai";
import { handleApiError } from "@/lib/api-error";
import { requireUser } from "@/lib/session";
import {
  ThumbnailGenerationError,
  generateConcepts,
} from "@/lib/thumbnail-prompt/generate-concepts";
import { generateThumbnailPromptSchema } from "@/lib/validations";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await requireUser();
    const rawBody = await req.json();
    const input = generateThumbnailPromptSchema.parse(rawBody);

    const concepts = await generateConcepts({
      topic: input.topic,
      hook: input.hook,
      style: input.style,
      subject: input.subject,
      channelFormula: input.channelFormula,
      optionIndex: input.optionIndex,
    });

    return NextResponse.json({
      concepts,
      concept: concepts[0],
      providerUsed: AI_PROVIDER_CONFIG.provider,
    });
  } catch (err: unknown) {
    if (err instanceof ThumbnailGenerationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return handleApiError(err);
  }
}

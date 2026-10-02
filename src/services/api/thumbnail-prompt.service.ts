import { API_ROUTES } from "@/lib/constants";
import { conceptSchema } from "@/lib/thumbnail-prompt/schema";
import type {
  GenerateThumbnailPromptRequest,
  GenerateThumbnailPromptResponse,
} from "@/types/thumbnail-prompt";
import { z } from "zod";
import { api } from "./client";

const generateThumbnailPromptResponseSchema = z.object({
  concepts: z.array(conceptSchema),
  concept: conceptSchema.optional(),
  providerUsed: z.string().optional(),
});

export const thumbnailPromptService = {
  generate: (
    data: GenerateThumbnailPromptRequest,
  ): Promise<GenerateThumbnailPromptResponse> =>
    api(API_ROUTES.THUMBNAIL_PROMPT, {
      method: "POST",
      body: JSON.stringify(data),
      schema: generateThumbnailPromptResponseSchema,
    }),
};

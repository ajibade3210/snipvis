import { API_ROUTES } from "@/lib/constants";
import type {
  GenerateThumbnailPromptRequest,
  GenerateThumbnailPromptResponse,
} from "@/types/thumbnail-prompt";
import { z } from "zod";
import { api } from "./client";

const thumbnailPromptConceptSchema = z.object({
  id: z.string(),
  conceptName: z.string(),
  thumbnailCopy: z.string().optional(),
  visualAnalogy: z.string().optional(),
  colorScheme: z.string().optional(),
  prompt: z.string(),
  psychologicalAngle: z.string(),
  squintTestFeature: z.string(),
  ruleOfThreeBreakdown: z.object({
    anchor: z.string(),
    context: z.string(),
    accent: z.string(),
  }),
});

const generateThumbnailPromptResponseSchema = z.object({
  concepts: z.array(thumbnailPromptConceptSchema),
  providerUsed: z.string(),
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

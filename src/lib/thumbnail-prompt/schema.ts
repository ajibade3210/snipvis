import { z } from "zod";

export const SUBJECT_MODES = [
  "reference-face",
  "generic-character",
  "no-face",
] as const;

export type SubjectMode = (typeof SUBJECT_MODES)[number];

export const CONCEPT_COUNT = 1;

const trimmedString = (field: string) =>
  z.string().trim().min(1, `${field} cannot be empty`);

export const conceptSchema = z.object({
  id: trimmedString("id"),
  conceptName: trimmedString("conceptName"),
  emotionalTrigger: trimmedString("emotionalTrigger"),
  thumbnailCopy: trimmedString("thumbnailCopy"),
  copyMechanism: trimmedString("copyMechanism"),
  visualAnalogy: trimmedString("visualAnalogy"),
  colorScheme: trimmedString("colorScheme"),
  prompt: trimmedString("prompt"),
  psychologicalAngle: trimmedString("psychologicalAngle"),
  squintTestFeature: trimmedString("squintTestFeature"),
  ruleOfThreeBreakdown: z.object({
    anchor: trimmedString("ruleOfThreeBreakdown.anchor"),
    context: trimmedString("ruleOfThreeBreakdown.context"),
    accent: trimmedString("ruleOfThreeBreakdown.accent"),
  }),
  honestyCheck: trimmedString("honestyCheck"),
  pitfallToAvoid: trimmedString("pitfallToAvoid"),
  sensitiveTopicNote: z
    .string()
    .nullish()
    .transform((val) => {
      if (!val) return null;
      const trimmed = val.trim();
      return trimmed.length > 0 ? trimmed : null;
    }),
});

export const conceptsResponseSchema = z
  .union([
    z.object({
      concepts: z.array(conceptSchema).min(1),
    }),
    z.object({
      concept: conceptSchema,
    }),
    conceptSchema,
  ])
  .transform((val) => {
    if ("concepts" in val && Array.isArray(val.concepts)) {
      return { concepts: val.concepts };
    }
    if ("concept" in val && val.concept) {
      return { concepts: [val.concept] };
    }
    return { concepts: [val as ThumbnailPromptConcept] };
  });

export type ThumbnailPromptConcept = z.infer<typeof conceptSchema>;
export type ConceptsResponse = { concepts: ThumbnailPromptConcept[] };

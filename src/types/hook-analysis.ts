import { z } from "zod";

export const HOOK_TYPES = [
  "curiosity_gap",
  "statistic",
  "contrarian",
  "story",
  "challenge",
  "how_to",
  "fear_of_loss",
  "social_proof",
] as const;

export const TRIGGERED_EMOTIONS = [
  "Curiosity",
  "Fear",
  "Ambition",
  "Surprise",
  "Desire",
  "Outrage",
  "Belonging",
  "Urgency",
  "Nostalgia",
] as const;

export const RISK_FLAGS = [
  "clickbait",
  "misleading",
  "sensitive_topic",
  "policy_risk",
] as const;

export const hookTypeEnum = z.enum(HOOK_TYPES);
export const triggeredEmotionEnum = z.enum(TRIGGERED_EMOTIONS);
export const riskFlagEnum = z.enum(RISK_FLAGS);

export type HookType = z.infer<typeof hookTypeEnum>;
export type TriggeredEmotion = z.infer<typeof triggeredEmotionEnum>;
export type RiskFlag = z.infer<typeof riskFlagEnum>;

export const aiHookBreakdownSchema = z.object({
  perceived_copy: z.string(),
  hook_type: hookTypeEnum,
  why_it_works: z.string(),
  triggered_emotion: triggeredEmotionEnum,
  hook_formula: z.string(),
  strength_score: z.number().int().min(1).max(10),
  score_reason: z.string(),
  improvements: z.array(z.string()),
  title_variants: z.array(z.string()),
  recreation_ideas: z.array(z.string()),
  risk_flags: z.array(riskFlagEnum),
});

export const analyzeHookRequestSchema = z.object({
  inputType: z.enum(["url", "image", "text"]),
  url: z.string().optional().or(z.literal("")),
  manualText: z.string().max(4000).optional().or(z.literal("")),
  imageBase64: z.string().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export const analyzeHookResponseSchema = aiHookBreakdownSchema.extend({
  thumbnailUrl: z.string().optional(),
  sourceUrl: z.string().optional(),
  channelName: z.string().optional(),
  needsManualFallback: z.boolean().optional(),
  extractedTitle: z.string().optional(),
});

export type AiHookBreakdown = z.infer<typeof aiHookBreakdownSchema>;
export type AnalyzeHookInput = z.infer<typeof analyzeHookRequestSchema>;
export type AnalyzeHookResponse = z.infer<typeof analyzeHookResponseSchema>;

export const HOOK_TYPE_LABELS: Record<HookType, string> = {
  curiosity_gap: "Curiosity Gap",
  statistic: "Statistic",
  contrarian: "Contrarian",
  story: "Story",
  challenge: "Challenge",
  how_to: "How-To",
  fear_of_loss: "Fear of Loss",
  social_proof: "Social Proof",
};

export const RISK_FLAG_LABELS: Record<RiskFlag, string> = {
  clickbait: "Clickbait",
  misleading: "Misleading",
  sensitive_topic: "Sensitive Topic",
  policy_risk: "Policy Risk",
};

export function getStrengthScoreBadgeStyle(score?: number | null): string {
  if (score == null) return "";
  if (score <= 4) {
    return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
  }
  if (score <= 7) {
    return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
  }
  return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
}

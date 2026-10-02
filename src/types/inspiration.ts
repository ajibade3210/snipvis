import type {
  HookType,
  RiskFlag,
  TriggeredEmotion,
} from "@/types/hook-analysis";
import type { InspirationType } from "@prisma/client";

export type { InspirationType };

export interface InspirationProjectContext {
  projectId: string;
  projectName?: string;
  note?: string | null;
  favorite?: boolean;
}

export interface InspirationRecord {
  id: string;
  thumbnailUrl: string;
  title?: string | null;
  hook?: string | null;
  channelName?: string | null;
  views?: string | null;
  sourceUrl?: string | null;
  type: InspirationType;
  note?: string | null;
  duration?: string | null;
  estimated_ctr?: string | null;
  estimatedCtr?: string | null;
  insight_left?: string | null;
  insightLeft?: string | null;
  insight_right?: string | null;
  insightRight?: string | null;
  hook_type?: HookType | string | null;
  hookType?: string | null;
  hook_formula?: string | null;
  hookFormula?: string | null;
  triggered_emotion?: TriggeredEmotion | string | null;
  triggeredEmotion?: string | null;
  strength_score?: number | null;
  strengthScore?: number | null;
  score_reason?: string | null;
  scoreReason?: string | null;
  improvements?: string[] | null;
  title_variants?: string[] | null;
  titleVariants?: string[] | null;
  recreation_ideas?: string[] | null;
  recreationIdeas?: string[] | null;
  risk_flags?: RiskFlag[] | string[] | null;
  riskFlags?: string[] | null;
  is_outlier?: boolean | null;
  isOutlier?: boolean | null;
  multiplier?: string | null;
  projectName?: string | null;
  projectDot?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  projectContext?: InspirationProjectContext;
}

export interface FormattedInspiration extends InspirationRecord {
  categoryTag: string;
  categoryColor: string;
  ctrBadge: string;
  ctrColor: string;
  duration: string;
  insightLeft: string;
  insightRight: string;
  insightRightColor: string;
  projectName: string;
  projectDot: string;
}

export interface CreateInspirationInput {
  thumbnailUrl: string;
  title?: string;
  hook?: string;
  channelName?: string;
  views?: string;
  sourceUrl?: string;
  type?: InspirationType;
  note?: string;
  duration?: string | null;
  estimated_ctr?: string | null;
  estimatedCtr?: string | null;
  insight_left?: string | null;
  insightLeft?: string | null;
  insight_right?: string | null;
  insightRight?: string | null;
  hook_type?: HookType | null;
  hookType?: string | null;
  hook_formula?: string | null;
  hookFormula?: string | null;
  triggered_emotion?: TriggeredEmotion | null;
  triggeredEmotion?: string | null;
  strength_score?: number | null;
  strengthScore?: number | null;
  score_reason?: string | null;
  scoreReason?: string | null;
  improvements?: string[] | null;
  title_variants?: string[] | null;
  titleVariants?: string[] | null;
  recreation_ideas?: string[] | null;
  recreationIdeas?: string[] | null;
  risk_flags?: RiskFlag[] | null;
  riskFlags?: string[] | null;
  is_outlier?: boolean | null;
  isOutlier?: boolean | null;
  multiplier?: string | null;
  projects?: Array<{
    projectId: string;
    note?: string;
    favorite?: boolean;
  }>;
}

export interface TagInspirationInput {
  inspirationId: string;
  projectId: string;
  note?: string;
  favorite?: boolean;
}

import type {
  SubjectMode,
  ThumbnailPromptConcept,
} from "@/lib/thumbnail-prompt/schema";

export type { SubjectMode, ThumbnailPromptConcept };

export interface ThumbnailConceptOption {
  id: number;
  key: string;
  name: string;
  trigger: string;
  mechanism: string;
  description: string;
  exampleAngle: string;
}

export interface GenerateThumbnailPromptRequest {
  topic: string;
  hook?: string;
  channelName?: string;
  subject?: SubjectMode;
  channelFormula?: string;
  style?:
    | "cinematic"
    | "hyper_realistic"
    | "illustrative_3d"
    | "minimalist_bold";
  optionIndex?: number;
}

export interface GenerateThumbnailPromptResponse {
  concepts: ThumbnailPromptConcept[];
  concept?: ThumbnailPromptConcept;
  providerUsed?: string;
}

export interface ThumbnailPromptConcept {
  id: string;
  conceptName: string;
  thumbnailCopy?: string;
  visualAnalogy?: string;
  colorScheme?: string;
  prompt: string;
  psychologicalAngle: string;
  squintTestFeature: string;
  ruleOfThreeBreakdown: {
    anchor: string;
    context: string;
    accent: string;
  };
}

export interface GenerateThumbnailPromptRequest {
  topic: string;
  hook?: string;
  channelName?: string;
  style?:
    | "cinematic"
    | "hyper_realistic"
    | "illustrative_3d"
    | "minimalist_bold";
}

export interface GenerateThumbnailPromptResponse {
  concepts: ThumbnailPromptConcept[];
  providerUsed: string;
}

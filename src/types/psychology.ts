export interface TitleTensionAnalysis {
  hasCuriosityGap: boolean;
  hasLossAversion: boolean;
  hasExtremeStakes: boolean;
  detectedTriggers: string[];
  tensionLevel: "Low" | "Moderate" | "High";
  suggestions: Array<{
    id: string;
    label: string;
    title: string;
    psychologicalAngle: string;
  }>;
}

export interface HookPacingMetrics {
  wordCount: number;
  spokenSeconds: number;
  pacingStatus: "optimal" | "caution" | "warning";
  statusText: string;
}

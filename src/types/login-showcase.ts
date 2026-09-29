export interface LoginShowcaseImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  label: string;
}

export interface LoginShowcaseHook {
  label: string;
  window: string;
  score: number;
  max: number;
  note: string;
}

export interface LoginShowcaseOutlier {
  multiplier: string;
  context: string;
}

export interface LoginShowcaseCropGuide {
  label: string;
}

export interface LoginShowcaseData {
  headlineLead: string;
  headlineTail: string;
  summary: string;
  disclaimer: string;
  thumbnailTitleKicker: string;
  thumbnailTitle: string;
  primary: LoginShowcaseImage;
  alternate: LoginShowcaseImage;
  hook: LoginShowcaseHook;
  outlier: LoginShowcaseOutlier;
  cropGuide: LoginShowcaseCropGuide;
}

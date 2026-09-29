import type { LoginShowcaseData } from "@/types/login-showcase";

export const LOGIN_SHOWCASE = {
  headlineLead: "Find the content",
  headlineTail: "worth shipping.",
  summary:
    "Save the thumbnails, hooks and title formulas behind outlier videos, then tag them to the projects you're producing next.",
  disclaimer: "Illustrative workspace preview",
  thumbnailTitleKicker: "I tested",
  thumbnailTitle: "100 hooks",
  primary: {
    src: "/images/login/specimen-reaction.jpg",
    alt: "Presenter with a wide-eyed shocked reaction against a chalkboard, used as a sample thumbnail. Photo by Andrea Piacquadio on Pexels",
    width: 1280,
    height: 920,
    label: "Variant A",
  },
  alternate: {
    src: "/images/login/specimen-alt.jpg",
    alt: "Close-up of a surprised face on a black background, used as an alternate thumbnail crop. Photo by Engin Akyurt on Pexels",
    width: 800,
    height: 600,
    label: "Variant B",
  },
  hook: {
    label: "Hook strength",
    window: "First 5 seconds",
    score: 8,
    max: 10,
    note: "Opens on the result, not the setup.",
  },
  outlier: {
    multiplier: "12.4×",
    context: "vs channel average",
  },
  cropGuide: {
    label: "Face fills 31% of frame",
  },
} as const satisfies LoginShowcaseData;

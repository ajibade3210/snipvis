import type { ThumbnailConceptOption } from "@/types/thumbnail-prompt";

export const THUMBNAIL_CONCEPT_OPTIONS: readonly ThumbnailConceptOption[] = [
  {
    id: 1,
    key: "curiosity_gap",
    name: "Curiosity Gap",
    trigger: "Curiosity / Intrigue",
    mechanism: "OPEN LOOP",
    description:
      "Withholds the key payoff to provoke an irresistible question.",
    exampleAngle: "Withhold the one detail that resolves the title's tension.",
  },
  {
    id: 2,
    key: "belief_violation",
    name: "Belief Violation",
    trigger: "Controversy / Surprise",
    mechanism: "CONTRARIAN",
    description:
      "Attacks a conventional belief or rule that viewers take for granted.",
    exampleAngle:
      "Directly contradict conventional advice or standard practice.",
  },
  {
    id: 3,
    key: "high_stakes",
    name: "High Stakes",
    trigger: "Urgency / Loss Aversion",
    mechanism: "LOSS FRAMING",
    description:
      "Makes scrolling past feel costly with concrete numbers or threat.",
    exampleAngle:
      "Highlight immediate risk, status threat, or extreme before/after.",
  },
] as const;

export const DEFAULT_THUMBNAIL_CONCEPT_OPTION = THUMBNAIL_CONCEPT_OPTIONS[0];

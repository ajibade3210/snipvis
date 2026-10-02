import { THUMBNAIL_CONCEPT_OPTIONS } from "@/constants/thumbnail-options";
import { SYSTEM_PROMPT } from "@/constants/thumbnail-system-prompt";
import type { SubjectMode } from "./schema";

export interface ThumbnailPromptInput {
  topic: string;
  hook?: string;
  style?: string;
  subject: SubjectMode;
  channelFormula?: string;
  optionIndex?: number;
}

export interface ChatMessage {
  role: "system" | "user";
  content: string;
}

export function buildMessages(
  input: ThumbnailPromptInput,
  feedback: string[] = [],
): ChatMessage[] {
  const selectedOption =
    THUMBNAIL_CONCEPT_OPTIONS.find((opt) => opt.id === input.optionIndex) ||
    THUMBNAIL_CONCEPT_OPTIONS[0];

  const sections = [
    `VIDEO TITLE:\n${input.topic.trim()}`,
    `VIDEO HOOK:\n${input.hook?.trim() || "none provided"}`,
    `SUBJECT MODE:\n${input.subject}`,
    `CHANNEL FORMULA:\n${input.channelFormula?.trim() || "none provided"}`,
    `VISUAL STYLE:\n${input.style?.trim() || "cinematic"}`,
    `CONCEPT OPTION / STRATEGIC ANGLE:\nOption ${selectedOption.id}: ${selectedOption.name} (Mechanism: ${selectedOption.mechanism})\nStrategy: ${selectedOption.description}\nTarget Angle: ${selectedOption.exampleAngle}`,
  ];

  if (feedback.length > 0) {
    const feedbackLines = feedback.map((p) => `- ${p}`);
    sections.push(
      `YOUR PREVIOUS ANSWER WAS REJECTED. Fix every problem below and return the complete JSON object again:\n${feedbackLines.join("\n")}`,
    );
  }

  return [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: sections.join("\n\n") },
  ];
}

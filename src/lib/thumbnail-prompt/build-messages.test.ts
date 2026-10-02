import { describe, expect, it } from "vitest";
import { buildMessages } from "./build-messages";

describe("buildMessages", () => {
  it("uses default values for missing hook, formula, and style, and omits channelName", () => {
    const input = {
      topic: "How To Build Software",
      subject: "generic-character" as const,
    };

    const messages = buildMessages(input);
    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe("system");
    expect(messages[1].role).toBe("user");

    const userContent = messages[1].content;
    expect(userContent).toContain("VIDEO TITLE:\nHow To Build Software");
    expect(userContent).toContain("VIDEO HOOK:\nnone provided");
    expect(userContent).toContain("SUBJECT MODE:\ngeneric-character");
    expect(userContent).toContain("CHANNEL FORMULA:\nnone provided");
    expect(userContent).toContain("VISUAL STYLE:\ncinematic");

    // Ensure channelName is never sent
    expect(userContent.toLowerCase()).not.toContain("channelname");
  });

  it("appends feedback block when previous answer was rejected", () => {
    const input = {
      topic: "How To Build Software",
      subject: "no-face" as const,
      hook: "90% of builders fail",
      channelFormula: "Minimal chiaroscuro",
      style: "hyper_realistic",
    };

    const feedback = [
      'Concept 1: thumbnailCopy "INSANE" contains prohibited hype filler "insane".',
      'Concept 2 repeats title keyword stem "software".',
    ];

    const messages = buildMessages(input, feedback);
    const userContent = messages[1].content;

    expect(userContent).toContain(
      "YOUR PREVIOUS ANSWER WAS REJECTED. Fix every problem below and return the complete JSON object again:",
    );
    expect(userContent).toContain(
      '- Concept 1: thumbnailCopy "INSANE" contains prohibited hype filler "insane".',
    );
    expect(userContent).toContain(
      '- Concept 2 repeats title keyword stem "software".',
    );
  });
});

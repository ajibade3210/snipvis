import { describe, expect, it } from "vitest";
import { findRuleViolations } from "./rules";
import type { ThumbnailPromptConcept } from "./schema";

function makeConcept(
  id: string,
  thumbnailCopy: string,
  emotionalTrigger: string,
): ThumbnailPromptConcept {
  return {
    id,
    conceptName: `Concept ${id}`,
    emotionalTrigger,
    thumbnailCopy,
    copyMechanism: "BELIEF VIOLATION",
    visualAnalogy: "A physical titanium card snapped in half",
    colorScheme: "Studio Black and Acid Lime",
    prompt: "Studio photograph of a titanium card with directional lighting",
    psychologicalAngle: "Controversy",
    squintTestFeature: "High luminance contrast",
    ruleOfThreeBreakdown: {
      anchor: "Titanium card",
      context: "Cold concrete",
      accent: "Bold lime text",
    },
    honestyCheck: "Delivers promised breakdown",
    pitfallToAvoid: "Overcomplicating the lighting",
    sensitiveTopicNote: null,
  };
}

describe("findRuleViolations", () => {
  it("detects when thumbnailCopy repeats a significant stem from the title", () => {
    const concepts = [
      makeConcept("1", "THE HOUSING TRAP", "fear"),
      makeConcept("2", "WALK AWAY NOW", "relief"),
      makeConcept("3", "TOO LATE ALREADY", "urgency"),
    ];

    const violations = findRuleViolations(
      concepts,
      "Why The Housing Market Is Freezing",
    );

    expect(violations.length).toBeGreaterThan(0);
    expect(violations.some((v) => v.includes("housing"))).toBe(true);
  });

  it("detects title word stem repetition with plural/singular variants", () => {
    const concepts = [
      makeConcept("1", "YOUR HABIT FAILS", "curiosity"),
      makeConcept("2", "WALK AWAY NOW", "relief"),
      makeConcept("3", "TOO LATE ALREADY", "urgency"),
    ];

    const violations = findRuleViolations(concepts, "How To Fix Atomic Habits");

    expect(violations.length).toBeGreaterThan(0);
    expect(violations.some((v) => v.includes("habit"))).toBe(true);
  });

  it("detects bad word counts (less than 2 or greater than 5)", () => {
    const tooShort = [
      makeConcept("1", "RUN", "fear"),
      makeConcept("2", "DO NOT LOOK", "curiosity"),
      makeConcept("3", "START OVER TODAY", "relief"),
    ];
    const shortViolations = findRuleViolations(tooShort, "Untold Truth");
    expect(
      shortViolations.some((v) => v.includes("RUN") && v.includes("1 words")),
    ).toBe(true);

    const tooLong = [
      makeConcept("1", "THIS IS WAY TOO MANY WORDS HERE", "fear"),
      makeConcept("2", "DO NOT LOOK", "curiosity"),
      makeConcept("3", "START OVER TODAY", "relief"),
    ];
    const longViolations = findRuleViolations(tooLong, "Untold Truth");
    expect(longViolations.some((v) => v.includes("7 words"))).toBe(true);
  });

  it("detects prohibited hype filler words case-insensitively", () => {
    const hypeConcepts = [
      makeConcept("1", "INSANE NEW SECRET", "shock"),
      makeConcept("2", "DO NOT LOOK", "curiosity"),
      makeConcept("3", "START OVER TODAY", "relief"),
    ];

    const violations = findRuleViolations(hypeConcepts, "Untold Truth");
    expect(violations.some((v) => v.includes("insane"))).toBe(true);
  });

  it("detects duplicate copy or emotional triggers across concepts", () => {
    const duplicateCopy = [
      makeConcept("1", "DO NOT LOOK", "curiosity"),
      makeConcept("2", "do not look", "fear"),
      makeConcept("3", "START OVER TODAY", "relief"),
    ];
    const copyViolations = findRuleViolations(duplicateCopy, "Untold Truth");
    expect(
      copyViolations.some((v) => v.includes("duplicate thumbnailCopy")),
    ).toBe(true);

    const duplicateTrigger = [
      makeConcept("1", "DO NOT LOOK", "curiosity"),
      makeConcept("2", "WALK AWAY NOW", "Curiosity"),
      makeConcept("3", "START OVER TODAY", "relief"),
    ];
    const triggerViolations = findRuleViolations(
      duplicateTrigger,
      "Untold Truth",
    );
    expect(
      triggerViolations.some((v) => v.includes("duplicate emotionalTrigger")),
    ).toBe(true);
  });

  it("passes valid concepts with no violations", () => {
    const validConcepts = [
      makeConcept("1", "HIRING WAS WRONG", "controversy"),
      makeConcept("2", "YOUR 3PM CRASH", "curiosity"),
      makeConcept("3", "DAY 1 TO 90", "aspiration"),
    ];

    const violations = findRuleViolations(
      validConcepts,
      "How I Scaled My Company Without Employees",
    );
    expect(violations).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import { parseConcepts } from "./parse-concepts";

const validRawConcept = (id: string, copy: string, trigger: string) => ({
  id,
  conceptName: `Concept ${id}`,
  emotionalTrigger: trigger,
  thumbnailCopy: copy,
  copyMechanism: "BELIEF VIOLATION",
  visualAnalogy: "Shattered hourglass",
  colorScheme: "Studio Black",
  prompt:
    "Studio photograph of a dramatic hourglass on a dark reflective surface with directional rim lighting",
  psychologicalAngle: "Curiosity Gap",
  squintTestFeature: "High contrast lighting",
  ruleOfThreeBreakdown: {
    anchor: "Hourglass",
    context: "Shadowed room",
    accent: "White typography",
  },
  honestyCheck: "Accurately represents video pacing",
  pitfallToAvoid: "Too busy background",
  sensitiveTopicNote: null,
});

describe("parseConcepts", () => {
  it("parses single concept object with think tags and strips them cleanly", () => {
    const rawPayload = `
<think>
Evaluating title and formulating concepts...
</think>
\`\`\`json
${JSON.stringify(validRawConcept("concept-1", "STOP OVERPAYING NOW", "relief"))}
\`\`\`
`;

    const result = parseConcepts(rawPayload, "The Ultimate Tech Guide");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.concepts).toHaveLength(1);
      expect(result.concepts[0].thumbnailCopy).toBe("STOP OVERPAYING NOW");
      expect(result.concepts[0].prompt).toBe(
        "Studio photograph of a dramatic hourglass on a dark reflective surface with directional rim lighting",
      );
    }
  });

  it("parses concepts wrapped in an array or concept object", () => {
    const rawArrayPayload = JSON.stringify({
      concepts: [validRawConcept("concept-1", "STOP OVERPAYING NOW", "relief")],
    });

    const arrayResult = parseConcepts(
      rawArrayPayload,
      "The Ultimate Tech Guide",
    );
    expect(arrayResult.ok).toBe(true);
    if (arrayResult.ok) {
      expect(arrayResult.concepts).toHaveLength(1);
      expect(arrayResult.concepts[0].thumbnailCopy).toBe("STOP OVERPAYING NOW");
    }

    const rawWrappedPayload = JSON.stringify({
      concept: validRawConcept("concept-2", "WALK AWAY TODAY", "fear"),
    });

    const wrappedResult = parseConcepts(
      rawWrappedPayload,
      "The Ultimate Tech Guide",
    );
    expect(wrappedResult.ok).toBe(true);
    if (wrappedResult.ok) {
      expect(wrappedResult.concepts).toHaveLength(1);
      expect(wrappedResult.concepts[0].thumbnailCopy).toBe("WALK AWAY TODAY");
    }
  });

  it("returns an error problem when JSON is invalid or missing braces", () => {
    const result = parseConcepts("Some random text without braces", "Title");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.problems).toContain("The response was not valid JSON.");
    }
  });

  it("returns validation problems when schema fields are missing or empty", () => {
    const brokenPayload = JSON.stringify({
      ...validRawConcept("concept-1", "", "relief"), // Empty copy
    });

    const result = parseConcepts(brokenPayload, "The Ultimate Tech Guide");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.problems.length).toBeGreaterThan(0);
    }
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ThumbnailGenerationError,
  generateConcepts,
} from "./generate-concepts";

const makeValidConceptJson = (id: string, copy: string, trigger: string) => ({
  id,
  conceptName: `Concept ${id}`,
  emotionalTrigger: trigger,
  thumbnailCopy: copy,
  copyMechanism: "BELIEF VIOLATION",
  visualAnalogy: "A shattered hourglass",
  colorScheme: "Studio Black and Acid Lime",
  prompt: "A dramatic hourglass scene with directional rim lighting",
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

describe("generateConcepts", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, DEEPSEEK_API_KEY: "test-key" };
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("retries with feedback when the first attempt fails rules, and succeeds on second attempt", async () => {
    const invalidAttemptJson = JSON.stringify(
      makeValidConceptJson("concept-1", "INSANE NEW WAY", "fear"), // hype word "insane"
    );

    const validAttemptJson = JSON.stringify(
      makeValidConceptJson("concept-1", "THE HIDDEN COST", "fear"),
    );

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: invalidAttemptJson } }],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: validAttemptJson } }],
        }),
      });

    vi.stubGlobal("fetch", fetchMock);

    const concepts = await generateConcepts({
      topic: "Future of AI",
      subject: "generic-character",
      optionIndex: 1,
    });

    expect(concepts).toHaveLength(1);
    expect(concepts[0].thumbnailCopy).toBe("THE HIDDEN COST");
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // Verify request payload used response_format json_object and omitted hardcoded max_tokens
    const firstCallBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(firstCallBody.response_format).toEqual({ type: "json_object" });
    expect(firstCallBody.max_tokens).toBeUndefined();

    // Verify the second fetch contained feedback
    const secondCallBody = JSON.parse(fetchMock.mock.calls[1][1].body);
    const userMessage = secondCallBody.messages.find(
      (m: { role: string }) => m.role === "user",
    )?.content;

    expect(userMessage).toContain("YOUR PREVIOUS ANSWER WAS REJECTED");
    expect(userMessage).toContain("insane");
  });

  it("throws ThumbnailGenerationError with status 502 after 2 failed attempts", async () => {
    const invalidAttemptJson = JSON.stringify(
      makeValidConceptJson("concept-1", "INSANE NEW WAY", "fear"),
    );

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: invalidAttemptJson } }],
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      generateConcepts({
        topic: "Future of AI",
        subject: "generic-character",
      }),
    ).rejects.toThrow(
      new ThumbnailGenerationError(
        "Could not generate concepts that meet the thumbnail rules.",
        502,
      ),
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("throws ThumbnailGenerationError with status 503 when API key is missing", async () => {
    process.env.DEEPSEEK_API_KEY = "";
    process.env.OPENROUTER_API_KEY = "";

    await expect(
      generateConcepts({
        topic: "Future of AI",
        subject: "generic-character",
      }),
    ).rejects.toThrow(
      new ThumbnailGenerationError("AI provider is not configured.", 503),
    );
  });
});

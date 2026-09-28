import { generateHookPlaceholderSvg } from "@/lib/svg-placeholder";
import type { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST as analyzeHookRoute } from "./route";

describe("Analyze Hook API Route Handler", () => {
  const originalApiKey = process.env.DEEPSEEK_API_KEY;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env.DEEPSEEK_API_KEY = originalApiKey;
  });

  it("returns 500 when DEEPSEEK_API_KEY is not configured", async () => {
    process.env.DEEPSEEK_API_KEY = "";

    const fakeReq = new Request("http://localhost:3000/api/analyze-hook", {
      method: "POST",
      body: JSON.stringify({
        inputType: "text",
        manualText: "Why 99% of creators fail in the first 30 seconds",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await analyzeHookRoute(fakeReq as unknown as NextRequest);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain("DEEPSEEK_API_KEY is not configured");
  });

  it("rejects invalid request payloads with 400", async () => {
    process.env.DEEPSEEK_API_KEY = "test-key";

    const fakeReq = new Request("http://localhost:3000/api/analyze-hook", {
      method: "POST",
      body: JSON.stringify({ inputType: "invalid-type" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await analyzeHookRoute(fakeReq as unknown as NextRequest);
    expect(res.status).toBe(400);
  });

  it("rejects image analysis when using text-only DeepSeek provider", async () => {
    process.env.DEEPSEEK_API_KEY = "sk-test-deepseek-key";

    const fakeReq = new Request("http://localhost:3000/api/analyze-hook", {
      method: "POST",
      body: JSON.stringify({
        inputType: "image",
        imageBase64:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await analyzeHookRoute(fakeReq as unknown as NextRequest);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain(
      "Thumbnail visual analysis is not supported with DeepSeek",
    );
  });

  it("successfully parses 11-field DeepSeek JSON response with markdown code fences and provides fallback SVG", async () => {
    process.env.DEEPSEEK_API_KEY = "sk-test-deepseek-key";

    const mockAiResponse = {
      choices: [
        {
          message: {
            content: `\`\`\`json
{
  "perceived_copy": "I Survived 100 Hours In A Supermax Vault",
  "hook_type": "challenge",
  "why_it_works": "Extreme stakes combined with a ticking countdown trigger high curiosity and empathy.",
  "triggered_emotion": "Curiosity",
  "hook_formula": "I Survived [number] Hours In [extreme place]",
  "strength_score": 9,
  "score_reason": "High-stakes challenge with an immediate open loop.",
  "improvements": ["Highlight the exact penalty of failing earlier"],
  "title_variants": [
    "I Spent 100 Hours In An Abandoned Supermax Prison",
    "Trapped For 100 Hours In The World's Heaviest Vault",
    "Can Anyone Survive 100 Hours Locked in a Bunker?"
  ],
  "recreation_ideas": [
    "I Spent 50 Hours In Complete Digital Isolation",
    "I Survived 24 Hours Inside a Subzero Freezer",
    "Can A Pro Gamer Survive 100 Hours Playing Only Retro Games?"
  ],
  "risk_flags": ["clickbait"]
}
\`\`\``,
          },
        },
      ],
    };

    // Mock global fetch for DeepSeek API
    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes("api.deepseek.com")) {
        return {
          ok: true,
          status: 200,
          json: async () => mockAiResponse,
          text: async () => JSON.stringify(mockAiResponse),
        };
      }
      return { ok: false, status: 404 };
    });

    const fakeReq = new Request("http://localhost:3000/api/analyze-hook", {
      method: "POST",
      body: JSON.stringify({
        inputType: "text",
        manualText: "I Survived 100 Hours In A Supermax Vault",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await analyzeHookRoute(fakeReq as unknown as NextRequest);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.perceived_copy).toBe(
      "I Survived 100 Hours In A Supermax Vault",
    );
    expect(data.hook_type).toBe("challenge");
    expect(data.triggered_emotion).toBe("Curiosity");
    expect(data.why_it_works).toContain("Extreme stakes");
    expect(data.hook_formula).toBe(
      "I Survived [number] Hours In [extreme place]",
    );
    expect(data.strength_score).toBe(9);
    expect(data.score_reason).toContain("High-stakes challenge");
    expect(data.improvements).toHaveLength(1);
    expect(data.title_variants).toHaveLength(3);
    expect(data.recreation_ideas).toHaveLength(3);
    expect(data.risk_flags).toEqual(["clickbait"]);
    expect(data.thumbnailUrl).toContain("data:image/svg+xml;base64,");
  });

  it("generates a valid SVG data URI placeholder for text-only hooks", () => {
    const svgDataUri = generateHookPlaceholderSvg(
      "Test Retention Hook",
      "Curiosity",
    );
    expect(svgDataUri).toContain("data:image/svg+xml;base64,");
    const base64Part = svgDataUri.split(",")[1];
    const decoded = Buffer.from(base64Part, "base64").toString("utf-8");
    expect(decoded).toContain("<svg");
    expect(decoded).toContain("Test Retention Hook");
    expect(decoded).toContain("CURIOSITY");
  });
});

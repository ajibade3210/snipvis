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

  it("successfully parses DeepSeek JSON response with markdown code fences and provides fallback SVG", async () => {
    process.env.DEEPSEEK_API_KEY = "sk-test-deepseek-key";

    const mockAiResponse = {
      choices: [
        {
          message: {
            content: `\`\`\`json
{
  "perceived_copy": "I Survived 100 Hours In A Supermax Vault",
  "why_it_works": "Extreme stakes combined with a ticking countdown trigger high curiosity and empathy.",
  "triggered_emotion": "Curiosity",
  "recreation_ideas": [
    "Swap physical vault for an extreme digital detox bunker",
    "Use a split screen with a live heart rate monitor",
    "Start immediately with the consequence of failing"
  ]
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
    expect(data.triggered_emotion).toBe("Curiosity");
    expect(data.why_it_works).toContain("Extreme stakes");
    expect(data.recreation_ideas).toHaveLength(3);
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

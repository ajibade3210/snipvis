import type { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/session", () => ({
  requireUser: vi
    .fn()
    .mockResolvedValue({ id: "user-123", email: "user@test.com" }),
}));

import { POST as channelRoute } from "./route";

describe("YouTube Channel Metadata API Route", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects missing url payload with 400", async () => {
    const fakeReq = new Request("http://localhost:3000/api/youtube/channel", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });

    const res = await channelRoute(fakeReq as unknown as NextRequest);
    expect(res.status).toBe(400);
  });

  it("resolves channel from a YouTube video URL using oEmbed", async () => {
    const mockOembed = {
      title: "How I Built A 10M Channel",
      author_name: "Creator Studio",
      author_url: "https://www.youtube.com/@creatorstudio",
      thumbnail_url: "https://img.youtube.com/vi/abc12345678/hqdefault.jpg",
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("oembed")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockOembed),
          });
        }
        return Promise.resolve({
          ok: true,
          text: () =>
            Promise.resolve(
              '<html><head><meta property="og:title" content="Creator Studio"><meta property="og:image" content="https://avatar.jpg"><meta itemprop="channelId" content="UC1234567890123456789012"></head></html>',
            ),
        });
      }),
    );

    const fakeReq = new Request("http://localhost:3000/api/youtube/channel", {
      method: "POST",
      body: JSON.stringify({
        url: "https://www.youtube.com/watch?v=abc12345678",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await channelRoute(fakeReq as unknown as NextRequest);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.channelName).toBe("Creator Studio");
    expect(data.channelUrl).toBe("https://www.youtube.com/@creatorstudio");
    expect(data.mostPopularVideoTitle).toBe("How I Built A 10M Channel");
  });

  it("normalizes @handle and parses channel metadata", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("videos.xml")) {
          return Promise.resolve({
            ok: true,
            text: () =>
              Promise.resolve(`
                <feed xmlns="http://www.w3.org/2005/Atom">
                  <title>Veritasium</title>
                  <entry>
                    <title>Recent Video 1</title>
                    <published>2026-09-28T10:00:00+00:00</published>
                    <link rel="alternate" href="https://youtube.com/watch?v=1111"/>
                  </entry>
                  <entry>
                    <title>Recent Video 2</title>
                    <published>2026-09-25T10:00:00+00:00</published>
                    <link rel="alternate" href="https://youtube.com/watch?v=2222"/>
                  </entry>
                </feed>
              `),
          });
        }
        return Promise.resolve({
          ok: true,
          text: () =>
            Promise.resolve(`
              <html>
                <head>
                  <meta property="og:title" content="Veritasium">
                  <meta property="og:image" content="https://yt3.ggpht.com/avatar.jpg">
                  <meta property="og:description" content="Science and engineering videos.">
                  <meta itemprop="channelId" content="UCHnyfMqiRRG1u-2MsSQLbXA">
                </head>
                <body>
                  <script>{"label":"17.2M subscribers"}</script>
                </body>
              </html>
            `),
        });
      }),
    );

    const fakeReq = new Request("http://localhost:3000/api/youtube/channel", {
      method: "POST",
      body: JSON.stringify({ url: "@veritasium" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await channelRoute(fakeReq as unknown as NextRequest);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.channelName).toBe("Veritasium");
    expect(data.avatarUrl).toBe("https://yt3.ggpht.com/avatar.jpg");
    expect(data.description).toBe("Science and engineering videos.");
    expect(data.subscriberCount).toBe("17.2M");
    expect(data.uploadFrequency).toBeDefined();
    expect(data.lastUploadDate).toBe("2026-09-28T10:00:00+00:00");
  });
});

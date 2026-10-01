import type { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/session", () => ({
  requireUser: vi
    .fn()
    .mockResolvedValue({ id: "user-123", email: "user@test.com" }),
}));

import { POST as channelRoute } from "./route";

describe("YouTube Channel Metadata API Route", () => {
  const originalApiKey = process.env.YOUTUBE_API_KEY;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.YOUTUBE_API_KEY = undefined;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalApiKey) {
      process.env.YOUTUBE_API_KEY = originalApiKey;
    } else {
      process.env.YOUTUBE_API_KEY = undefined;
    }
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

  it("extracts deep metadata via official YouTube Data API v3", async () => {
    process.env.YOUTUBE_API_KEY = "mock-api-key";
    const mockChannelResponse = {
      items: [
        {
          id: "UC_x5XG1OV2P6uZZ5FSM9Ttw",
          snippet: {
            title: "Google Developers",
            description: "The official Google Developers channel.",
            customUrl: "@googledevelopers",
            publishedAt: "2007-08-23T00:34:43Z",
            country: "US",
            thumbnails: {
              high: { url: "https://yt3.ggpht.com/google_devs.jpg" },
            },
          },
          statistics: {
            viewCount: "215000000",
            subscriberCount: "2300000",
            hiddenSubscriberCount: false,
            videoCount: "5420",
          },
          contentDetails: {
            relatedPlaylists: {
              uploads: "UU_x5XG1OV2P6uZZ5FSM9Ttw",
            },
          },
          brandingSettings: {
            channel: {
              keywords:
                '"google developer" "android" web chrome "cloud computing"',
            },
          },
        },
      ],
    };

    const mockPlaylistResponse = {
      items: [
        {
          snippet: {
            publishedAt: "2026-09-30T12:00:00Z",
            resourceId: { videoId: "vid1" },
          },
        },
        {
          snippet: {
            publishedAt: "2026-09-26T12:00:00Z",
            resourceId: { videoId: "vid2" },
          },
        },
      ],
    };

    const mockVideosResponse = {
      items: [
        {
          id: "vid1",
          snippet: {
            title: "What is New in AI",
            thumbnails: { high: { url: "https://img.youtube.com/thumb1.jpg" } },
          },
          statistics: { viewCount: "85000" },
        },
        {
          id: "vid2",
          snippet: {
            title: "Building with Next.js & Google Cloud",
            thumbnails: { high: { url: "https://img.youtube.com/thumb2.jpg" } },
          },
          statistics: { viewCount: "250000" },
        },
      ],
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("/channels?")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockChannelResponse),
          });
        }
        if (url.includes("/playlistItems?")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockPlaylistResponse),
          });
        }
        if (url.includes("/videos?")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockVideosResponse),
          });
        }
        return Promise.resolve({ ok: false });
      }),
    );

    const fakeReq = new Request("http://localhost:3000/api/youtube/channel", {
      method: "POST",
      body: JSON.stringify({
        url: "https://www.youtube.com/@googledevelopers",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await channelRoute(fakeReq as unknown as NextRequest);
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.channelName).toBe("Google Developers");
    expect(data.customUrl).toBe("@googledevelopers");
    expect(data.subscriberCount).toBe("2.3M");
    expect(data.totalViewCount).toBe("215M");
    expect(data.videoCount).toBe(5420);
    expect(data.country).toBe("US");
    expect(data.keywords).toEqual([
      "google developer",
      "android",
      "web",
      "chrome",
      "cloud computing",
    ]);
    expect(data.mostPopularVideoTitle).toBe(
      "Building with Next.js & Google Cloud",
    );
    expect(data.mostPopularVideoViews).toBe("250K");
  });
});

import { handleApiError } from "@/lib/api-error";
import { requireUser } from "@/lib/session";
import { computeUploadFrequency } from "@/lib/upload-frequency";
import { fetchYoutubeChannelSchema } from "@/lib/validations";
import type { YoutubeChannelMeta } from "@/types/youtube-channel";
import { type NextRequest, NextResponse } from "next/server";

function decodeHtml(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s*-\s*YouTube$/i, "")
    .trim();
}

function normalizeYoutubeUrl(raw: string): {
  normalizedUrl: string;
  isVideo: boolean;
} {
  const trimmed = raw.trim();
  if (trimmed.startsWith("@")) {
    return {
      normalizedUrl: `https://www.youtube.com/${trimmed}`,
      isVideo: false,
    };
  }

  const isVideo = /(?:v=|youtu\.be\/|youtube\.com\/shorts\/)/i.test(trimmed);
  let normalizedUrl = trimmed;
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    if (!normalizedUrl.includes("/") && !normalizedUrl.includes(".")) {
      normalizedUrl = `https://www.youtube.com/@${normalizedUrl}`;
    } else {
      normalizedUrl = `https://${normalizedUrl}`;
    }
  }

  return { normalizedUrl, isVideo };
}

function formatViews(count: number): string {
  if (count >= 1_000_000_000) {
    return `${(count / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
  }
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return count.toLocaleString();
}

async function fetchRssVideos(channelId: string) {
  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`;
    const res = await fetch(rssUrl, {
      headers: { "User-Agent": "Snipvis-Bot/1.0" },
      signal: AbortSignal.timeout(4000),
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const xml = await res.text();

    const publishedDates = [
      ...xml.matchAll(/<published>([^<]+)<\/published>/g),
    ].map((m) => m[1]);

    const titles = [...xml.matchAll(/<title>([^<]+)<\/title>/g)]
      .map((m) => decodeHtml(m[1]))
      .slice(1); // first title is channel title

    const links = [
      ...xml.matchAll(/<link rel="alternate" href="([^"]+)"\/>/g),
    ].map((m) => m[1]);

    const viewCounts = [...xml.matchAll(/<media:statistics\s+views="(\d+)"/g)]
      .map((m) => Number.parseInt(m[1], 10))
      .filter((n) => !Number.isNaN(n) && n > 0);

    return { publishedDates, titles, links, viewCounts };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireUser();
    const { url } = fetchYoutubeChannelSchema.parse(await req.json());
    const { normalizedUrl, isVideo } = normalizeYoutubeUrl(url);

    let channelName = "";
    let channelUrl = normalizedUrl;
    let avatarUrl: string | null = null;
    let description: string | null = null;
    let subscriberCount: string | null = null;
    let mostPopularVideoTitle: string | null = null;
    let mostPopularVideoUrl: string | null = null;
    let mostPopularVideoThumb: string | null = null;
    let channelId: string | null = null;
    let startedDate: string | null = null;

    if (isVideo) {
      // 1. Fetch video metadata via oEmbed
      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(normalizedUrl)}&format=json`;
        const oembedRes = await fetch(oembedUrl, {
          signal: AbortSignal.timeout(4000),
        });
        if (oembedRes.ok) {
          const oembed = await oembedRes.json();
          channelName = decodeHtml(oembed.author_name || "");
          channelUrl = oembed.author_url || normalizedUrl;
          mostPopularVideoTitle = decodeHtml(oembed.title || "");
          mostPopularVideoUrl = normalizedUrl;
          const videoIdMatch = normalizedUrl.match(
            /(?:v=|youtu\.be\/|shorts\/)([\w-]{11})/,
          );
          mostPopularVideoThumb = videoIdMatch?.[1]
            ? `https://img.youtube.com/vi/${videoIdMatch[1]}/maxresdefault.jpg`
            : oembed.thumbnail_url || null;
        }
      } catch {
        // Fall back gracefully
      }
    }

    // 2. Fetch Channel HTML page to extract avatar, description, channelId, and subscribers
    try {
      const channelPageRes = await fetch(channelUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
        signal: AbortSignal.timeout(4000),
      });

      if (channelPageRes.ok) {
        const html = await channelPageRes.text();

        // Extract channel name if not already resolved
        if (!channelName) {
          const ogTitleMatch = html.match(
            /<meta property="og:title" content="([^"]+)"/,
          );
          if (ogTitleMatch?.[1]) {
            channelName = decodeHtml(ogTitleMatch[1]);
          }
        }

        // Extract avatar
        const ogImageMatch = html.match(
          /<meta property="og:image" content="([^"]+)"/,
        );
        if (ogImageMatch?.[1]) {
          avatarUrl = ogImageMatch[1];
        }

        // Extract description
        const ogDescMatch = html.match(
          /<meta property="og:description" content="([^"]+)"/,
        );
        if (ogDescMatch?.[1]) {
          description = decodeHtml(ogDescMatch[1]);
        }

        // Extract channel ID
        const channelIdMatch =
          html.match(/<meta itemprop="channelId" content="([^"]+)"/) ||
          html.match(/"channelId":"(UC[\w-]{22})"/);
        if (channelIdMatch?.[1]) {
          channelId = channelIdMatch[1];
        }

        // Extract subscriber count from JSON
        const subMatch =
          html.match(/"label":"([\d.,KMB]+\s+subscribers?)"/i) ||
          html.match(/"simpleText":"([\d.,KMB]+\s+subscribers?)"/i);
        if (subMatch?.[1]) {
          subscriberCount = subMatch[1].replace(/subscribers?/i, "").trim();
        }

        // Extract channel joined / started date if present
        const startDateMatch =
          html.match(/<meta itemprop="startDate" content="([^"]+)"/) ||
          html.match(
            /"joinedDateText":\{"runs":\[\{"text":"Joined "\},\{"text":"([^"]+)"\}/i,
          );
        if (startDateMatch?.[1]) {
          const parsed = new Date(startDateMatch[1]);
          if (!Number.isNaN(parsed.getTime())) {
            startedDate = parsed.toISOString();
          }
        }
      }
    } catch {
      // Fall back if channel scraping is blocked
    }

    // 3. If channelId found, fetch public RSS to get recent video dates & compute cadence
    let lastUploadDate: string | null = null;
    let uploadFrequency: string | null = null;
    let avgViewCount: string | null = null;
    let recentUploadDates: string[] = [];

    if (channelId) {
      const rssData = await fetchRssVideos(channelId);
      if (rssData) {
        recentUploadDates = rssData.publishedDates;
        if (recentUploadDates.length > 0) {
          lastUploadDate = recentUploadDates[0];
          uploadFrequency = computeUploadFrequency(recentUploadDates);
        }
        if (rssData.viewCounts && rssData.viewCounts.length > 0) {
          const sum = rssData.viewCounts.reduce((a, b) => a + b, 0);
          const avg = Math.round(sum / rssData.viewCounts.length);
          avgViewCount = formatViews(avg);
        }
        if (!mostPopularVideoTitle && rssData.titles.length > 0) {
          mostPopularVideoTitle = rssData.titles[0];
          mostPopularVideoUrl = rssData.links[0] || null;
        }
      }
    }

    // Fallback: If channelName is still empty, derive clean name from URL
    if (!channelName) {
      const handleMatch = channelUrl.match(/@([\w.-]+)/);
      channelName = handleMatch?.[1] ? `@${handleMatch[1]}` : "YouTube Channel";
    }

    const result: YoutubeChannelMeta = {
      channelName,
      channelUrl,
      avatarUrl,
      description,
      subscriberCount,
      avgViewCount,
      lastUploadDate,
      uploadFrequency,
      mostPopularVideoTitle,
      mostPopularVideoUrl,
      mostPopularVideoThumb,
      startedDate,
      recentUploadDates,
    };

    return NextResponse.json(result);
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

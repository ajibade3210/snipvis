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

function tokenizeKeywords(raw?: string | null): string[] {
  if (!raw) return [];
  const matches = raw.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
  return matches
    .map((k) => k.replace(/^"|"$/g, "").trim())
    .filter((k) => k.length > 0);
}

interface ParsedUrlTarget {
  rawUrl: string;
  normalizedUrl: string;
  videoId: string | null;
  handle: string | null;
  channelId: string | null;
  customUsername: string | null;
}

function parseTargetUrl(raw: string): ParsedUrlTarget {
  let trimmed = raw.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    if (trimmed.startsWith("@")) {
      trimmed = `https://www.youtube.com/${trimmed}`;
    } else if (/^UC[\w-]{22}$/.test(trimmed)) {
      trimmed = `https://www.youtube.com/channel/${trimmed}`;
    } else {
      trimmed = `https://${trimmed}`;
    }
  }

  // Ensure HTTPS
  trimmed = trimmed.replace(/^http:\/\//i, "https://");

  let videoId: string | null = null;
  let handle: string | null = null;
  let channelId: string | null = null;
  let customUsername: string | null = null;

  // Video ID detection (watch?v=..., youtu.be/..., shorts/...)
  const videoMatch = trimmed.match(
    /(?:v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([\w-]{11})/i,
  );
  if (videoMatch?.[1]) {
    videoId = videoMatch[1];
  }

  // Handle detection (@...)
  const handleMatch = trimmed.match(/youtube\.com\/@([a-zA-Z0-9_.-]+)/i);
  if (handleMatch?.[1]) {
    handle = handleMatch[1];
  }

  // Channel ID detection (/channel/UC...)
  const channelMatch = trimmed.match(/youtube\.com\/channel\/(UC[\w-]{22})/i);
  if (channelMatch?.[1]) {
    channelId = channelMatch[1];
  }

  // Legacy user or /c/ detection
  const userMatch = trimmed.match(
    /youtube\.com\/(?:c|user)\/([a-zA-Z0-9_.-]+)/i,
  );
  if (userMatch?.[1]) {
    customUsername = userMatch[1];
  }

  return {
    rawUrl: raw,
    normalizedUrl: trimmed,
    videoId,
    handle,
    channelId,
    customUsername,
  };
}

/* ========================================================================= */
/* YOUTUBE DATA API V3 IMPLEMENTATION (Mattw.io Style)                       */
/* ========================================================================= */

interface YtApiChannelItem {
  id: string;
  snippet?: {
    title?: string;
    description?: string;
    customUrl?: string;
    publishedAt?: string;
    country?: string;
    thumbnails?: {
      high?: { url?: string };
      medium?: { url?: string };
      default?: { url?: string };
    };
  };
  statistics?: {
    viewCount?: string;
    subscriberCount?: string;
    hiddenSubscriberCount?: boolean;
    videoCount?: string;
  };
  contentDetails?: {
    relatedPlaylists?: {
      uploads?: string;
    };
  };
  brandingSettings?: {
    channel?: {
      keywords?: string;
    };
  };
  topicDetails?: {
    topicCategories?: string[];
  };
}

interface YtApiPlaylistItem {
  snippet?: {
    publishedAt?: string;
    resourceId?: {
      videoId?: string;
    };
  };
}

interface YtApiVideoItem {
  id: string;
  snippet?: {
    title?: string;
    channelId?: string;
    publishedAt?: string;
    thumbnails?: {
      maxres?: { url?: string };
      high?: { url?: string };
      default?: { url?: string };
    };
  };
  statistics?: {
    viewCount?: string;
  };
}

async function fetchViaYoutubeApiV3(
  parsed: ParsedUrlTarget,
  apiKey: string,
): Promise<YoutubeChannelMeta | null> {
  try {
    let resolvedChannelId = parsed.channelId;
    let initialVideoInfo: {
      title?: string;
      url?: string;
      thumb?: string;
      views?: string;
    } | null = null;

    // 1. If target is a video URL, query video details first to resolve channelId
    if (parsed.videoId) {
      const videoRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${encodeURIComponent(parsed.videoId)}&key=${encodeURIComponent(apiKey)}`,
        { signal: AbortSignal.timeout(6000) },
      );
      if (videoRes.ok) {
        const videoData = (await videoRes.json()) as {
          items?: YtApiVideoItem[];
        };
        const item = videoData.items?.[0];
        if (item) {
          resolvedChannelId = item.snippet?.channelId || null;
          const vCount = item.statistics?.viewCount
            ? Number.parseInt(item.statistics.viewCount, 10)
            : null;
          initialVideoInfo = {
            title: item.snippet?.title
              ? decodeHtml(item.snippet.title)
              : undefined,
            url: `https://www.youtube.com/watch?v=${item.id}`,
            thumb:
              item.snippet?.thumbnails?.maxres?.url ||
              item.snippet?.thumbnails?.high?.url ||
              `https://img.youtube.com/vi/${item.id}/maxresdefault.jpg`,
            views: vCount !== null ? formatViews(vCount) : undefined,
          };
        }
      }
    }

    // 2. Query Channel Details via appropriate parameter
    const params = new URLSearchParams({
      part: "snippet,statistics,contentDetails,brandingSettings,topicDetails",
      key: apiKey,
    });

    if (resolvedChannelId) {
      params.set("id", resolvedChannelId);
    } else if (parsed.handle) {
      params.set("forHandle", parsed.handle);
    } else if (parsed.customUsername) {
      params.set("forUsername", parsed.customUsername);
    } else {
      // Fallback: search by query
      return null;
    }

    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?${params.toString()}`,
      { signal: AbortSignal.timeout(6000) },
    );

    if (!channelRes.ok) {
      return null;
    }

    const channelJson = (await channelRes.json()) as {
      items?: YtApiChannelItem[];
    };
    const ch = channelJson.items?.[0];
    if (!ch) return null;

    const channelName = ch.snippet?.title
      ? decodeHtml(ch.snippet.title)
      : "YouTube Channel";
    const customHandle =
      ch.snippet?.customUrl || (parsed.handle ? `@${parsed.handle}` : null);
    const channelUrl = customHandle
      ? `https://www.youtube.com/${customHandle}`
      : `https://www.youtube.com/channel/${ch.id}`;

    const avatarUrl =
      ch.snippet?.thumbnails?.high?.url ||
      ch.snippet?.thumbnails?.medium?.url ||
      ch.snippet?.thumbnails?.default?.url ||
      null;

    const description = ch.snippet?.description
      ? decodeHtml(ch.snippet.description)
      : null;

    const country = ch.snippet?.country || null;
    const startedDate = ch.snippet?.publishedAt || null;

    // Statistics
    const rawSubCount = ch.statistics?.subscriberCount
      ? Number.parseInt(ch.statistics.subscriberCount, 10)
      : null;
    const isHiddenSubs = ch.statistics?.hiddenSubscriberCount === true;
    const subscriberCount = isHiddenSubs
      ? "Hidden"
      : rawSubCount !== null
        ? formatViews(rawSubCount)
        : null;

    const rawViews = ch.statistics?.viewCount
      ? Number.parseInt(ch.statistics.viewCount, 10)
      : null;
    const totalViewCount = rawViews !== null ? formatViews(rawViews) : null;

    const videoCount = ch.statistics?.videoCount
      ? Number.parseInt(ch.statistics.videoCount, 10)
      : null;

    // Keywords
    const rawKeywords = ch.brandingSettings?.channel?.keywords;
    const keywords = tokenizeKeywords(rawKeywords);

    // Topics
    const topicCategories = ch.topicDetails?.topicCategories || [];

    // 3. Cadence and Recent Uploads
    let lastUploadDate: string | null = null;
    let uploadFrequency: string | null = null;
    let avgViewCount: string | null = null;
    let recentUploadDates: string[] = [];
    let mostPopularVideoTitle = initialVideoInfo?.title || null;
    let mostPopularVideoUrl = initialVideoInfo?.url || null;
    let mostPopularVideoThumb = initialVideoInfo?.thumb || null;
    let mostPopularVideoViews = initialVideoInfo?.views || null;

    const uploadsPlaylistId = ch.contentDetails?.relatedPlaylists?.uploads;
    if (uploadsPlaylistId) {
      try {
        const playlistRes = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${encodeURIComponent(uploadsPlaylistId)}&maxResults=15&key=${encodeURIComponent(apiKey)}`,
          { signal: AbortSignal.timeout(6000) },
        );

        if (playlistRes.ok) {
          const playlistJson = (await playlistRes.json()) as {
            items?: YtApiPlaylistItem[];
          };
          const playlistItems = playlistJson.items || [];
          recentUploadDates = playlistItems
            .map((item) => item.snippet?.publishedAt)
            .filter((d): d is string => Boolean(d));

          if (recentUploadDates.length > 0) {
            lastUploadDate = recentUploadDates[0] || null;
            uploadFrequency = computeUploadFrequency(recentUploadDates);
          }

          // Fetch batch stats for up to 15 recent videos
          const videoIds = playlistItems
            .map((item) => item.snippet?.resourceId?.videoId)
            .filter((id): id is string => Boolean(id));

          if (videoIds.length > 0) {
            const batchRes = await fetch(
              `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${encodeURIComponent(videoIds.join(","))}&key=${encodeURIComponent(apiKey)}`,
              { signal: AbortSignal.timeout(6000) },
            );

            if (batchRes.ok) {
              const batchJson = (await batchRes.json()) as {
                items?: YtApiVideoItem[];
              };
              const vItems = batchJson.items || [];
              const parsedStats = vItems.map((v) => ({
                id: v.id,
                title: v.snippet?.title ? decodeHtml(v.snippet.title) : "",
                views: v.statistics?.viewCount
                  ? Number.parseInt(v.statistics.viewCount, 10)
                  : 0,
                thumb:
                  v.snippet?.thumbnails?.maxres?.url ||
                  v.snippet?.thumbnails?.high?.url ||
                  `https://img.youtube.com/vi/${v.id}/maxresdefault.jpg`,
              }));

              const validViews = parsedStats
                .map((v) => v.views)
                .filter((v) => !Number.isNaN(v) && v > 0);

              if (validViews.length > 0) {
                const total = validViews.reduce((a, b) => a + b, 0);
                avgViewCount = formatViews(
                  Math.round(total / validViews.length),
                );
              }

              // If top video wasn't set from an explicit video URL, pick the highest viewed among recent
              if (!mostPopularVideoTitle && parsedStats.length > 0) {
                const topVideo = [...parsedStats].sort(
                  (a, b) => b.views - a.views,
                )[0];
                if (topVideo) {
                  mostPopularVideoTitle = topVideo.title;
                  mostPopularVideoUrl = `https://www.youtube.com/watch?v=${topVideo.id}`;
                  mostPopularVideoThumb = topVideo.thumb;
                  mostPopularVideoViews = formatViews(topVideo.views);
                }
              }
            }
          }
        }
      } catch {
        // Fall back gracefully if playlist query encounters error
      }
    }

    return {
      channelName,
      channelUrl,
      customUrl: customHandle,
      avatarUrl,
      description,
      country,
      startedDate,
      subscriberCount,
      rawSubscriberCount: rawSubCount,
      hiddenSubscriberCount: isHiddenSubs,
      totalViewCount,
      rawTotalViewCount: rawViews,
      videoCount,
      lastUploadDate,
      uploadFrequency,
      avgViewCount,
      recentUploadDates,
      mostPopularVideoTitle,
      mostPopularVideoUrl,
      mostPopularVideoThumb,
      mostPopularVideoViews,
      keywords,
      topicCategories,
    };
  } catch {
    return null;
  }
}

/* ========================================================================= */
/* ZERO-KEY SCRAPER FALLBACK (Upgraded with Consent & Modern Selectors)       */
/* ========================================================================= */

async function fetchRssVideos(channelId: string) {
  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`;
    const res = await fetch(rssUrl, {
      headers: { "User-Agent": "Snipvis-Bot/1.0" },
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const xml = await res.text();

    const publishedDates = [
      ...xml.matchAll(/<published>([^<]+)<\/published>/g),
    ].map((m) => m[1]);

    const titles = [...xml.matchAll(/<title>([^<]+)<\/title>/g)]
      .map((m) => decodeHtml(m[1]))
      .slice(1);

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

async function scrapeViaHtmlFallback(
  parsed: ParsedUrlTarget,
): Promise<YoutubeChannelMeta> {
  let channelName = "";
  let channelUrl = parsed.normalizedUrl;
  let avatarUrl: string | null = null;
  let description: string | null = null;
  let subscriberCount: string | null = null;
  let mostPopularVideoTitle: string | null = null;
  let mostPopularVideoUrl: string | null = null;
  let mostPopularVideoThumb: string | null = null;
  let channelId: string | null = parsed.channelId;
  let startedDate: string | null = null;

  if (parsed.videoId) {
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(parsed.normalizedUrl)}&format=json`;
      const oembedRes = await fetch(oembedUrl, {
        signal: AbortSignal.timeout(4000),
      });
      if (oembedRes.ok) {
        const oembed = await oembedRes.json();
        channelName = decodeHtml(oembed.author_name || "");
        channelUrl = oembed.author_url || parsed.normalizedUrl;
        mostPopularVideoTitle = decodeHtml(oembed.title || "");
        mostPopularVideoUrl = parsed.normalizedUrl;
        mostPopularVideoThumb = `https://img.youtube.com/vi/${parsed.videoId}/maxresdefault.jpg`;
      }
    } catch {
      // ignore
    }
  }

  try {
    const channelPageRes = await fetch(channelUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Cookie:
          "SOCS=CAESEwgDEgk0ODE3Nzk3MjQaAmVuIAEaBgiA_LyaBg; CONSENT=PENDING+999",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (channelPageRes.ok) {
      const html = await channelPageRes.text();

      // Channel title
      if (!channelName) {
        const ogTitleMatch = html.match(
          /<meta property="og:title" content="([^"]+)"/,
        );
        if (ogTitleMatch?.[1]) {
          channelName = decodeHtml(ogTitleMatch[1]);
        }
      }

      // Avatar
      const ogImageMatch = html.match(
        /<meta property="og:image" content="([^"]+)"/,
      );
      if (ogImageMatch?.[1]) {
        avatarUrl = ogImageMatch[1];
      }

      // Description
      const ogDescMatch = html.match(
        /<meta property="og:description" content="([^"]+)"/,
      );
      if (ogDescMatch?.[1]) {
        description = decodeHtml(ogDescMatch[1]);
      }

      // Channel ID resolution
      if (!channelId) {
        const idMatch =
          html.match(
            /<link rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/(UC[\w-]{22})"/i,
          ) ||
          html.match(/<meta itemprop="channelId" content="([^"]+)"/i) ||
          html.match(/"externalId":"(UC[\w-]{22})"/i) ||
          html.match(/"browseId":"(UC[\w-]{22})"/i) ||
          html.match(/"channelId":"(UC[\w-]{22})"/i);
        if (idMatch?.[1]) {
          channelId = idMatch[1];
        }
      }

      // Subscribers
      const subMatch =
        html.match(
          /"subscriberCountText":\{"accessibility":\{"accessibilityData":\{"label":"([^"]+)"\}\}/i,
        ) ||
        html.match(/"subscriberCountText":\{"simpleText":"([^"]+)"\}/i) ||
        html.match(/"label":"([\d.,KMB]+\s+subscribers?)"/i) ||
        html.match(/"simpleText":"([\d.,KMB]+\s+subscribers?)"/i);
      if (subMatch?.[1]) {
        subscriberCount = subMatch[1].replace(/subscribers?/i, "").trim();
      }

      // Channel joined / started date
      const startDateMatch =
        html.match(/<meta itemprop="startDate" content="([^"]+)"/) ||
        html.match(
          /"joinedDateText":\{"runs":\[\{"text":"Joined "\},\{"text":"([^"]+)"\}/i,
        );
      if (startDateMatch?.[1]) {
        const parsedDate = new Date(startDateMatch[1]);
        if (!Number.isNaN(parsedDate.getTime())) {
          startedDate = parsedDate.toISOString();
        }
      }
    }
  } catch {
    // scraper fallback error handled
  }

  // RSS Feed calculations
  let lastUploadDate: string | null = null;
  let uploadFrequency: string | null = null;
  let avgViewCount: string | null = null;
  let recentUploadDates: string[] = [];

  if (channelId) {
    const rssData = await fetchRssVideos(channelId);
    if (rssData) {
      recentUploadDates = rssData.publishedDates;
      if (recentUploadDates.length > 0) {
        lastUploadDate = recentUploadDates[0] || null;
        uploadFrequency = computeUploadFrequency(recentUploadDates);
      }
      if (rssData.viewCounts && rssData.viewCounts.length > 0) {
        const sum = rssData.viewCounts.reduce((a, b) => a + b, 0);
        const avg = Math.round(sum / rssData.viewCounts.length);
        avgViewCount = formatViews(avg);
      }
      if (!mostPopularVideoTitle && rssData.titles.length > 0) {
        mostPopularVideoTitle = rssData.titles[0] || null;
        mostPopularVideoUrl = rssData.links[0] || null;
      }
    }
  }

  if (!channelName) {
    channelName = parsed.handle ? `@${parsed.handle}` : "YouTube Channel";
  }

  return {
    channelName,
    channelUrl,
    customUrl: parsed.handle ? `@${parsed.handle}` : null,
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
}

/* ========================================================================= */
/* MAIN ROUTE HANDLER                                                        */
/* ========================================================================= */

export async function POST(req: NextRequest) {
  try {
    await requireUser();
    const { url } = fetchYoutubeChannelSchema.parse(await req.json());
    const parsedTarget = parseTargetUrl(url);

    const apiKey = process.env.YOUTUBE_API_KEY;

    if (apiKey && apiKey.trim().length > 0) {
      const apiResult = await fetchViaYoutubeApiV3(parsedTarget, apiKey.trim());
      if (apiResult) {
        return NextResponse.json(apiResult);
      }
    }

    // Fallback to enhanced scraper
    const scrapedResult = await scrapeViaHtmlFallback(parsedTarget);
    return NextResponse.json(scrapedResult);
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

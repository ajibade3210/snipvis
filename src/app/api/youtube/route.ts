import { handleApiError } from "@/lib/api-error";
import { fetchYoutubeSchema } from "@/lib/validations";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = fetchYoutubeSchema.parse(await req.json());
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(oembedUrl);
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch YouTube metadata from oEmbed" },
        { status: 400 },
      );
    }
    const oembed = await res.json();
    const idMatch = url.match(/(?:v=|youtu\.be\/)([\w-]{11})/);
    const videoId = idMatch?.[1];
    const thumbnailUrl = videoId
      ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      : oembed.thumbnail_url;
    return NextResponse.json({
      title: oembed.title,
      channelName: oembed.author_name,
      thumbnailUrl,
      sourceUrl: url,
      videoId,
    });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

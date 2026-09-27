import { NextRequest, NextResponse } from "next/server";
import { fetchYoutubeSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const { url } = fetchYoutubeSchema.parse(await req.json());
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  const res = await fetch(oembedUrl);
  if (!res.ok)
    return NextResponse.json(
      { error: "Failed to fetch YouTube" },
      { status: 400 },
    );
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
}

import { handleApiError } from "@/lib/api-error";
import { cacheStore, withCache } from "@/lib/cache";
import { CACHE_KEYS, CACHE_TTL } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { createCompetitorSchema } from "@/lib/validations";
import { type NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await requireUser();
    const cacheKey = CACHE_KEYS.COMPETITORS_LIST(user.id);

    const competitors = await withCache(
      cacheStore,
      cacheKey,
      CACHE_TTL.COMPETITORS_LIST_SECONDS,
      () =>
        prisma.competitor.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
        }),
    );

    return NextResponse.json(competitors);
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const data = createCompetitorSchema.parse(body);

    const existing = await prisma.competitor.findUnique({
      where: {
        userId_channelUrl: {
          userId: user.id,
          channelUrl: data.channelUrl,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "This channel is already being tracked." },
        { status: 409 },
      );
    }

    const competitor = await prisma.competitor.create({
      data: {
        channelName: data.channelName,
        channelUrl: data.channelUrl,
        avatarUrl: data.avatarUrl || null,
        description: data.description || null,
        subscriberCountAtAdd:
          data.subscriberCountAtAdd || data.currentSubscriberCount || null,
        currentSubscriberCount: data.currentSubscriberCount || null,
        avgViewCount: data.avgViewCount || null,
        lastUploadDate:
          data.lastUploadDate &&
          !Number.isNaN(new Date(data.lastUploadDate).getTime())
            ? new Date(data.lastUploadDate)
            : null,
        mostPopularVideoUrl: data.mostPopularVideoUrl || null,
        mostPopularVideoTitle: data.mostPopularVideoTitle || null,
        mostPopularVideoThumb: data.mostPopularVideoThumb || null,
        uploadFrequency: data.uploadFrequency || null,
        startedDate:
          data.startedDate &&
          !Number.isNaN(new Date(data.startedDate).getTime())
            ? new Date(data.startedDate)
            : null,
        reproducible: data.reproducible ?? false,
        personalNote: data.personalNote || null,
        totalViewCount: data.totalViewCount || null,
        videoCount: data.videoCount ?? null,
        country: data.country || null,
        customUrl: data.customUrl || null,
        hiddenSubscriberCount: data.hiddenSubscriberCount ?? false,
        keywords: data.keywords || [],
        metadata: data.metadata
          ? JSON.parse(JSON.stringify(data.metadata))
          : undefined,
        userId: user.id,
      },
    });

    await cacheStore.del(CACHE_KEYS.COMPETITORS_LIST(user.id));
    return NextResponse.json(competitor, { status: 201 });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

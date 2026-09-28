import { handleApiError } from "@/lib/api-error";
import { cacheStore, withCache } from "@/lib/cache";
import { CACHE_KEYS, CACHE_TTL } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { createChannelSchema } from "@/types/channel";
import { type NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const channels = await withCache(
      cacheStore,
      CACHE_KEYS.CHANNELS_LIST,
      CACHE_TTL.CHANNELS_LIST_SECONDS,
      () =>
        prisma.channel.findMany({
          orderBy: { name: "asc" },
          include: {
            _count: { select: { projects: true } },
          },
        }),
    );
    return NextResponse.json(channels);
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createChannelSchema.parse(body);

    const existing = await prisma.channel.findFirst({
      where: {
        name: { equals: data.name, mode: "insensitive" },
      },
      include: {
        _count: { select: { projects: true } },
      },
    });

    if (existing) {
      if (data.link && data.link !== existing.link) {
        const updated = await prisma.channel.update({
          where: { id: existing.id },
          data: { link: data.link },
          include: {
            _count: { select: { projects: true } },
          },
        });
        await cacheStore.del(CACHE_KEYS.CHANNELS_LIST);
        return NextResponse.json(updated, { status: 200 });
      }
      return NextResponse.json(existing, { status: 200 });
    }

    const channel = await prisma.channel.create({
      data: {
        name: data.name,
        link: data.link || null,
      },
      include: {
        _count: { select: { projects: true } },
      },
    });

    await cacheStore.del(CACHE_KEYS.CHANNELS_LIST);
    return NextResponse.json(channel, { status: 201 });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

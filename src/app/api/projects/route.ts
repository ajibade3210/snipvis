import { handleApiError } from "@/lib/api-error";
import { cacheStore, withCache } from "@/lib/cache";
import { CACHE_KEYS, CACHE_TTL } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { createProjectSchema } from "@/lib/validations";
import type { Prisma } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await requireUser();
    const cacheKey = CACHE_KEYS.PROJECTS_LIST(user.id);

    const projects = await withCache(
      cacheStore,
      cacheKey,
      CACHE_TTL.PROJECTS_LIST_SECONDS,
      () =>
        prisma.project.findMany({
          where: { userId: user.id },
          orderBy: { updatedAt: "desc" },
          include: {
            channel: true,
            _count: { select: { inspirations: true, assets: true } },
            thumbnails: { orderBy: { createdAt: "asc" } },
          },
        }),
    );
    return NextResponse.json(projects);
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const data = createProjectSchema.parse(body);
    const slug =
      data.slug ?? data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const projectInput: Prisma.ProjectCreateInput = {
      name: data.name,
      slug,
      emoji: data.emoji || null,
      description: data.description,
      channel: data.channelId ? { connect: { id: data.channelId } } : undefined,
      hook: data.hook,
      scriptLink: data.scriptLink || null,
      script: data.script,
      status: data.status,
      user: { connect: { id: user.id } },
    };

    const project = await prisma.project.create({
      data: projectInput,
      include: {
        channel: true,
        thumbnails: true,
        _count: { select: { inspirations: true, assets: true } },
      },
    });

    await cacheStore.del(CACHE_KEYS.PROJECTS_LIST(user.id));
    await cacheStore.del(CACHE_KEYS.CHANNELS_LIST(user.id));
    return NextResponse.json(project, { status: 201 });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

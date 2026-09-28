import { handleApiError } from "@/lib/api-error";
import { cacheStore, withCache } from "@/lib/cache";
import { CACHE_KEYS, CACHE_TTL } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { createProjectSchema } from "@/lib/validations";
import type { Prisma } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const projects = await withCache(
      cacheStore,
      CACHE_KEYS.PROJECTS_LIST,
      CACHE_TTL.PROJECTS_LIST_SECONDS,
      () =>
        prisma.project.findMany({
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
    const body = await req.json();
    const data = createProjectSchema.parse(body);
    const slug =
      data.slug ?? data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const projectInput: Prisma.ProjectCreateInput = {
      name: data.name,
      slug,
      description: data.description,
      channel: data.channelId ? { connect: { id: data.channelId } } : undefined,
      hook: data.hook,
      scriptLink: data.scriptLink || null,
      script: data.script,
      status: data.status,
    };

    const project = await prisma.project.create({
      data: projectInput,
      include: {
        channel: true,
        thumbnails: true,
        _count: { select: { inspirations: true, assets: true } },
      },
    });
    await cacheStore.del(CACHE_KEYS.PROJECTS_LIST);
    await cacheStore.del(CACHE_KEYS.CHANNELS_LIST);
    return NextResponse.json(project, { status: 201 });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

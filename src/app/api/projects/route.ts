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
          include: { _count: { select: { inspirations: true, assets: true } } },
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
      channel: data.channel,
      angle: data.angle,
      hook: data.hook,
      scriptLink: data.scriptLink || null,
      notes: data.notes,
      script: data.script,
    };

    const project = await prisma.project.create({
      data: projectInput,
    });
    await cacheStore.del(CACHE_KEYS.PROJECTS_LIST);
    return NextResponse.json(project, { status: 201 });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

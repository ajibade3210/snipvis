import { handleApiError } from "@/lib/api-error";
import { cacheStore } from "@/lib/cache";
import { CACHE_KEYS, DEFAULT_PROJECT_SCRIPTS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { updateProjectSchema } from "@/lib/validations";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireUser();
    const project = await prisma.project.findFirst({
      where: { id: params.id, userId: user.id },
      include: {
        channel: true,
        inspirations: { include: { inspiration: true } },
        assets: { include: { asset: true } },
        thumbnails: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    if (
      !project.script &&
      project.slug &&
      DEFAULT_PROJECT_SCRIPTS[project.slug]
    ) {
      const defaultScript = DEFAULT_PROJECT_SCRIPTS[project.slug];
      await prisma.project.update({
        where: { id: project.id },
        data: { script: defaultScript },
      });
      project.script = defaultScript;
    }
    return NextResponse.json(project);
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireUser();
    const existing = await prisma.project.findFirst({
      where: { id: params.id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = await req.json();
    const data = updateProjectSchema.parse(body);
    const { channel: _legacyChannel, channelId, ...restData } = data;

    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        ...restData,
        ...(channelId !== undefined
          ? {
              channel: channelId
                ? { connect: { id: channelId } }
                : { disconnect: true },
            }
          : {}),
      },
      include: {
        channel: true,
        inspirations: { include: { inspiration: true } },
        assets: { include: { asset: true } },
        thumbnails: { orderBy: { createdAt: "asc" } },
      },
    });
    await cacheStore.del(CACHE_KEYS.PROJECTS_LIST(user.id));
    await cacheStore.del(CACHE_KEYS.CHANNELS_LIST(user.id));
    return NextResponse.json(project);
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

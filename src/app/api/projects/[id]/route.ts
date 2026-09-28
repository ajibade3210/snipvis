import { handleApiError } from "@/lib/api-error";
import { cacheStore } from "@/lib/cache";
import { CACHE_KEYS, DEFAULT_PROJECT_SCRIPTS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { updateProjectSchema } from "@/lib/validations";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
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
    const body = await req.json();
    const data = updateProjectSchema.parse(body);
    const project = await prisma.project.update({
      where: { id: params.id },
      data,
      include: {
        inspirations: { include: { inspiration: true } },
        assets: { include: { asset: true } },
        thumbnails: { orderBy: { createdAt: "asc" } },
      },
    });
    await cacheStore.del(CACHE_KEYS.PROJECTS_LIST);
    return NextResponse.json(project);
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

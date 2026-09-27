import { handleApiError } from "@/lib/api-error";
import { cacheStore } from "@/lib/cache";
import { CACHE_KEYS } from "@/lib/constants";
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
      },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
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
    });
    await cacheStore.del(CACHE_KEYS.PROJECTS_LIST);
    return NextResponse.json(project);
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

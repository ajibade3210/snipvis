import { handleApiError } from "@/lib/api-error";
import { cacheStore } from "@/lib/cache";
import { CACHE_KEYS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { createProjectThumbnailSchema } from "@/lib/validations";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireUser();
    const project = await prisma.project.findFirst({
      where: { id: params.id, userId: user.id },
      select: { id: true, _count: { select: { thumbnails: true } } },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = await req.json();
    const data = createProjectThumbnailSchema.parse(body);

    const isFirst = project._count.thumbnails === 0;

    const thumbnail = await prisma.projectThumbnail.create({
      data: {
        projectId: params.id,
        url: data.url,
        label: data.label || null,
        isMain: isFirst,
      },
    });

    await cacheStore.del(CACHE_KEYS.PROJECTS_LIST(user.id));
    return NextResponse.json(thumbnail, { status: 201 });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

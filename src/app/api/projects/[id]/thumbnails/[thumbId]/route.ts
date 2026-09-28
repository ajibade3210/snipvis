import { handleApiError } from "@/lib/api-error";
import { cacheStore } from "@/lib/cache";
import { CACHE_KEYS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { deleteObject } from "@/lib/storage";
import { updateProjectThumbnailSchema } from "@/lib/validations";
import { type NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; thumbId: string } },
) {
  try {
    const user = await requireUser();
    const project = await prisma.project.findFirst({
      where: { id: params.id, userId: user.id },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = await req.json();
    const data = updateProjectThumbnailSchema.parse(body);

    const thumbnail = await prisma.projectThumbnail.findFirst({
      where: { id: params.thumbId, projectId: params.id },
    });

    if (!thumbnail) {
      return NextResponse.json(
        { error: "Thumbnail not found" },
        { status: 404 },
      );
    }

    if (data.isMain === true) {
      const [_, updated] = await prisma.$transaction([
        prisma.projectThumbnail.updateMany({
          where: { projectId: params.id },
          data: { isMain: false },
        }),
        prisma.projectThumbnail.update({
          where: { id: params.thumbId },
          data: {
            isMain: true,
            label: data.label !== undefined ? data.label : undefined,
          },
        }),
      ]);

      await cacheStore.del(CACHE_KEYS.PROJECTS_LIST(user.id));
      return NextResponse.json(updated);
    }

    const updated = await prisma.projectThumbnail.update({
      where: { id: params.thumbId },
      data: {
        isMain: data.isMain !== undefined ? data.isMain : undefined,
        label: data.label !== undefined ? data.label : undefined,
      },
    });

    await cacheStore.del(CACHE_KEYS.PROJECTS_LIST(user.id));
    return NextResponse.json(updated);
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string; thumbId: string } },
) {
  try {
    const user = await requireUser();
    const project = await prisma.project.findFirst({
      where: { id: params.id, userId: user.id },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const thumbnail = await prisma.projectThumbnail.findFirst({
      where: { id: params.thumbId, projectId: params.id },
    });

    if (!thumbnail) {
      return NextResponse.json(
        { error: "Thumbnail not found" },
        { status: 404 },
      );
    }

    // Attempt to remove the file from R2 storage
    try {
      const urlObj = new URL(thumbnail.url);
      const key = urlObj.pathname.replace(/^\/+/, "");
      if (key) {
        await deleteObject(key);
      }
    } catch {
      // Storage cleanup failure shouldn't prevent DB deletion
    }

    await prisma.projectThumbnail.delete({
      where: { id: params.thumbId },
    });

    // If the deleted thumbnail was main, promote the first remaining one
    if (thumbnail.isMain) {
      const remaining = await prisma.projectThumbnail.findFirst({
        where: { projectId: params.id },
        orderBy: { createdAt: "asc" },
      });
      if (remaining) {
        await prisma.projectThumbnail.update({
          where: { id: remaining.id },
          data: { isMain: true },
        });
      }
    }

    await cacheStore.del(CACHE_KEYS.PROJECTS_LIST(user.id));
    return NextResponse.json({ success: true, id: params.thumbId });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

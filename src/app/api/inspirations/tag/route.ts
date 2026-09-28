import { handleApiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { tagInspirationSchema } from "@/lib/validations";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const { inspirationId, projectId, note, favorite } =
      tagInspirationSchema.parse(body);

    // Verify ownership of both project and inspiration
    const [project, inspiration] = await Promise.all([
      prisma.project.findFirst({
        where: { id: projectId, userId: user.id },
      }),
      prisma.inspiration.findFirst({
        where: { id: inspirationId, userId: user.id },
      }),
    ]);

    if (!project || !inspiration) {
      return NextResponse.json(
        { error: "Target project or inspiration not found or unauthorized" },
        { status: 404 },
      );
    }

    const link = await prisma.projectInspiration.upsert({
      where: { projectId_inspirationId: { projectId, inspirationId } },
      update: { note, favorite },
      create: { projectId, inspirationId, note, favorite: favorite ?? false },
    });
    return NextResponse.json(link);
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const inspirationId = searchParams.get("inspirationId");

    if (!projectId || !inspirationId) {
      return NextResponse.json(
        { error: "Missing projectId or inspirationId" },
        { status: 400 },
      );
    }

    // Verify ownership of project
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: user.id },
    });
    if (!project) {
      return NextResponse.json(
        { error: "Project not found or unauthorized" },
        { status: 404 },
      );
    }

    await prisma.projectInspiration.delete({
      where: { projectId_inspirationId: { projectId, inspirationId } },
    });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

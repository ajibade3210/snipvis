import { handleApiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { tagInspirationSchema } from "@/lib/validations";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { inspirationId, projectId, note, favorite } =
      tagInspirationSchema.parse(body);
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
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const inspirationId = searchParams.get("inspirationId");

    if (!projectId || !inspirationId) {
      return NextResponse.json(
        { error: "Missing projectId or inspirationId" },
        { status: 400 },
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

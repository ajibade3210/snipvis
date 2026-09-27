import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tagInspirationSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { inspirationId, projectId, note, favorite } =
    tagInspirationSchema.parse(body);
  const link = await prisma.projectInspiration.upsert({
    where: { projectId_inspirationId: { projectId, inspirationId } },
    update: { note, favorite },
    create: { projectId, inspirationId, note, favorite: favorite ?? false },
  });
  return NextResponse.json(link);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId")!;
  const inspirationId = searchParams.get("inspirationId")!;
  await prisma.projectInspiration.delete({
    where: { projectId_inspirationId: { projectId, inspirationId } },
  });
  return NextResponse.json({ ok: true });
}

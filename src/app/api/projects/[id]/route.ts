import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateProjectSchema } from "@/lib/validations";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } },
) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      inspirations: { include: { inspiration: true } },
      assets: { include: { asset: true } },
    },
  });
  if (!project)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(project);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = await req.json();
  const data = updateProjectSchema.parse(body);
  const project = await prisma.project.update({
    where: { id: params.id },
    data,
  });
  return NextResponse.json(project);
}

import { prisma } from "@/lib/prisma";
import { createInspirationSchema } from "@/lib/validations";
import type { InspirationType } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const typeParam = searchParams.get("type");
  const type =
    typeParam && ["THUMBNAIL", "TITLE", "HOOK"].includes(typeParam)
      ? (typeParam as InspirationType)
      : undefined;
  const favorite = searchParams.get("favorite");

  if (projectId) {
    const links = await prisma.projectInspiration.findMany({
      where: {
        projectId,
        ...(favorite === "true" ? { favorite: true } : {}),
        ...(type ? { inspiration: { type } } : {}),
      },
      include: { inspiration: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(
      links.map((l) => ({
        ...l.inspiration,
        projectContext: {
          projectId: l.projectId,
          note: l.note,
          favorite: l.favorite,
        },
      })),
    );
  }

  const inspirations = await prisma.inspiration.findMany({
    where: { ...(type ? { type } : {}) },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(inspirations);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = createInspirationSchema.parse(body);
  const inspiration = await prisma.inspiration.create({
    data: {
      thumbnailUrl: data.thumbnailUrl,
      title: data.title,
      hook: data.hook,
      channelName: data.channelName,
      views: data.views,
      sourceUrl: data.sourceUrl,
      type: data.type as InspirationType,
      note: data.note,
      projects: data.projects?.length
        ? {
            create: data.projects.map((p) => ({
              projectId: p.projectId,
              note: p.note,
              favorite: p.favorite ?? false,
            })),
          }
        : undefined,
    },
  });
  return NextResponse.json(inspiration, { status: 201 });
}

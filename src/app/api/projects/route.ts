import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createProjectSchema } from "@/lib/validations";
import { withCache, cacheStore } from "@/lib/cache";

export async function GET() {
  const projects = await withCache(cacheStore, "projects:list", 60, () =>
    prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { inspirations: true, assets: true } } },
    }),
  );
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = createProjectSchema.parse(body);
  const slug = data.slug ?? data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const project = await prisma.project.create({
    data: { ...data, slug, scriptLink: data.scriptLink || null } as any,
  });
  await cacheStore.del("projects:list");
  return NextResponse.json(project, { status: 201 });
}

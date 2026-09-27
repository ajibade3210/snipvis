import { prisma } from "@/lib/prisma";
import { createAssetSchema } from "@/lib/validations";
import type { AssetSource, AssetType } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  if (projectId) {
    const links = await prisma.projectAsset.findMany({
      where: { projectId },
      include: { asset: true },
    });
    return NextResponse.json(
      links.map((l) => ({
        ...l.asset,
        projectContext: { projectId: l.projectId, note: l.note },
      })),
    );
  }
  return NextResponse.json(
    await prisma.asset.findMany({ orderBy: { createdAt: "desc" } }),
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = createAssetSchema.parse(body);
  const asset = await prisma.asset.create({
    data: {
      url: data.url,
      type: data.type as AssetType,
      source: data.source as AssetSource,
      licenseText: data.licenseText,
      note: data.note,
      projects: {
        create: data.projects.map((p) => ({
          projectId: p.projectId,
          note: p.note,
        })),
      },
    },
  });
  return NextResponse.json(asset, { status: 201 });
}

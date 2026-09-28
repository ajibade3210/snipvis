import { handleApiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { createAssetSchema } from "@/lib/validations";
import type { AssetSource, AssetType } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (projectId) {
      const project = await prisma.project.findFirst({
        where: { id: projectId, userId: user.id },
      });
      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 },
        );
      }

      const links = await prisma.projectAsset.findMany({
        where: { projectId, project: { userId: user.id } },
        include: { asset: true },
      });
      return NextResponse.json(
        links.map((l) => ({
          ...l.asset,
          projectContext: { projectId: l.projectId, note: l.note },
        })),
      );
    }

    const assets = await prisma.asset.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(assets);
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const data = createAssetSchema.parse(body);

    const projectIds = data.projects.map((p) => p.projectId);
    const userProjects = await prisma.project.findMany({
      where: {
        id: { in: projectIds },
        userId: user.id,
      },
      select: { id: true },
    });

    const validProjectIds = new Set(userProjects.map((p) => p.id));
    const invalidProjects = projectIds.filter((id) => !validProjectIds.has(id));
    if (invalidProjects.length > 0) {
      return NextResponse.json(
        {
          error: "One or more target projects do not exist or are unauthorized",
        },
        { status: 403 },
      );
    }

    const asset = await prisma.asset.create({
      data: {
        url: data.url,
        type: data.type as AssetType,
        source: data.source as AssetSource,
        licenseText: data.licenseText,
        note: data.note,
        userId: user.id,
        projects: {
          create: data.projects.map((p) => ({
            projectId: p.projectId,
            note: p.note,
          })),
        },
      },
    });
    return NextResponse.json(asset, { status: 201 });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

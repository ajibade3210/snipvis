import { handleApiError } from "@/lib/api-error";
import { cacheStore } from "@/lib/cache";
import { CACHE_KEYS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { updateAssetSchema } from "@/lib/validations";
import type { AssetSource, AssetType } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireUser();
    const existing = await prisma.asset.findFirst({
      where: { id: params.id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const body = await req.json();
    const data = updateAssetSchema.parse(body);

    const updated = await prisma.asset.update({
      where: { id: params.id },
      data: {
        url: data.url,
        type: data.type as AssetType | undefined,
        source: data.source as AssetSource | undefined,
        licenseText: data.licenseText,
        note: data.note,
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
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireUser();
    const asset = await prisma.asset.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // Hard delete join links first, then the asset record
    await prisma.projectAsset.deleteMany({
      where: { assetId: params.id },
    });

    await prisma.asset.delete({
      where: { id: params.id },
    });

    await cacheStore.del(CACHE_KEYS.PROJECTS_LIST(user.id));
    return NextResponse.json({ success: true, id: params.id });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

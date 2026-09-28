import { handleApiError } from "@/lib/api-error";
import { cacheStore } from "@/lib/cache";
import { CACHE_KEYS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { updateCompetitorSchema } from "@/lib/validations";
import { type NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const data = updateCompetitorSchema.parse(body);

    const existing = await prisma.competitor.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Competitor not found." },
        { status: 404 },
      );
    }

    const updated = await prisma.competitor.update({
      where: { id: params.id },
      data: {
        ...data,
        lastUploadDate:
          data.lastUploadDate !== undefined
            ? data.lastUploadDate &&
              !Number.isNaN(new Date(data.lastUploadDate).getTime())
              ? new Date(data.lastUploadDate)
              : null
            : undefined,
        startedDate:
          data.startedDate !== undefined
            ? data.startedDate &&
              !Number.isNaN(new Date(data.startedDate).getTime())
              ? new Date(data.startedDate)
              : null
            : undefined,
        avgViewCount:
          data.avgViewCount !== undefined
            ? data.avgViewCount || null
            : undefined,
        reproducible:
          data.reproducible !== undefined ? data.reproducible : undefined,
      },
    });

    await cacheStore.del(CACHE_KEYS.COMPETITORS_LIST(user.id));
    return NextResponse.json(updated);
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireUser();

    const existing = await prisma.competitor.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Competitor not found." },
        { status: 404 },
      );
    }

    await prisma.competitor.delete({ where: { id: params.id } });
    await cacheStore.del(CACHE_KEYS.COMPETITORS_LIST(user.id));

    return new NextResponse(null, { status: 204 });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

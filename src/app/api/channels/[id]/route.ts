import { handleApiError } from "@/lib/api-error";
import { cacheStore } from "@/lib/cache";
import { CACHE_KEYS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { type NextRequest, NextResponse } from "next/server";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireUser();
    const { id } = params;

    const channel = await prisma.channel.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    await prisma.channel.delete({
      where: { id },
    });

    // Invalidate channels list cache and projects list cache
    await cacheStore.del(CACHE_KEYS.CHANNELS_LIST(user.id));
    await cacheStore.del(CACHE_KEYS.PROJECTS_LIST(user.id));

    return NextResponse.json({ success: true, id }, { status: 200 });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

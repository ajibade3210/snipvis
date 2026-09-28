import { handleApiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { updateUserProfileSchema } from "@/lib/validations";
import { type NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await requireUser();
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      avatarUrl: dbUser.image,
      image: dbUser.image,
    });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const data = updateUserProfileSchema.parse(body);

    const targetImage = data.image !== undefined ? data.image : data.avatarUrl;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        image: targetImage !== undefined ? targetImage : undefined,
      },
    });

    return NextResponse.json({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      avatarUrl: updated.image,
      image: updated.image,
    });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

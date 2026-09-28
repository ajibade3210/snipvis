import { handleApiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { updateUserProfileSchema } from "@/lib/validations";
import { type NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { id: "default" },
    });

    if (!profile) {
      return NextResponse.json({
        id: "default",
        name: null,
        avatarUrl: null,
      });
    }

    return NextResponse.json(profile);
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const data = updateUserProfileSchema.parse(body);

    const profile = await prisma.userProfile.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        name: data.name || null,
        avatarUrl: data.avatarUrl || null,
      },
      update: {
        name: data.name !== undefined ? data.name : undefined,
        avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : undefined,
      },
    });

    return NextResponse.json(profile);
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

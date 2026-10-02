import { handleApiError } from "@/lib/api-error";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validations";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp, newPassword } = resetPasswordSchema.parse(body);

    // Find the most recent unused, unexpired token for this email
    const record = await prisma.passwordResetToken.findFirst({
      where: {
        email,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Invalid or expired code. Request a new one." },
        { status: 400 },
      );
    }

    const isValid = await verifyPassword(otp, record.otpHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Incorrect code. Check your terminal and try again." },
        { status: 400 },
      );
    }

    const newHash = await hashPassword(newPassword);

    // Atomically mark token used and update password
    await prisma.$transaction([
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { used: true },
      }),
      prisma.user.update({
        where: { email },
        data: { passwordHash: newHash },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

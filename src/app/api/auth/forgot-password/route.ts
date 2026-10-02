import { randomInt } from "node:crypto";
import { OTP_CONFIG } from "@/constants/auth";
import { handleApiError } from "@/lib/api-error";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });

    // Respond identically whether user exists or not (no user enumeration)
    if (!user) {
      return NextResponse.json({ ok: true });
    }

    // Invalidate any previous unused tokens for this email
    await prisma.passwordResetToken.updateMany({
      where: { email, used: false },
      data: { used: true },
    });

    const otp = randomInt(100_000, 1_000_000).toString();
    const otpHash = await hashPassword(otp);
    const expiresAt = new Date(
      Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000,
    );

    await prisma.passwordResetToken.create({
      data: { email, otpHash, expiresAt },
    });

    // ── Email stub ──────────────────────────────────────────────────────────
    // TODO: Replace with real email provider (Resend, SendGrid, etc.)
    console.log(`\n[Snipvis] Password reset OTP for ${email}: ${otp}\n`);
    // ────────────────────────────────────────────────────────────────────────

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

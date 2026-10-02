import { POST as forgotPassword } from "@/app/api/auth/forgot-password/route";
import { POST as resetPassword } from "@/app/api/auth/reset-password/route";
import type { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn().mockResolvedValue(null),
      update: vi
        .fn()
        .mockResolvedValue({ id: "user-1", email: "test@studio.com" }),
    },
    passwordResetToken: {
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      create: vi.fn().mockResolvedValue({ id: "token-1" }),
      findFirst: vi.fn().mockResolvedValue(null),
      update: vi.fn().mockResolvedValue({ id: "token-1", used: true }),
    },
    $transaction: vi
      .fn()
      .mockImplementation((callbacks: unknown[]) => Promise.all(callbacks)),
  },
}));

describe("Password Reset Routes", () => {
  it("rejects malformed email on forgot-password", async () => {
    const req = new Request("http://localhost:3000/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: "not-an-email" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await forgotPassword(req as unknown as NextRequest);
    expect(res.status).toBe(400);
  });

  it("handles non-existent user silently on forgot-password", async () => {
    const req = new Request("http://localhost:3000/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: "unknown-user-999@test.com" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await forgotPassword(req as unknown as NextRequest);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it("rejects invalid OTP format on reset-password", async () => {
    const req = new Request("http://localhost:3000/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        email: "demo@choicegrid.app",
        otp: "123",
        newPassword: "ValidPassword123!",
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await resetPassword(req as unknown as NextRequest);
    expect(res.status).toBe(400);
  });

  it("rejects short password on reset-password", async () => {
    const req = new Request("http://localhost:3000/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        email: "demo@choicegrid.app",
        otp: "123456",
        newPassword: "short",
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await resetPassword(req as unknown as NextRequest);
    expect(res.status).toBe(400);
  });
});

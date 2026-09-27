import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function handleApiError(err: unknown): NextResponse {
  if (err instanceof ZodError) {
    const message = err.errors[0]?.message ?? "Invalid request data";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "A unique constraint conflict occurred" },
        { status: 409 },
      );
    }
    if (err.code === "P2025") {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 },
      );
    }
  }

  const message = err instanceof Error ? err.message : "Internal server error";
  return NextResponse.json({ error: message }, { status: 500 });
}

import type { loginSchema } from "@/lib/validations";
import type { z } from "zod";

export interface AuthSessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}

export interface AuthTokenPayload {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}

export type LoginInput = z.infer<typeof loginSchema>;

export type LoginField = keyof LoginInput;

export type LoginFieldErrors = Partial<Record<LoginField, string>>;

export type LoginFormStatus = "idle" | "submitting" | "redirecting";

export interface CreateUserCliInput {
  email: string;
  password: string;
  name?: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  email: string;
  otp: string;
  newPassword: string;
}

export interface AuthSuccessResponse {
  ok: boolean;
}

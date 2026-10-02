"use client";

import { authService } from "@/services/api/auth.service";
import type { ForgotPasswordInput, ResetPasswordInput } from "@/types/auth";
import { useMutation } from "@tanstack/react-query";

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordInput) => authService.forgotPassword(data),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordInput) => authService.resetPassword(data),
  });
}

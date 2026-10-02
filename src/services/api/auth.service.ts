import { API_ROUTES } from "@/constants/routes";
import type {
  AuthSuccessResponse,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@/types/auth";
import { api } from "./client";

export const authService = {
  forgotPassword: (data: ForgotPasswordInput): Promise<AuthSuccessResponse> =>
    api(API_ROUTES.FORGOT_PASSWORD, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  resetPassword: (data: ResetPasswordInput): Promise<AuthSuccessResponse> =>
    api(API_ROUTES.RESET_PASSWORD, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

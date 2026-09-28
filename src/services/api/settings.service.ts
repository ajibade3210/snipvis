import { API_ROUTES } from "@/lib/constants";
import { UserProfileSchema } from "@/lib/validations";
import type { UpdateUserProfileInput, UserProfileResponse } from "@/types";
import { api } from "./client";

export const settingsService = {
  getProfile: (): Promise<UserProfileResponse> =>
    api(API_ROUTES.SETTINGS, {
      method: "GET",
      schema: UserProfileSchema,
    }),
  updateProfile: (data: UpdateUserProfileInput): Promise<UserProfileResponse> =>
    api(API_ROUTES.SETTINGS, {
      method: "PATCH",
      body: JSON.stringify(data),
      schema: UserProfileSchema,
    }),
};

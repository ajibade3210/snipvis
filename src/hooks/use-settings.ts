"use client";

import { QUERY_KEYS } from "@/lib/constants";
import { settingsService } from "@/services/api/settings.service";
import type { UpdateUserProfileInput, UserProfileResponse } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useUserProfile() {
  return useQuery<UserProfileResponse>({
    queryKey: [QUERY_KEYS.USER_PROFILE],
    queryFn: () => settingsService.getProfile(),
  });
}

export function useUpdateUserProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUserProfileInput) =>
      settingsService.updateProfile(data),
    onSuccess: (updated) => {
      qc.setQueryData([QUERY_KEYS.USER_PROFILE], updated);
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.USER_PROFILE] });
    },
  });
}

import { API_ROUTES } from "@/lib/constants";
import { AssetSchema } from "@/lib/validations";
import type { CreateAssetInput } from "@/types";
import { z } from "zod";
import { api } from "./client";

export const assetService = {
  listByProject: (projectId: string) =>
    api(`${API_ROUTES.ASSETS}?projectId=${encodeURIComponent(projectId)}`, {
      method: "GET",
      schema: z.array(AssetSchema),
    }),
  create: (data: CreateAssetInput) =>
    api(API_ROUTES.ASSETS, {
      method: "POST",
      body: JSON.stringify(data),
      schema: AssetSchema,
    }),
};

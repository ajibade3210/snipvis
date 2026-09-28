import { API_ROUTES } from "@/lib/constants";
import { AssetSchema } from "@/lib/validations";
import type { CreateAssetInput, UpdateAssetInput } from "@/types";
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
  update: (id: string, data: UpdateAssetInput) =>
    api(`${API_ROUTES.ASSETS}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      schema: AssetSchema,
    }),
  delete: (id: string) =>
    api(`${API_ROUTES.ASSETS}/${id}`, {
      method: "DELETE",
      schema: z.object({ success: z.boolean(), id: z.string() }),
    }),
};

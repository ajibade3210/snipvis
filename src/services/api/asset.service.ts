import { API_ROUTES } from "@/lib/constants";
import type { CreateAssetInput } from "@/types";
import { z } from "zod";
import { api } from "./client";

export const AssetSchema = z.object({
  id: z.string(),
  url: z.string(),
  type: z.string(),
  source: z.string().optional(),
  licenseText: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  projectContext: z
    .object({
      projectId: z.string(),
      note: z.string().nullable().optional(),
    })
    .optional(),
});

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

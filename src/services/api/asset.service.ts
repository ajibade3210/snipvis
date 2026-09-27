import { api } from "./client";
import { z } from "zod";
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
    api(`/api/assets?projectId=${projectId}`, {
      method: "GET",
      schema: z.array(AssetSchema),
    }),
  create: (data: any) =>
    api("/api/assets", {
      method: "POST",
      body: JSON.stringify(data),
      schema: AssetSchema,
    }),
};

import { api } from "./client";
import { z } from "zod";
export const InspirationSchema = z.object({
  id: z.string(),
  thumbnailUrl: z.string(),
  title: z.string().nullable().optional(),
  hook: z.string().nullable().optional(),
  channelName: z.string().nullable().optional(),
  views: z.string().nullable().optional(),
  sourceUrl: z.string().nullable().optional(),
  type: z.enum(["THUMBNAIL", "TITLE", "HOOK"]),
  note: z.string().nullable().optional(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
  projectContext: z
    .object({
      projectId: z.string(),
      note: z.string().nullable().optional(),
      favorite: z.boolean().optional(),
    })
    .optional(),
});
export const inspirationService = {
  listGlobal: (p?: { type?: string }) =>
    api(`/api/inspirations${p?.type ? `?type=${p.type}` : ""}`, {
      method: "GET",
      schema: z.array(InspirationSchema),
    }),
  listByProject: (projectId: string, opts?: any) => {
    const qs = new URLSearchParams({ projectId });
    if (opts?.favorite) qs.set("favorite", "true");
    if (opts?.type) qs.set("type", opts.type);
    return api(`/api/inspirations?${qs}`, {
      method: "GET",
      schema: z.array(InspirationSchema),
    });
  },
  create: (data: any) =>
    api("/api/inspirations", {
      method: "POST",
      body: JSON.stringify(data),
      schema: InspirationSchema,
    }),
  tag: (data: any) =>
    api("/api/inspirations/tag", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteTag: (projectId: string, inspirationId: string) =>
    api(
      `/api/inspirations/tag?projectId=${encodeURIComponent(projectId)}&inspirationId=${encodeURIComponent(inspirationId)}`,
      {
        method: "DELETE",
      },
    ),
};

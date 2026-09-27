import { API_ROUTES } from "@/lib/constants";
import type {
  CreateInspirationInput,
  InspirationType,
  TagInspirationInput,
} from "@/types";
import { z } from "zod";
import { api } from "./client";

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
  listGlobal: (p?: { type?: InspirationType | "ALL" }) =>
    api(
      `${API_ROUTES.INSPIRATIONS}${p?.type && p.type !== "ALL" ? `?type=${p.type}` : ""}`,
      {
        method: "GET",
        schema: z.array(InspirationSchema),
      },
    ),
  listByProject: (
    projectId: string,
    opts?: { favorite?: boolean; type?: InspirationType | "ALL" },
  ) => {
    const qs = new URLSearchParams({ projectId });
    if (opts?.favorite) qs.set("favorite", "true");
    if (opts?.type && opts.type !== "ALL") qs.set("type", opts.type);
    return api(`${API_ROUTES.INSPIRATIONS}?${qs}`, {
      method: "GET",
      schema: z.array(InspirationSchema),
    });
  },
  create: (data: CreateInspirationInput) =>
    api(API_ROUTES.INSPIRATIONS, {
      method: "POST",
      body: JSON.stringify(data),
      schema: InspirationSchema,
    }),
  tag: (data: TagInspirationInput) =>
    api(API_ROUTES.INSPIRATION_TAG, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteTag: (projectId: string, inspirationId: string) =>
    api(
      `${API_ROUTES.INSPIRATION_TAG}?projectId=${encodeURIComponent(projectId)}&inspirationId=${encodeURIComponent(inspirationId)}`,
      {
        method: "DELETE",
      },
    ),
};

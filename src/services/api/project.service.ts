import { API_ROUTES } from "@/lib/constants";
import type { CreateProjectInput, UpdateProjectInput } from "@/types";
import { z } from "zod";
import { api } from "./client";

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  channel: z.string().nullable().optional(),
  angle: z.string().nullable().optional(),
  hook: z.string().nullable().optional(),
  scriptLink: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  script: z.string().nullable().optional(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
  _count: z.object({ inspirations: z.number(), assets: z.number() }).optional(),
});

export const projectService = {
  list: () =>
    api(`${API_ROUTES.PROJECTS}`, {
      method: "GET",
      schema: z.array(ProjectSchema),
    }),
  get: (id: string) =>
    api(`${API_ROUTES.PROJECTS}/${id}`, {
      method: "GET",
      schema: ProjectSchema,
    }),
  create: (data: CreateProjectInput) =>
    api(API_ROUTES.PROJECTS, {
      method: "POST",
      body: JSON.stringify(data),
      schema: ProjectSchema,
    }),
  update: (id: string, data: UpdateProjectInput) =>
    api(`${API_ROUTES.PROJECTS}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      schema: ProjectSchema,
    }),
  seed: () =>
    api(API_ROUTES.SEED, {
      method: "POST",
    }),
};

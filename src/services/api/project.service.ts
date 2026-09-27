import { api } from "./client";
import { z } from "zod";
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
    api("/api/projects", { method: "GET", schema: z.array(ProjectSchema) }),
  get: (id: string) =>
    api(`/api/projects/${id}`, { method: "GET", schema: ProjectSchema }),
  create: (data: any) =>
    api("/api/projects", {
      method: "POST",
      body: JSON.stringify(data),
      schema: ProjectSchema,
    }),
  update: (id: string, data: any) =>
    api(`/api/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      schema: ProjectSchema,
    }),
  seed: () =>
    api("/api/seed", {
      method: "POST",
    }),
};

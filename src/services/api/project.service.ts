import { API_ROUTES } from "@/lib/constants";
import { ProjectSchema } from "@/lib/validations";
import type { CreateProjectInput, UpdateProjectInput } from "@/types";
import { z } from "zod";
import { api } from "./client";

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
  seed: (opts?: { force?: boolean }) =>
    api(`${API_ROUTES.SEED}${opts?.force ? "?force=true" : ""}`, {
      method: "POST",
    }),
};

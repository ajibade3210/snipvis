import { API_ROUTES } from "@/lib/constants";
import { ProjectSchema, ProjectThumbnailSchema } from "@/lib/validations";
import type {
  CreateProjectInput,
  CreateProjectThumbnailInput,
  UpdateProjectInput,
} from "@/types";
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
  addThumbnail: (projectId: string, data: CreateProjectThumbnailInput) =>
    api(`${API_ROUTES.PROJECTS}/${projectId}/thumbnails`, {
      method: "POST",
      body: JSON.stringify(data),
      schema: ProjectThumbnailSchema,
    }),
  setMainThumbnail: (projectId: string, thumbId: string) =>
    api(`${API_ROUTES.PROJECTS}/${projectId}/thumbnails/${thumbId}`, {
      method: "PATCH",
      body: JSON.stringify({ isMain: true }),
      schema: ProjectThumbnailSchema,
    }),
  deleteThumbnail: (projectId: string, thumbId: string) =>
    api(`${API_ROUTES.PROJECTS}/${projectId}/thumbnails/${thumbId}`, {
      method: "DELETE",
      schema: z.object({ success: z.boolean(), id: z.string() }),
    }),
};

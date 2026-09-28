import { API_ROUTES } from "@/lib/constants";
import { CompetitorSchema } from "@/types/competitor";
import type {
  CreateCompetitorInput,
  UpdateCompetitorInput,
} from "@/types/competitor";
import { z } from "zod";
import { api } from "./client";

export const competitorService = {
  list: () =>
    api(API_ROUTES.COMPETITORS, {
      method: "GET",
      schema: z.array(CompetitorSchema),
    }),

  create: (data: CreateCompetitorInput) =>
    api(API_ROUTES.COMPETITORS, {
      method: "POST",
      body: data,
      schema: CompetitorSchema,
    }),

  update: (id: string, data: UpdateCompetitorInput) =>
    api(`${API_ROUTES.COMPETITORS}/${id}`, {
      method: "PATCH",
      body: data,
      schema: CompetitorSchema,
    }),

  delete: (id: string) =>
    api(`${API_ROUTES.COMPETITORS}/${id}`, {
      method: "DELETE",
    }),
};

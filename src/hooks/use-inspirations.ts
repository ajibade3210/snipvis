import { inspirationService } from "@/services/api/inspiration.service";
import type { InspirationType } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useInspirationsGlobal = (params?: {
  type?: InspirationType | "ALL";
}) =>
  useQuery({
    queryKey: ["inspirations", "global", params?.type ?? "ALL"],
    queryFn: () =>
      inspirationService.listGlobal(
        params?.type && params.type !== "ALL"
          ? { type: params.type }
          : undefined,
      ),
  });

export const useInspirationsByProject = (
  projectId?: string | null,
  opts?: { favorite?: boolean; type?: InspirationType | "ALL" },
) =>
  useQuery({
    queryKey: [
      "inspirations",
      "project",
      projectId,
      opts?.favorite ? "fav" : "all",
      opts?.type ?? "ALL",
    ],
    queryFn: () => {
      if (!projectId) return [];
      return inspirationService.listByProject(projectId, {
        favorite: opts?.favorite,
        type: opts?.type && opts.type !== "ALL" ? opts.type : undefined,
      });
    },
    enabled: Boolean(projectId),
  });

export const useCreateInspiration = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: inspirationService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inspirations"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

export const useTagInspiration = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: inspirationService.tag,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inspirations"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

export const useDeleteTagInspiration = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      inspirationId,
    }: {
      projectId: string;
      inspirationId: string;
    }) => inspirationService.deleteTag(projectId, inspirationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inspirations"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

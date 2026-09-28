import { FILTER_ALL, QUERY_KEYS, QUERY_SUBKEYS } from "@/lib/constants";
import { inspirationService } from "@/services/api/inspiration.service";
import type { InspirationType } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useInspirationsGlobal = (params?: {
  type?: InspirationType | typeof FILTER_ALL;
}) =>
  useQuery({
    queryKey: [
      QUERY_KEYS.INSPIRATIONS,
      QUERY_SUBKEYS.GLOBAL,
      params?.type ?? FILTER_ALL,
    ],
    queryFn: () =>
      inspirationService.listGlobal(
        params?.type && params.type !== FILTER_ALL
          ? { type: params.type }
          : undefined,
      ),
  });

export const useInspirationsByProject = (
  projectId?: string | null,
  opts?: { favorite?: boolean; type?: InspirationType | typeof FILTER_ALL },
) =>
  useQuery({
    queryKey: [
      QUERY_KEYS.INSPIRATIONS,
      QUERY_SUBKEYS.PROJECT,
      projectId,
      opts?.favorite ? QUERY_SUBKEYS.FAV : QUERY_SUBKEYS.ALL,
      opts?.type ?? FILTER_ALL,
    ],
    queryFn: () => {
      if (!projectId) return [];
      return inspirationService.listByProject(projectId, {
        favorite: opts?.favorite,
        type: opts?.type && opts.type !== FILTER_ALL ? opts.type : undefined,
      });
    },
    enabled: Boolean(projectId),
  });

export const useCreateInspiration = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: inspirationService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.INSPIRATIONS] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PROJECTS] });
    },
  });
};

export const useTagInspiration = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: inspirationService.tag,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.INSPIRATIONS] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PROJECTS] });
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
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.INSPIRATIONS] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PROJECTS] });
    },
  });
};

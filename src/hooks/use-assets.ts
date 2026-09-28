import { QUERY_KEYS } from "@/lib/constants";
import { assetService } from "@/services/api/asset.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useAssetsByProject = (projectId?: string | null) =>
  useQuery({
    queryKey: [QUERY_KEYS.ASSETS, "project", projectId],
    queryFn: () => {
      if (!projectId) return [];
      return assetService.listByProject(projectId);
    },
    enabled: Boolean(projectId),
  });

export const useCreateAsset = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: assetService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ASSETS] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PROJECTS] });
    },
  });
};

export const useUpdateAsset = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof assetService.update>[1];
    }) => assetService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ASSETS] });
    },
  });
};

export const useDeleteAsset = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => assetService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ASSETS] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PROJECTS] });
    },
  });
};

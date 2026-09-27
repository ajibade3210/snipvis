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

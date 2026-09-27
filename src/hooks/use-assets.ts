import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { assetService } from "@/services/api/asset.service";

export const useAssetsByProject = (projectId?: string | null) =>
  useQuery({
    queryKey: ["assets", "project", projectId],
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
      qc.invalidateQueries({ queryKey: ["assets"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

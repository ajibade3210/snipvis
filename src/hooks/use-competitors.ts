import { QUERY_KEYS } from "@/lib/constants";
import { competitorService } from "@/services/api/competitor.service";
import type {
  CreateCompetitorInput,
  UpdateCompetitorInput,
} from "@/types/competitor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCompetitors = () =>
  useQuery({
    queryKey: [QUERY_KEYS.COMPETITORS],
    queryFn: competitorService.list,
  });

export const useCreateCompetitor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCompetitorInput) => competitorService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.COMPETITORS] });
    },
  });
};

export const useUpdateCompetitor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCompetitorInput }) =>
      competitorService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.COMPETITORS] });
    },
  });
};

export const useDeleteCompetitor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => competitorService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.COMPETITORS] });
    },
  });
};

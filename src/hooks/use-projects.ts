import { QUERY_KEYS } from "@/lib/constants";
import { projectService } from "@/services/api/project.service";
import type { UpdateProjectInput } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useProjects = () =>
  useQuery({
    queryKey: [QUERY_KEYS.PROJECTS],
    queryFn: projectService.list,
  });

export const useProject = (id?: string | null) =>
  useQuery({
    queryKey: [QUERY_KEYS.PROJECTS, id],
    queryFn: () => (id ? projectService.get(id) : null),
    enabled: Boolean(id),
  });

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: projectService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PROJECTS] });
    },
  });
};

export const useUpdateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectInput }) =>
      projectService.update(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PROJECTS] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PROJECTS, variables.id] });
    },
  });
};

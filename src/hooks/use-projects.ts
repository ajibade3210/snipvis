import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "@/services/api/project.service";

export const useProjects = () =>
  useQuery({
    queryKey: ["projects"],
    queryFn: projectService.list,
  });

export const useProject = (id?: string | null) =>
  useQuery({
    queryKey: ["projects", id],
    queryFn: () => (id ? projectService.get(id) : null),
    enabled: Boolean(id),
  });

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: projectService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

export const useUpdateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      projectService.update(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["projects", variables.id] });
    },
  });
};

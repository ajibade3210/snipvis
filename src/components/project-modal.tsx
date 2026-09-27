"use client";

import { Button } from "@/components/ui/button";
import { useCreateProject, useUpdateProject } from "@/hooks/use-projects";
import { createProjectSchema, updateProjectSchema } from "@/lib/validations";
import { useEffect, useState } from "react";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (projectId: string) => void;
  project?: {
    id: string;
    name: string;
    channel?: string | null;
    angle?: string | null;
    description?: string | null;
  } | null;
}

export function ProjectModal({
  isOpen,
  onClose,
  onCreated,
  project,
}: ProjectModalProps) {
  const [name, setName] = useState("");
  const [channel, setChannel] = useState("");
  const [angle, setAngle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const isEditing = Boolean(project?.id);

  useEffect(() => {
    if (project && isOpen) {
      setName(project.name ?? "");
      setChannel(project.channel ?? "");
      setAngle(project.angle ?? "");
      setDescription(project.description ?? "");
    } else if (!project && isOpen) {
      setName("");
      setChannel("");
      setAngle("");
      setDescription("");
    }
    setError(null);
  }, [project, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      name: name.trim(),
      channel: channel.trim() ? channel.trim().replace(/^@/, "") : undefined,
      angle: angle.trim() || undefined,
      description: description.trim() || undefined,
    };

    if (isEditing && project?.id) {
      const result = updateProjectSchema.safeParse(payload);
      if (!result.success) {
        setError(result.error.errors[0]?.message || "Validation failed");
        return;
      }
      try {
        await updateProject.mutateAsync({
          id: project.id,
          data: result.data,
        });
        onClose();
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Failed to update project",
        );
      }
    } else {
      const result = createProjectSchema.safeParse(payload);
      if (!result.success) {
        setError(result.error.errors[0]?.message || "Validation failed");
        return;
      }
      try {
        const created = await createProject.mutateAsync(result.data);
        setName("");
        setChannel("");
        setAngle("");
        setDescription("");
        onClose();
        if (onCreated && created?.id) {
          onCreated(created.id);
        }
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Failed to create project",
        );
      }
    }
  };

  const isPending = isEditing
    ? updateProject.isPending
    : createProject.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-card text-card-foreground border border-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in-0 zoom-in-95">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-base">
            {isEditing ? "Edit Project Details" : "Create New Project"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-sm font-semibold px-2 py-1 rounded"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error ? (
            <div className="p-3 text-xs rounded-md bg-destructive/10 text-destructive border border-destructive/20">
              {error}
            </div>
          ) : null}

          <div>
            <label className="block text-xs font-medium mb-1.5 text-foreground">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. How MrBeast Edits Retention Hooks"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5 text-foreground">
              Target Channel (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                @
              </span>
              <input
                type="text"
                placeholder="AliAbdaal or Veritasium"
                value={channel}
                onChange={(e) => setChannel(e.target.value.replace(/^@/, ""))}
                className="w-full h-9 pl-7 pr-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5 text-foreground">
              Core Angle / Concept (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="What makes this video unique? Thesis or hook angle."
              value={angle}
              onChange={(e) => setAngle(e.target.value)}
              className="w-full p-2.5 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5 text-foreground">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="General notes or goal for this project."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? isEditing
                  ? "Saving..."
                  : "Creating..."
                : isEditing
                  ? "Save Changes"
                  : "Create Project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { useCreateProject } from "@/hooks/use-projects";
import { createProjectSchema } from "@/lib/validations";
import { useState } from "react";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (projectId: string) => void;
}

export function ProjectModal({
  isOpen,
  onClose,
  onCreated,
}: ProjectModalProps) {
  const [name, setName] = useState("");
  const [channel, setChannel] = useState("");
  const [angle, setAngle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createProject = useCreateProject();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = createProjectSchema.safeParse({
      name: name.trim(),
      channel: channel.trim() || undefined,
      angle: angle.trim() || undefined,
      description: description.trim() || undefined,
    });

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
      setError(err instanceof Error ? err.message : "Failed to create project");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-card text-card-foreground border border-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in-0 zoom-in-95">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-base">Create New Project</h3>
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
            <input
              type="text"
              placeholder="e.g. Ali Abdaal / Veritasium"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
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
              disabled={createProject.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createProject.isPending}>
              {createProject.isPending ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

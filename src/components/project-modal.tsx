"use client";

import { Button } from "@/components/ui/button";
import { useChannels, useCreateChannel } from "@/hooks/use-channels";
import { useCreateProject, useUpdateProject } from "@/hooks/use-projects";
import { DEFAULT_PROJECT_EMOJIS } from "@/lib/constants";
import { createProjectSchema, updateProjectSchema } from "@/lib/validations";
import type { ChannelRecord } from "@/types/channel";
import { useEffect, useState } from "react";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (projectId: string) => void;
  defaultChannelId?: string | null;
  project?: {
    id: string;
    name: string;
    emoji?: string | null;
    channelId?: string | null;
    channel?: ChannelRecord | string | null;
    description?: string | null;
  } | null;
}

export function ProjectModal({
  isOpen,
  onClose,
  onCreated,
  defaultChannelId,
  project,
}: ProjectModalProps) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [selectedChannelId, setSelectedChannelId] = useState("");
  const [isCreatingChannelInline, setIsCreatingChannelInline] = useState(false);
  const [inlineChannelName, setInlineChannelName] = useState("");
  const [inlineChannelLink, setInlineChannelLink] = useState("");
  const [inlineChannelError, setInlineChannelError] = useState<string | null>(
    null,
  );
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: channels = [] } = useChannels();
  const createChannelMutation = useCreateChannel();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const isEditing = Boolean(project?.id);

  useEffect(() => {
    if (project && isOpen) {
      setName(project.name ?? "");
      setEmoji(project.emoji ?? "");
      setDescription(project.description ?? "");
      const initialChanId =
        project.channelId ??
        (typeof project.channel === "object" && project.channel
          ? project.channel.id
          : "");
      setSelectedChannelId(initialChanId ?? "");
    } else if (!project && isOpen) {
      setName("");
      setEmoji("");
      setDescription("");
      setSelectedChannelId(defaultChannelId ?? "");
    }
    setIsCreatingChannelInline(false);
    setInlineChannelName("");
    setInlineChannelLink("");
    setInlineChannelError(null);
    setError(null);
  }, [project, isOpen, defaultChannelId]);

  if (!isOpen) return null;

  const handleCreateChannelInline = async (e: React.MouseEvent) => {
    e.preventDefault();
    setInlineChannelError(null);
    const trimmed = inlineChannelName.trim();
    if (!trimmed) {
      setInlineChannelError("Channel name is required");
      return;
    }
    try {
      const created = await createChannelMutation.mutateAsync({
        name: trimmed,
        link: inlineChannelLink.trim() || undefined,
      });
      setSelectedChannelId(created.id);
      setIsCreatingChannelInline(false);
      setInlineChannelName("");
      setInlineChannelLink("");
    } catch (err: unknown) {
      setInlineChannelError(
        err instanceof Error ? err.message : "Failed to create channel",
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      name: name.trim(),
      emoji: emoji.trim() || null,
      channelId: selectedChannelId || null,
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
        setSelectedChannelId("");
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
              Project Emoji & Name <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={10}
                placeholder="✨"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                title="Project emoji icon"
                className="w-12 h-9 text-center text-lg rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <input
                type="text"
                required
                placeholder="e.g. How MrBeast Edits Retention Hooks"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 h-9 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            {/* Quick Emoji Presets & Clear */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground mr-1">
                Presets:
              </span>
              {DEFAULT_PROJECT_EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setEmoji(em)}
                  className={`w-7 h-7 rounded-md text-sm flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer ${
                    emoji === em
                      ? "bg-primary/15 border border-primary/40 ring-1 ring-primary/40"
                      : "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10"
                  }`}
                  title={`Select ${em}`}
                >
                  {em}
                </button>
              ))}
              {emoji ? (
                <button
                  type="button"
                  onClick={() => setEmoji("")}
                  className="text-[11px] text-muted-foreground hover:text-destructive underline ml-1 cursor-pointer"
                >
                  Remove Emoji
                </button>
              ) : null}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5 text-foreground">
              Target Channel (Optional)
            </label>
            <select
              value={isCreatingChannelInline ? "__NEW__" : selectedChannelId}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "__NEW__") {
                  setIsCreatingChannelInline(true);
                } else {
                  setIsCreatingChannelInline(false);
                  setSelectedChannelId(val);
                }
              }}
              className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">None (No Channel)</option>
              {channels.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              <option value="__NEW__">+ Add new channel...</option>
            </select>

            {isCreatingChannelInline && (
              <div className="mt-2.5 p-3 rounded-lg border border-primary/20 bg-primary/5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    New Channel
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingChannelInline(false);
                      setInlineChannelError(null);
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>

                {inlineChannelError && (
                  <div className="text-[11px] text-destructive">
                    {inlineChannelError}
                  </div>
                )}

                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Channel Name (e.g. MrBeast)"
                    value={inlineChannelName}
                    onChange={(e) => setInlineChannelName(e.target.value)}
                    className="w-full h-8 px-2.5 text-xs rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <input
                    type="url"
                    placeholder="Channel Link (optional, e.g. https://youtube.com/@...)"
                    value={inlineChannelLink}
                    onChange={(e) => setInlineChannelLink(e.target.value)}
                    className="w-full h-8 px-2.5 text-xs rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    onClick={handleCreateChannelInline}
                    disabled={createChannelMutation.isPending}
                    className="h-7 px-3 text-xs"
                  >
                    {createChannelMutation.isPending
                      ? "Creating..."
                      : "Save & Select"}
                  </Button>
                </div>
              </div>
            )}
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

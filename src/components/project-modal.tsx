"use client";

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
    <dialog
      open
      aria-label={isEditing ? "Edit Project Details" : "Create New Project"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/35 m-0 h-full w-full max-w-none border-0"
    >
      <div className="bg-[#FCFAF7] dark:bg-[#1C1815] border border-black/[0.08] dark:border-white/[0.08] text-[#1E1A17] dark:text-[#FAF8F5] rounded-3xl w-full max-w-lg flex flex-col shadow-2xl shadow-black/25 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Apple-Style Deferential Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-black/[0.04] dark:border-white/[0.05]">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-[#1E1A17] dark:text-white">
              {isEditing ? "Edit Project Details" : "Create New Project"}
            </h3>
            <p className="text-xs text-[#8C8379] dark:text-[#A89F95] mt-0.5">
              {isEditing
                ? "Update project name, channel, and creative brief context."
                : "Initialize a research workspace for your next video package."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-[#8C8379] hover:text-[#1E1A17] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
              <span className="font-semibold">Error:</span>
              <p className="flex-1 leading-relaxed">{error}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="project-name-input"
              className="block text-xs font-medium text-[#58524C] dark:text-[#A89F95]"
            >
              Project Emoji & Name <span className="text-[#FF5338]">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={10}
                placeholder="✨"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                title="Project emoji icon"
                className="w-12 h-10 text-center text-lg rounded-xl bg-white dark:bg-[#201C18] border border-black/[0.08] dark:border-white/[0.08] focus:border-[#FF5338] text-[#1E1A17] dark:text-white outline-none"
              />
              <input
                id="project-name-input"
                type="text"
                required
                placeholder="e.g. How MrBeast Edits Retention Hooks"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 h-10 px-3.5 text-xs rounded-xl bg-white dark:bg-[#201C18] border border-black/[0.08] dark:border-white/[0.08] focus:border-[#FF5338] text-[#1E1A17] dark:text-white outline-none"
              />
            </div>

            {/* Quick Emoji Presets & Clear */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-[#8C8379] mr-1">Presets:</span>
              {DEFAULT_PROJECT_EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setEmoji(em)}
                  className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer ${
                    emoji === em
                      ? "bg-[#FF5338]/15 border border-[#FF5338]/40 ring-1 ring-[#FF5338]/30"
                      : "bg-black/[0.04] dark:bg-white/[0.05] hover:bg-black/10 dark:hover:bg-white/10"
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
                  className="text-[11px] text-[#8C8379] hover:text-red-500 underline ml-1 cursor-pointer"
                >
                  Remove Emoji
                </button>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="project-channel-select"
              className="block text-xs font-medium text-[#58524C] dark:text-[#A89F95]"
            >
              Target Channel (Optional)
            </label>
            <select
              id="project-channel-select"
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
              className="w-full h-10 px-3 text-xs rounded-xl bg-white dark:bg-[#201C18] border border-black/[0.08] dark:border-white/[0.08] text-[#1E1A17] dark:text-white outline-none cursor-pointer"
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
              <div className="mt-2.5 p-3 rounded-2xl bg-black/[0.025] dark:bg-white/[0.03] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#1E1A17] dark:text-white">
                    New Channel
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingChannelInline(false);
                      setInlineChannelError(null);
                    }}
                    className="text-xs text-[#8C8379] hover:text-[#1E1A17] dark:hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                {inlineChannelError && (
                  <div className="text-[11px] text-red-500">
                    {inlineChannelError}
                  </div>
                )}

                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Channel Name (e.g. MrBeast)"
                    value={inlineChannelName}
                    onChange={(e) => setInlineChannelName(e.target.value)}
                    className="w-full h-8 px-2.5 text-xs rounded-lg bg-white dark:bg-[#201C18] border border-black/[0.08] dark:border-white/[0.08] text-[#1E1A17] dark:text-white outline-none"
                  />
                  <input
                    type="url"
                    placeholder="Channel Link (optional, e.g. https://youtube.com/@...)"
                    value={inlineChannelLink}
                    onChange={(e) => setInlineChannelLink(e.target.value)}
                    className="w-full h-8 px-2.5 text-xs rounded-lg bg-white dark:bg-[#201C18] border border-black/[0.08] dark:border-white/[0.08] text-[#1E1A17] dark:text-white outline-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleCreateChannelInline}
                    disabled={createChannelMutation.isPending}
                    className="h-8 px-3 rounded-full bg-[#1E1A17] dark:bg-white text-white dark:text-[#1E1A17] text-xs font-medium cursor-pointer shadow-xs"
                  >
                    {createChannelMutation.isPending
                      ? "Creating..."
                      : "Save & Select"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="project-description-textarea"
              className="block text-xs font-medium text-[#58524C] dark:text-[#A89F95]"
            >
              Description (Optional)
            </label>
            <textarea
              id="project-description-textarea"
              rows={2}
              placeholder="General notes or creative goal for this project."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 text-xs rounded-xl bg-white dark:bg-[#201C18] border border-black/[0.08] dark:border-white/[0.08] focus:border-[#FF5338] text-[#1E1A17] dark:text-white outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="pt-2 flex justify-end items-center gap-2 border-t border-black/[0.04] dark:border-white/[0.05]">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="h-9 px-4 rounded-full text-xs font-medium text-[#8C8379] hover:text-[#1E1A17] dark:hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="h-9 px-5 rounded-full bg-[#FF5338] hover:bg-[#E0452C] disabled:opacity-50 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              {isPending
                ? isEditing
                  ? "Saving..."
                  : "Creating..."
                : isEditing
                  ? "Save Changes"
                  : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

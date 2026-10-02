"use client";

import { useCreateInspiration } from "@/hooks/use-inspirations";
import { createInspirationSchema } from "@/lib/validations";
import { mediaService } from "@/services/api/media.service";
import { youtubeService } from "@/services/api/youtube.service";
import type { InspirationType } from "@/types";
import { useEffect, useRef, useState } from "react";

interface InspirationModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Array<{ id: string; name: string }>;
  defaultProjectId?: string | null;
  initialUrl?: string;
}

export function InspirationModal({
  isOpen,
  onClose,
  projects,
  defaultProjectId,
  initialUrl,
}: InspirationModalProps) {
  const [youtubeUrl, setYoutubeUrl] = useState(initialUrl || "");
  const [isFetchingYt, setIsFetchingYt] = useState(false);
  const [ytError, setYtError] = useState<string | null>(null);

  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<InspirationType>("THUMBNAIL");
  const [hook, setHook] = useState("");
  const [channelName, setChannelName] = useState("");
  const [views, setViews] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [note, setNote] = useState("");

  const [targetProjectId, setTargetProjectId] = useState<string>(
    defaultProjectId || (projects[0]?.id ?? ""),
  );
  const [projectNote, setProjectNote] = useState("");
  const [favorite, setFavorite] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);

  const createInspiration = useCreateInspiration();

  useEffect(() => {
    if (isOpen) {
      setTargetProjectId(defaultProjectId || (projects[0]?.id ?? ""));
    }
  }, [isOpen, defaultProjectId, projects]);

  // If initialUrl is passed when opened, populate and auto-fetch
  useEffect(() => {
    if (isOpen && initialUrl) {
      setYoutubeUrl(initialUrl);
      if (initialUrl.includes("youtu")) {
        setIsFetchingYt(true);
        youtubeService
          .fetchInfo(initialUrl.trim())
          .then((data) => {
            if (data.title) setTitle(data.title);
            if (data.channelName) setChannelName(data.channelName);
            if (data.thumbnailUrl) setThumbnailUrl(data.thumbnailUrl);
            if (data.sourceUrl) setSourceUrl(data.sourceUrl);
          })
          .catch((err: unknown) => {
            setYtError(
              err instanceof Error
                ? err.message
                : "Could not fetch YouTube info.",
            );
          })
          .finally(() => {
            setIsFetchingYt(false);
          });
      }
    }
  }, [isOpen, initialUrl]);

  if (!isOpen) return null;

  const handleFetchYoutube = async () => {
    if (!youtubeUrl.trim()) return;
    setIsFetchingYt(true);
    setYtError(null);

    try {
      const data = await youtubeService.fetchInfo(youtubeUrl.trim());
      if (data.title) setTitle(data.title);
      if (data.channelName) setChannelName(data.channelName);
      if (data.thumbnailUrl) setThumbnailUrl(data.thumbnailUrl);
      if (data.sourceUrl) setSourceUrl(data.sourceUrl);
    } catch (err: unknown) {
      setYtError(
        err instanceof Error
          ? err.message
          : "Could not fetch YouTube info. Check the URL.",
      );
    } finally {
      setIsFetchingYt(false);
    }
  };

  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingThumb(true);
    setFormError(null);

    try {
      const result = await mediaService.uploadMediaFile(file, {
        projectId: targetProjectId || undefined,
        category: "images",
      });
      setThumbnailUrl(result.publicUrl);
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : "Failed to upload thumbnail",
      );
    } finally {
      setIsUploadingThumb(false);
      if (thumbInputRef.current) {
        thumbInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const projectPayload = targetProjectId
      ? [
          {
            projectId: targetProjectId,
            note: projectNote.trim() || undefined,
            favorite,
          },
        ]
      : [];

    const result = createInspirationSchema.safeParse({
      thumbnailUrl: thumbnailUrl.trim(),
      title: title.trim() || undefined,
      type,
      hook: hook.trim() || undefined,
      channelName: channelName.trim() || undefined,
      views: views.trim() || undefined,
      sourceUrl: sourceUrl.trim() || undefined,
      note: note.trim() || undefined,
      projects: projectPayload,
    });

    if (!result.success) {
      setFormError(result.error.errors[0]?.message || "Validation failed");
      return;
    }

    try {
      await createInspiration.mutateAsync(result.data);
      // reset
      setThumbnailUrl("");
      setTitle("");
      setHook("");
      setChannelName("");
      setViews("");
      setSourceUrl("");
      setNote("");
      setProjectNote("");
      setFavorite(false);
      setYoutubeUrl("");
      onClose();
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : "Failed to save inspiration",
      );
    }
  };

  return (
    <dialog
      open
      aria-label="Add Research Inspiration"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/35 m-0 h-full w-full max-w-none border-0"
    >
      <div className="bg-[#FCFAF7] dark:bg-[#1C1815] border border-black/[0.08] dark:border-white/[0.08] text-[#1E1A17] dark:text-[#FAF8F5] rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl shadow-black/25 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Apple-Style Deferential Header */}
        <div className="flex items-center justify-between px-6 sm:px-7 pt-5 pb-3 border-b border-black/[0.04] dark:border-white/[0.05]">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-[#1E1A17] dark:text-white">
              Add Research Inspiration
            </h3>
            <p className="text-xs text-[#8C8379] dark:text-[#A89F95] mt-0.5">
              Save high-CTR thumbnails, titles, or hooks to your research vault.
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

        {/* Quick YouTube Paste */}
        <div className="px-6 sm:px-7 py-3.5 bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/[0.04] dark:border-white/[0.05] space-y-1.5">
          <label
            htmlFor="youtube-autofill-input"
            className="block text-[11px] font-semibold uppercase tracking-wider text-[#8C8379]"
          >
            Auto-Fill from YouTube
          </label>
          <div className="flex gap-2">
            <input
              id="youtube-autofill-input"
              type="url"
              placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="flex-1 h-10 px-3.5 text-xs rounded-xl bg-white dark:bg-[#201C18] border border-black/[0.08] dark:border-white/[0.08] focus:border-[#FF5338] text-[#1E1A17] dark:text-white outline-none"
            />
            <button
              type="button"
              onClick={handleFetchYoutube}
              disabled={isFetchingYt || !youtubeUrl.trim()}
              className="h-10 px-4 rounded-xl bg-[#1E1A17] dark:bg-white text-white dark:text-[#1E1A17] text-xs font-semibold disabled:opacity-50 transition-colors cursor-pointer shadow-xs shrink-0"
            >
              {isFetchingYt ? "Fetching..." : "Auto-Fill"}
            </button>
          </div>
          {ytError && <p className="text-xs text-red-500 mt-1">{ytError}</p>}
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-7 space-y-4 overflow-y-auto flex-1"
        >
          {formError && (
            <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
              <span className="font-semibold">Error:</span>
              <p className="flex-1 leading-relaxed">{formError}</p>
            </div>
          )}

          {/* Type Selector: Apple Segmented Pill Control */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#58524C] dark:text-[#A89F95]">
              Inspiration Type <span className="text-[#FF5338]">*</span>
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-black/[0.04] dark:bg-white/[0.05] rounded-xl">
              {(["THUMBNAIL", "TITLE", "HOOK"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer text-center ${
                    type === t
                      ? "bg-white dark:bg-[#2A2420] text-[#1E1A17] dark:text-white shadow-xs font-semibold"
                      : "text-[#8C8379] hover:text-[#1E1A17] dark:hover:text-white"
                  }`}
                >
                  {t === "THUMBNAIL"
                    ? "Thumbnail"
                    : t === "TITLE"
                      ? "Title"
                      : "Hook"}
                </button>
              ))}
            </div>
          </div>

          {/* Thumbnail URL */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="inspiration-thumbnail-input"
                className="text-xs font-medium text-[#58524C] dark:text-[#A89F95]"
              >
                Thumbnail / Image URL <span className="text-[#FF5338]">*</span>
              </label>
              <button
                type="button"
                onClick={() => thumbInputRef.current?.click()}
                disabled={isUploadingThumb}
                className="text-xs text-[#FF5338] hover:underline flex items-center gap-1 font-medium disabled:opacity-50 cursor-pointer"
              >
                {isUploadingThumb ? (
                  <span>Uploading to R2...</span>
                ) : (
                  <span>Upload local image</span>
                )}
              </button>
            </div>
            <input
              type="file"
              ref={thumbInputRef}
              accept="image/*"
              onChange={handleThumbnailUpload}
              className="hidden"
            />
            <input
              id="inspiration-thumbnail-input"
              type="url"
              required
              placeholder="https://... (or click 'Upload local image')"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              className="w-full h-10 px-3.5 text-xs rounded-xl bg-white dark:bg-[#201C18] border border-black/[0.08] dark:border-white/[0.08] focus:border-[#FF5338] text-[#1E1A17] dark:text-white outline-none"
            />
            {thumbnailUrl && (
              <div className="mt-2 rounded-2xl overflow-hidden border border-black/[0.06] dark:border-white/[0.08] aspect-video max-h-36 bg-black/5 flex items-center justify-center">
                <img
                  src={thumbnailUrl}
                  alt="Preview thumbnail"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label
              htmlFor="inspiration-title-input"
              className="block text-xs font-medium text-[#58524C] dark:text-[#A89F95]"
            >
              Video / Asset Title
            </label>
            <input
              id="inspiration-title-input"
              type="text"
              placeholder="e.g. I Spent 100 Hours Crafting the Ultimate Intro"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-10 px-3.5 text-xs rounded-xl bg-white dark:bg-[#201C18] border border-black/[0.08] dark:border-white/[0.08] focus:border-[#FF5338] text-[#1E1A17] dark:text-white outline-none"
            />
          </div>

          {/* Hook (if type is HOOK or extra details) */}
          <div className="space-y-1.5">
            <label
              htmlFor="inspiration-hook-textarea"
              className="block text-xs font-medium text-[#58524C] dark:text-[#A89F95]"
            >
              Hook / Script Segment{" "}
              {type === "HOOK" ? "(Important)" : "(Optional)"}
            </label>
            <textarea
              id="inspiration-hook-textarea"
              rows={2}
              placeholder="Write or paste the exact retention hook used in the first 10 seconds..."
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              className="w-full p-3 text-xs rounded-xl bg-white dark:bg-[#201C18] border border-black/[0.08] dark:border-white/[0.08] focus:border-[#FF5338] text-[#1E1A17] dark:text-white outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="inspiration-channel-input"
                className="block text-xs font-medium text-[#58524C] dark:text-[#A89F95]"
              >
                Channel Name
              </label>
              <input
                id="inspiration-channel-input"
                type="text"
                placeholder="e.g. Cleo Abram"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                className="w-full h-10 px-3.5 text-xs rounded-xl bg-white dark:bg-[#201C18] border border-black/[0.08] dark:border-white/[0.08] text-[#1E1A17] dark:text-white outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="inspiration-views-input"
                className="block text-xs font-medium text-[#58524C] dark:text-[#A89F95]"
              >
                Views
              </label>
              <input
                id="inspiration-views-input"
                type="text"
                placeholder="e.g. 2.4M views"
                value={views}
                onChange={(e) => setViews(e.target.value)}
                className="w-full h-10 px-3.5 text-xs rounded-xl bg-white dark:bg-[#201C18] border border-black/[0.08] dark:border-white/[0.08] text-[#1E1A17] dark:text-white outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="inspiration-source-input"
              className="block text-xs font-medium text-[#58524C] dark:text-[#A89F95]"
            >
              Source URL
            </label>
            <input
              id="inspiration-source-input"
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="w-full h-10 px-3.5 text-xs rounded-xl bg-white dark:bg-[#201C18] border border-black/[0.08] dark:border-white/[0.08] text-[#1E1A17] dark:text-white outline-none"
            />
          </div>

          {/* Project Linkage */}
          <div className="p-4 bg-black/[0.025] dark:bg-white/[0.03] rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="inspiration-project-select"
                className="text-xs font-semibold text-[#1E1A17] dark:text-white"
              >
                Assign to Project (Optional)
              </label>
              <label className="flex items-center gap-1.5 text-xs text-[#58524C] dark:text-[#A89F95] cursor-pointer">
                <input
                  type="checkbox"
                  checked={favorite}
                  onChange={(e) => setFavorite(e.target.checked)}
                  className="rounded border-black/20 text-[#FF5338] focus:ring-[#FF5338]"
                />
                Mark as Favorite (★)
              </label>
            </div>

            <select
              id="inspiration-project-select"
              value={targetProjectId}
              onChange={(e) => setTargetProjectId(e.target.value)}
              className="w-full h-10 px-3 text-xs rounded-xl bg-white dark:bg-[#201C18] border border-black/[0.08] dark:border-white/[0.08] text-[#1E1A17] dark:text-white outline-none cursor-pointer"
            >
              <option value="">No Project (Global Vault Only)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {targetProjectId && (
              <input
                type="text"
                placeholder="Per-project note (e.g. Try this color grading style)"
                value={projectNote}
                onChange={(e) => setProjectNote(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-xl bg-white dark:bg-[#201C18] border border-black/[0.08] dark:border-white/[0.08] text-[#1E1A17] dark:text-white outline-none"
              />
            )}
          </div>

          <div className="pt-2 flex justify-end items-center gap-2 border-t border-black/[0.04] dark:border-white/[0.05]">
            <button
              type="button"
              onClick={onClose}
              disabled={createInspiration.isPending}
              className="h-9 px-4 rounded-full text-xs font-medium text-[#8C8379] hover:text-[#1E1A17] dark:hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createInspiration.isPending}
              className="h-9 px-5 rounded-full bg-[#FF5338] hover:bg-[#E0452C] disabled:opacity-50 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              {createInspiration.isPending ? "Saving..." : "Save Inspiration"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

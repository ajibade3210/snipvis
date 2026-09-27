"use client";

import { Button } from "@/components/ui/button";
import { useCreateInspiration } from "@/hooks/use-inspirations";
import {
  createInspirationSchema,
  type inspirationTypeEnum,
} from "@/lib/validations";
import { youtubeService } from "@/services/api/youtube.service";
import { useEffect, useState } from "react";

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
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"THUMBNAIL" | "TITLE" | "HOOK">("THUMBNAIL");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-card text-card-foreground border border-border rounded-xl shadow-xl w-full max-w-xl my-8 overflow-hidden animate-in fade-in-0 zoom-in-95">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-base">
              Add Research Inspiration
            </h3>
            <p className="text-xs text-muted-foreground">
              Save thumbnails, titles, or hooks to your research vault.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-sm font-semibold px-2 py-1 rounded"
          >
            ✕
          </button>
        </div>

        {/* Quick YouTube Paste */}
        <div className="bg-muted/40 p-4 border-b border-border">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            ⚡ Quick Auto-Fill from YouTube
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="flex-1 h-9 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleFetchYoutube}
              disabled={isFetchingYt || !youtubeUrl.trim()}
              className="h-9 text-xs font-medium"
            >
              {isFetchingYt ? "Fetching..." : "Auto-Fill"}
            </Button>
          </div>
          {ytError ? (
            <p className="text-xs text-destructive mt-1.5">{ytError}</p>
          ) : null}
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 max-h-[70vh] overflow-y-auto"
        >
          {formError ? (
            <div className="p-3 text-xs rounded-md bg-destructive/10 text-destructive border border-destructive/20">
              {formError}
            </div>
          ) : null}

          {/* Type Selector */}
          <div>
            <label className="block text-xs font-medium mb-1.5 text-foreground">
              Inspiration Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["THUMBNAIL", "TITLE", "HOOK"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`py-2 text-xs font-medium rounded-md border transition-all ${
                    type === t
                      ? "border-primary bg-primary text-primary-foreground font-semibold"
                      : "border-input bg-background hover:bg-accent text-foreground"
                  }`}
                >
                  {t === "THUMBNAIL"
                    ? "🖼️ Thumbnail"
                    : t === "TITLE"
                      ? "🏷️ Title"
                      : "🎣 Hook"}
                </button>
              ))}
            </div>
          </div>

          {/* Thumbnail URL */}
          <div>
            <label className="block text-xs font-medium mb-1.5 text-foreground">
              Thumbnail / Image URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              required
              placeholder="https://... (image url or YouTube thumbnail)"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {thumbnailUrl ? (
              <div className="mt-2 rounded-md overflow-hidden border border-border aspect-video max-h-36 bg-muted flex items-center justify-center">
                <img
                  src={thumbnailUrl}
                  alt="Preview thumbnail"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
            ) : null}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium mb-1.5 text-foreground">
              Video / Asset Title
            </label>
            <input
              type="text"
              placeholder="e.g. I Spent 100 Hours Crafting the Ultimate Intro"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Hook (if type is HOOK or extra details) */}
          <div>
            <label className="block text-xs font-medium mb-1.5 text-foreground">
              Hook / Script Segment{" "}
              {type === "HOOK" ? "(Important)" : "(Optional)"}
            </label>
            <textarea
              rows={2}
              placeholder="Write or paste the exact retention hook used in the first 10 seconds..."
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              className="w-full p-2.5 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5 text-foreground">
                Channel Name
              </label>
              <input
                type="text"
                placeholder="e.g. Cleo Abram"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-foreground">
                Views
              </label>
              <input
                type="text"
                placeholder="e.g. 2.4M views"
                value={views}
                onChange={(e) => setViews(e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5 text-foreground">
              Source URL
            </label>
            <input
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Project Linkage */}
          <div className="p-3 bg-muted/30 rounded-lg border border-border space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">
                Assign to Project (Optional)
              </label>
              <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={favorite}
                  onChange={(e) => setFavorite(e.target.checked)}
                  className="rounded border-input text-primary"
                />
                Mark as Favorite (★)
              </label>
            </div>

            <select
              value={targetProjectId}
              onChange={(e) => setTargetProjectId(e.target.value)}
              className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">No Project (Global Vault Only)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {targetProjectId ? (
              <div>
                <input
                  type="text"
                  placeholder="Per-project note (e.g. Try this color grading style)"
                  value={projectNote}
                  onChange={(e) => setProjectNote(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            ) : null}
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createInspiration.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createInspiration.isPending}>
              {createInspiration.isPending ? "Saving..." : "Save Inspiration"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

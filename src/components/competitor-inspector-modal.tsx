"use client";

import {
  useDeleteCompetitor,
  useUpdateCompetitor,
} from "@/hooks/use-competitors";
import { youtubeService } from "@/services/api/youtube.service";
import type { CompetitorRecord } from "@/types/competitor";
import { useEffect, useState } from "react";

interface CompetitorInspectorModalProps {
  competitor: CompetitorRecord | null;
  onClose: () => void;
}

export function CompetitorInspectorModal({
  competitor,
  onClose,
}: CompetitorInspectorModalProps) {
  const updateMutation = useUpdateCompetitor();
  const deleteMutation = useDeleteCompetitor();

  const [note, setNote] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (competitor) {
      setNote(competitor.personalNote || "");
      setSyncStatus(null);
      setShowDeleteConfirm(false);
    }
  }, [competitor]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!competitor) return null;

  const handleSaveNote = async () => {
    setIsSavingNote(true);
    try {
      await updateMutation.mutateAsync({
        id: competitor.id,
        data: { personalNote: note.trim() || undefined },
      });
      setSyncStatus("Note saved successfully.");
      setTimeout(() => setSyncStatus(null), 3000);
    } catch {
      setSyncStatus("Failed to save note.");
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleToggleReproducible = async () => {
    try {
      await updateMutation.mutateAsync({
        id: competitor.id,
        data: { reproducible: !competitor.reproducible },
      });
    } catch {
      // ignore
    }
  };

  const handleSyncLatestStats = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const fresh = await youtubeService.fetchChannelInfo(
        competitor.channelUrl,
      );
      await updateMutation.mutateAsync({
        id: competitor.id,
        data: {
          channelName: fresh.channelName || competitor.channelName,
          avatarUrl: fresh.avatarUrl || competitor.avatarUrl || undefined,
          description: fresh.description || competitor.description || undefined,
          currentSubscriberCount:
            fresh.subscriberCount ||
            competitor.currentSubscriberCount ||
            undefined,
          totalViewCount:
            fresh.totalViewCount || competitor.totalViewCount || undefined,
          videoCount: fresh.videoCount ?? competitor.videoCount ?? undefined,
          avgViewCount:
            fresh.avgViewCount || competitor.avgViewCount || undefined,
          uploadFrequency:
            fresh.uploadFrequency || competitor.uploadFrequency || undefined,
          lastUploadDate:
            fresh.lastUploadDate || competitor.lastUploadDate || undefined,
          startedDate: fresh.startedDate || competitor.startedDate || undefined,
          mostPopularVideoTitle:
            fresh.mostPopularVideoTitle ||
            competitor.mostPopularVideoTitle ||
            undefined,
          mostPopularVideoUrl:
            fresh.mostPopularVideoUrl ||
            competitor.mostPopularVideoUrl ||
            undefined,
          mostPopularVideoThumb:
            fresh.mostPopularVideoThumb ||
            competitor.mostPopularVideoThumb ||
            undefined,
          country: fresh.country || competitor.country || undefined,
          customUrl: fresh.customUrl || competitor.customUrl || undefined,
          hiddenSubscriberCount:
            fresh.hiddenSubscriberCount ??
            competitor.hiddenSubscriberCount ??
            false,
          keywords: fresh.keywords || competitor.keywords || [],
        },
      });
      setSyncStatus("✨ Fresh YouTube statistics synced!");
      setTimeout(() => setSyncStatus(null), 4000);
    } catch {
      setSyncStatus("Could not fetch latest YouTube data. Try again later.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteCompetitor = async () => {
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(competitor.id);
      onClose();
    } catch {
      setIsDeleting(false);
    }
  };

  const formattedLastUpload = competitor.lastUploadDate
    ? new Date(competitor.lastUploadDate).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const formattedStarted = competitor.startedDate
    ? new Date(competitor.startedDate).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : null;

  const keywordsList = competitor.keywords || [];

  return (
    <dialog
      open
      aria-label={competitor.channelName}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/35 m-0 h-full w-full max-w-none border-0"
    >
      <div className="bg-[#FCFAF7] dark:bg-[#1C1815] border border-black/[0.08] dark:border-white/[0.08] text-[#1E1A17] dark:text-[#FAF8F5] rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl shadow-black/25 space-y-6 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Apple-Style Deferential Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-black/5 dark:bg-white/5 shrink-0 border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center">
              {competitor.avatarUrl ? (
                <img
                  src={competitor.avatarUrl}
                  alt={competitor.channelName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-base font-bold text-[#FF5338]">
                  {competitor.channelName.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#1E1A17] dark:text-[#FAF8F5] truncate">
                  {competitor.channelName}
                </h2>
                {competitor.country && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/[0.04] dark:bg-white/[0.06] text-[#8C8379] dark:text-[#A89F95] uppercase">
                    {competitor.country}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleToggleReproducible}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium transition-all cursor-pointer ${
                    competitor.reproducible
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-black/[0.04] dark:bg-white/[0.06] text-[#8C8379] hover:text-[#1E1A17] dark:hover:text-white"
                  }`}
                >
                  <span>{competitor.reproducible ? "✓" : "○"}</span>
                  <span>
                    {competitor.reproducible
                      ? "Reproducible Niche"
                      : "Mark Reproducible"}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#8C8379] flex-wrap">
                <a
                  href={competitor.channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FF5338] hover:underline font-medium inline-flex items-center gap-1"
                >
                  <span>
                    {competitor.customUrl ||
                      competitor.channelUrl.replace(/^https?:\/\/(www\.)?/, "")}
                  </span>
                  <span>↗</span>
                </a>
                {formattedStarted && <span>Joined {formattedStarted}</span>}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full text-[#8C8379] hover:text-[#1E1A17] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Sync Status Badge */}
        {syncStatus && (
          <div className="px-3.5 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-600 dark:text-emerald-400 animate-in fade-in">
            {syncStatus}
          </div>
        )}

        {/* Metrics Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#8C8379] uppercase tracking-wider">
              Channel Intelligence Metrics
            </span>
            <span className="text-[10px] text-[#8C8379]">
              YouTube Data API v3
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Subscribers */}
            <div className="bg-black/[0.025] dark:bg-white/[0.03] p-3.5 rounded-2xl space-y-0.5">
              <p className="text-[10px] font-medium text-[#8C8379] uppercase tracking-wide">
                Subscribers
              </p>
              <p className="text-base font-bold text-[#1E1A17] dark:text-[#FAF8F5]">
                {competitor.hiddenSubscriberCount
                  ? "Hidden"
                  : competitor.currentSubscriberCount || "—"}
              </p>
              <p className="text-[10px] text-[#8C8379]">
                {competitor.subscriberCountAtAdd
                  ? `Added at: ${competitor.subscriberCountAtAdd}`
                  : "Verified count"}
              </p>
            </div>

            {/* Total Views */}
            <div className="bg-black/[0.025] dark:bg-white/[0.03] p-3.5 rounded-2xl space-y-0.5">
              <p className="text-[10px] font-medium text-[#8C8379] uppercase tracking-wide">
                All-Time Views
              </p>
              <p className="text-base font-bold text-[#1E1A17] dark:text-[#FAF8F5]">
                {competitor.totalViewCount || "—"}
              </p>
              <p className="text-[10px] text-[#8C8379]">Total channel reach</p>
            </div>

            {/* Video Count */}
            <div className="bg-black/[0.025] dark:bg-white/[0.03] p-3.5 rounded-2xl space-y-0.5">
              <p className="text-[10px] font-medium text-[#8C8379] uppercase tracking-wide">
                Public Videos
              </p>
              <p className="text-base font-bold text-[#1E1A17] dark:text-[#FAF8F5]">
                {competitor.videoCount !== null &&
                competitor.videoCount !== undefined
                  ? competitor.videoCount.toLocaleString()
                  : "—"}
              </p>
              <p className="text-[10px] text-[#8C8379]">Total catalog</p>
            </div>

            {/* Avg Views */}
            <div className="bg-black/[0.025] dark:bg-white/[0.03] p-3.5 rounded-2xl space-y-0.5">
              <p className="text-[10px] font-medium text-[#8C8379] uppercase tracking-wide">
                Avg Views / Video
              </p>
              <p className="text-base font-bold text-[#1E1A17] dark:text-[#FAF8F5]">
                {competitor.avgViewCount ? `~${competitor.avgViewCount}` : "—"}
              </p>
              <p className="text-[10px] text-[#8C8379]">Recent 15 uploads</p>
            </div>

            {/* Upload Frequency */}
            <div className="col-span-2 bg-black/[0.025] dark:bg-white/[0.03] p-3.5 rounded-2xl space-y-0.5">
              <p className="text-[10px] font-medium text-[#8C8379] uppercase tracking-wide">
                Upload Cadence
              </p>
              <p className="text-xs font-semibold text-[#1E1A17] dark:text-[#FAF8F5] capitalize">
                {competitor.uploadFrequency || "Unscheduled / Irregular"}
              </p>
              <p className="text-[10px] text-[#8C8379]">
                Calculated from publishing timestamps
              </p>
            </div>

            {/* Last Upload */}
            <div className="col-span-2 bg-black/[0.025] dark:bg-white/[0.03] p-3.5 rounded-2xl space-y-0.5">
              <p className="text-[10px] font-medium text-[#8C8379] uppercase tracking-wide">
                Last Upload Date
              </p>
              <p className="text-xs font-semibold text-[#1E1A17] dark:text-[#FAF8F5]">
                {formattedLastUpload || "—"}
              </p>
              <p className="text-[10px] text-[#8C8379]">
                Most recent public release
              </p>
            </div>
          </div>
        </div>

        {/* Channel Description */}
        {competitor.description && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-[#8C8379] uppercase tracking-wider">
              Channel Focus & Bio
            </span>
            <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] text-xs text-[#58524C] dark:text-[#A89F95] leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto">
              {competitor.description}
            </div>
          </div>
        )}

        {/* Channel Keywords / Tags */}
        {keywordsList.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-[#8C8379] uppercase tracking-wider">
              Channel Keywords & SEO Tags ({keywordsList.length})
            </span>
            <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] max-h-28 overflow-y-auto">
              {keywordsList.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-white dark:bg-[#201C18] text-[#58524C] dark:text-[#A89F95] border border-black/[0.06] dark:border-white/[0.08]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Top / Outlier Video Preview */}
        {competitor.mostPopularVideoTitle && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-[#8C8379] uppercase tracking-wider">
              Top / Outlier Video
            </span>
            <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] flex items-center gap-3">
              {competitor.mostPopularVideoThumb && (
                <img
                  src={competitor.mostPopularVideoThumb}
                  alt={competitor.mostPopularVideoTitle}
                  className="w-24 h-14 rounded-xl object-cover shrink-0"
                />
              )}
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-xs font-semibold text-[#1E1A17] dark:text-[#FAF8F5] line-clamp-1">
                  {competitor.mostPopularVideoTitle}
                </p>
                {competitor.mostPopularVideoUrl && (
                  <a
                    href={competitor.mostPopularVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#FF5338] hover:underline inline-flex items-center gap-1 font-medium"
                  >
                    <span>Watch Video on YouTube</span>
                    <span>↗</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Strategy Notes & Creator Observations */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#8C8379] uppercase tracking-wider">
              Strategy Notes & Creator Audit
            </span>
            {competitor.personalNote && (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                ✓ Recorded
              </span>
            )}
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Record observations: pacing, audio choices, visual hooks, title formulas, thumbnail contrast..."
            className="w-full p-3.5 text-xs rounded-2xl bg-white dark:bg-[#201C18] border border-black/[0.08] dark:border-white/[0.08] focus:border-[#FF5338] text-[#1E1A17] dark:text-[#FAF8F5] placeholder-[#8C8379] outline-none resize-none leading-relaxed"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveNote}
              disabled={isSavingNote}
              className="h-8 px-4 rounded-full bg-[#FF5338] hover:bg-[#E0452C] text-white text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {isSavingNote ? "Saving…" : "Save Notes"}
            </button>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.05] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleSyncLatestStats}
            disabled={isSyncing}
            className="h-9 px-4 rounded-full bg-black/[0.04] dark:bg-white/[0.05] hover:bg-black/10 dark:hover:bg-white/10 text-xs font-semibold text-[#1E1A17] dark:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSyncing ? (
              <>
                <span className="w-3 h-3 rounded-full border-2 border-[#FF5338] border-t-transparent animate-spin" />
                <span>Syncing YouTube API…</span>
              </>
            ) : (
              <span>Refresh YouTube Stats</span>
            )}
          </button>

          {showDeleteConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                Stop tracking?
              </span>
              <button
                type="button"
                onClick={handleDeleteCompetitor}
                disabled={isDeleting}
                className="h-8 px-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? "Deleting…" : "Confirm"}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="h-8 px-3.5 rounded-full text-xs font-medium text-[#8C8379] hover:text-[#1E1A17] dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-xs font-medium text-[#8C8379] hover:text-red-600 dark:hover:text-red-400 transition-colors self-center sm:self-auto py-1 cursor-pointer"
            >
              Stop Tracking Channel
            </button>
          )}
        </div>
      </div>
    </dialog>
  );
}

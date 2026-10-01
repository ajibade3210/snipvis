"use client";

import { CompetitorInspectorModal } from "@/components/competitor-inspector-modal";

import {
  useCompetitors,
  useCreateCompetitor,
  useDeleteCompetitor,
  useUpdateCompetitor,
} from "@/hooks/use-competitors";
import { UPLOAD_FREQUENCY_PRESETS } from "@/lib/constants";
import { computeUploadFrequency } from "@/lib/upload-frequency";
import { youtubeService } from "@/services/api/youtube.service";
import type {
  CompetitorRecord,
  CreateCompetitorInput,
  UpdateCompetitorInput,
} from "@/types/competitor";
import { useState } from "react";

function CadenceCalculator({
  onCalculated,
}: {
  onCalculated: (cadence: string) => void;
}) {
  const [datesText, setDatesText] = useState("");
  const [calcResult, setCalcResult] = useState<string | null>(null);

  const handleCalculate = () => {
    const rawDates = datesText
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const result = computeUploadFrequency(rawDates);
    setCalcResult(result);
    if (result !== "Not enough data") {
      onCalculated(result);
    }
  };

  return (
    <div className="p-3 bg-[#F7F4EF] dark:bg-[#221E1A] rounded-xl border border-[#E3DCD3] dark:border-[#3C3530] space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-bold text-[11px] text-[#58524C] dark:text-[#A89F95]">
          Average Upload Calculator
        </span>
        <span className="text-[10px] text-[#8C8379]">Paste 2+ video dates</span>
      </div>
      <textarea
        value={datesText}
        onChange={(e) => setDatesText(e.target.value)}
        placeholder="e.g. 2026-09-28, 2026-09-25, 2026-09-21 (or ISO timestamps)"
        rows={2}
        className="w-full p-2 text-xs rounded-lg border border-[#E3DCD3] dark:border-[#3C3530] bg-white dark:bg-[#1E1A17] text-[#1E1A17] dark:text-[#FAF8F5] placeholder-[#8C8379] focus:outline-none focus:ring-2 focus:ring-[#FF5338] resize-none"
      />
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleCalculate}
          className="h-6 px-3 rounded-full bg-[#1E1A17] dark:bg-[#FAF8F5] text-white dark:text-[#1E1A17] text-[10px] font-bold tactile-btn"
        >
          Compute Frequency
        </button>
        {calcResult && (
          <span className="text-[11px] font-bold text-[#FF5338]">
            Result: {calcResult}
          </span>
        )}
      </div>
    </div>
  );
}

function AddCompetitorForm({
  onAdd,
  onCancel,
  isPending,
}: {
  onAdd: (data: CreateCompetitorInput) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [channelUrl, setChannelUrl] = useState("");
  const [channelName, setChannelName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [currentSubscriberCount, setCurrentSubscriberCount] = useState("");
  const [uploadFrequency, setUploadFrequency] = useState("");
  const [lastUploadDate, setLastUploadDate] = useState("");
  const [mostPopularVideoTitle, setMostPopularVideoTitle] = useState("");
  const [mostPopularVideoUrl, setMostPopularVideoUrl] = useState("");
  const [mostPopularVideoThumb, setMostPopularVideoThumb] = useState("");
  const [description, setDescription] = useState("");
  const [personalNote, setPersonalNote] = useState("");
  const [startedDate, setStartedDate] = useState("");
  const [avgViewCount, setAvgViewCount] = useState("");
  const [totalViewCount, setTotalViewCount] = useState("");
  const [videoCount, setVideoCount] = useState<number | undefined>(undefined);
  const [country, setCountry] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [hiddenSubscriberCount, setHiddenSubscriberCount] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [reproducible, setReproducible] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  const [isFetchingYt, setIsFetchingYt] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [autoFilledBadge, setAutoFilledBadge] = useState<string | null>(null);

  const handleFetchYoutube = async (targetUrl: string) => {
    const trimmed = targetUrl.trim();
    if (!trimmed || (!trimmed.includes("youtu") && !trimmed.startsWith("@"))) {
      return;
    }

    setIsFetchingYt(true);
    setFetchError(null);
    setAutoFilledBadge(null);

    try {
      const data = await youtubeService.fetchChannelInfo(trimmed);
      if (data.channelName) setChannelName(data.channelName);
      if (data.channelUrl) setChannelUrl(data.channelUrl);
      if (data.avatarUrl) setAvatarUrl(data.avatarUrl);
      if (data.description) setDescription(data.description);
      if (data.subscriberCount) setCurrentSubscriberCount(data.subscriberCount);
      if (data.uploadFrequency) setUploadFrequency(data.uploadFrequency);

      if (data.totalViewCount) setTotalViewCount(data.totalViewCount);
      if (data.videoCount !== undefined && data.videoCount !== null) {
        setVideoCount(data.videoCount);
      }
      if (data.country) setCountry(data.country);
      if (data.customUrl) setCustomUrl(data.customUrl);
      if (
        data.hiddenSubscriberCount !== undefined &&
        data.hiddenSubscriberCount !== null
      ) {
        setHiddenSubscriberCount(data.hiddenSubscriberCount);
      }
      if (data.keywords && data.keywords.length > 0) {
        setKeywords(data.keywords);
      }

      if (data.avgViewCount) {
        setAvgViewCount(data.avgViewCount);
      }

      if (data.lastUploadDate) {
        try {
          const isoDate = new Date(data.lastUploadDate)
            .toISOString()
            .split("T")[0];
          setLastUploadDate(isoDate);
        } catch {
          // ignore date parse fallback
        }
      }

      if (data.startedDate) {
        try {
          const isoDate = new Date(data.startedDate)
            .toISOString()
            .split("T")[0];
          setStartedDate(isoDate);
        } catch {
          // ignore date parse fallback
        }
      }

      if (data.mostPopularVideoTitle) {
        setMostPopularVideoTitle(data.mostPopularVideoTitle);
      }
      if (data.mostPopularVideoUrl) {
        setMostPopularVideoUrl(data.mostPopularVideoUrl);
      }
      if (data.mostPopularVideoThumb) {
        setMostPopularVideoThumb(data.mostPopularVideoThumb);
      }

      setAutoFilledBadge(
        `✨ Auto-filled: ${data.channelName}${
          data.subscriberCount ? ` • ${data.subscriberCount} subs` : ""
        }${data.totalViewCount ? ` • ${data.totalViewCount} views` : ""}${
          data.videoCount !== undefined && data.videoCount !== null
            ? ` • ${data.videoCount} videos`
            : ""
        }${data.uploadFrequency ? ` • ${data.uploadFrequency}` : ""}${
          data.keywords?.length ? ` • ${data.keywords.length} tags` : ""
        }`,
      );
      setShowAdvanced(true);
    } catch {
      setFetchError(
        "Could not auto-fetch YouTube metadata. You can still fill fields manually.",
      );
    } finally {
      setIsFetchingYt(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim() || !channelUrl.trim()) return;
    onAdd({
      channelName: channelName.trim(),
      channelUrl: channelUrl.trim(),
      avatarUrl: avatarUrl.trim() || undefined,
      currentSubscriberCount: currentSubscriberCount.trim() || undefined,
      avgViewCount: avgViewCount.trim() || undefined,
      uploadFrequency: uploadFrequency.trim() || undefined,
      lastUploadDate:
        lastUploadDate && !Number.isNaN(new Date(lastUploadDate).getTime())
          ? new Date(lastUploadDate).toISOString()
          : undefined,
      startedDate:
        startedDate && !Number.isNaN(new Date(startedDate).getTime())
          ? new Date(startedDate).toISOString()
          : undefined,
      reproducible,
      mostPopularVideoTitle: mostPopularVideoTitle.trim() || undefined,
      mostPopularVideoUrl: mostPopularVideoUrl.trim() || undefined,
      mostPopularVideoThumb: mostPopularVideoThumb.trim() || undefined,
      description: description.trim() || undefined,
      personalNote: personalNote.trim() || undefined,
      totalViewCount: totalViewCount.trim() || undefined,
      videoCount: videoCount,
      country: country.trim() || undefined,
      customUrl: customUrl.trim() || undefined,
      hiddenSubscriberCount,
      keywords: keywords.length > 0 ? keywords : undefined,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-[#1E1A17] rounded-2xl border border-[#E3DCD3] dark:border-[#3C3530] p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt={channelName}
              className="w-6 h-6 rounded-full object-cover border border-[#E3DCD3] dark:border-[#3C3530]"
            />
          )}
          <h3 className="text-sm font-bold text-[#1E1A17] dark:text-[#FAF8F5]">
            Track New Competitor
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="text-xs font-bold text-[#FF5338] hover:underline"
        >
          {showAdvanced ? "Less Options ▲" : "More Details ▼"}
        </button>
      </div>

      {/* Auto-fill notification badge */}
      {autoFilledBadge && (
        <div className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-medium text-emerald-800 dark:text-emerald-300">
          {autoFilledBadge}
        </div>
      )}

      {fetchError && (
        <div className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-medium text-amber-800 dark:text-amber-300">
          {fetchError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Channel or Video URL with Instant Auto-Fill */}
        <div className="space-y-1 md:col-span-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-[#58524C] dark:text-[#A89F95]">
              YouTube Channel or Video URL *
            </label>
            <span className="text-[10px] text-[#8C8379]">
              Paste any channel or video link to auto-fill
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={channelUrl}
              onChange={(e) => setChannelUrl(e.target.value)}
              onBlur={() => {
                if (channelUrl && !channelName && !isFetchingYt) {
                  handleFetchYoutube(channelUrl);
                }
              }}
              onPaste={(e) => {
                const pasted = e.clipboardData.getData("text");
                if (pasted) {
                  handleFetchYoutube(pasted);
                }
              }}
              placeholder="https://youtube.com/@channel or https://youtube.com/watch?v=..."
              required
              className="flex-1 h-9 px-3 text-xs rounded-lg border border-[#E3DCD3] dark:border-[#3C3530] bg-[#FAF8F5] dark:bg-[#221E1A] text-[#1E1A17] dark:text-[#FAF8F5] placeholder-[#8C8379] focus:outline-none focus:ring-2 focus:ring-[#FF5338]"
            />
            <button
              type="button"
              onClick={() => handleFetchYoutube(channelUrl)}
              disabled={isFetchingYt || !channelUrl.trim()}
              className="h-9 px-4 rounded-lg bg-[#FAF8F5] dark:bg-[#2A2521] border border-[#E3DCD3] dark:border-[#3C3530] text-xs font-bold text-[#1E1A17] dark:text-[#FAF8F5] hover:border-[#FF5338] transition-colors disabled:opacity-50 shrink-0 flex items-center gap-1.5"
            >
              {isFetchingYt ? (
                <>
                  <span className="w-3 h-3 rounded-full border-2 border-[#FF5338] border-t-transparent animate-spin" />
                  <span>Fetching…</span>
                </>
              ) : (
                <>
                  <span>⚡</span>
                  <span>Auto-Fill</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#58524C] dark:text-[#A89F95]">
            Channel Name *
          </label>
          <input
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            placeholder="e.g. MrBeast"
            required
            className="w-full h-9 px-3 text-xs rounded-lg border border-[#E3DCD3] dark:border-[#3C3530] bg-[#FAF8F5] dark:bg-[#221E1A] text-[#1E1A17] dark:text-[#FAF8F5] placeholder-[#8C8379] focus:outline-none focus:ring-2 focus:ring-[#FF5338]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#58524C] dark:text-[#A89F95]">
            Current Subscribers
          </label>
          <input
            type="text"
            value={currentSubscriberCount}
            onChange={(e) => setCurrentSubscriberCount(e.target.value)}
            placeholder="e.g. 1.2M or 450K"
            className="w-full h-9 px-3 text-xs rounded-lg border border-[#E3DCD3] dark:border-[#3C3530] bg-[#FAF8F5] dark:bg-[#221E1A] text-[#1E1A17] dark:text-[#FAF8F5] placeholder-[#8C8379] focus:outline-none focus:ring-2 focus:ring-[#FF5338]"
          />
        </div>

        {/* Upload Cadence with Presets & Calculator */}
        <div className="space-y-1.5 md:col-span-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-[#58524C] dark:text-[#A89F95]">
              Upload Cadence
            </label>
            <button
              type="button"
              onClick={() => setShowCalculator((v) => !v)}
              className="text-[11px] font-semibold text-[#FF5338] hover:underline"
            >
              {showCalculator
                ? "Hide Calculator"
                : "⚡ Calculate from Upload Dates"}
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 pb-1">
            {UPLOAD_FREQUENCY_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setUploadFrequency(preset)}
                className={`px-2.5 py-1 text-[11px] rounded-full border transition-colors capitalize ${
                  uploadFrequency === preset
                    ? "bg-[#FF5338] text-white border-[#FF5338] font-bold"
                    : "border-[#E3DCD3] dark:border-[#3C3530] bg-[#FAF8F5] dark:bg-[#221E1A] text-[#58524C] dark:text-[#A89F95] hover:border-[#FF5338]"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={uploadFrequency}
            onChange={(e) => setUploadFrequency(e.target.value)}
            placeholder="e.g. twice weekly, once daily, 5 times daily"
            className="w-full h-9 px-3 text-xs rounded-lg border border-[#E3DCD3] dark:border-[#3C3530] bg-[#FAF8F5] dark:bg-[#221E1A] text-[#1E1A17] dark:text-[#FAF8F5] placeholder-[#8C8379] focus:outline-none focus:ring-2 focus:ring-[#FF5338]"
          />

          {showCalculator && (
            <CadenceCalculator
              onCalculated={(cadence) => {
                setUploadFrequency(cadence);
                setShowCalculator(false);
              }}
            />
          )}
        </div>

        {showAdvanced && (
          <>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#58524C] dark:text-[#A89F95]">
                Last Upload Date
              </label>
              <input
                type="date"
                value={lastUploadDate}
                onChange={(e) => setLastUploadDate(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-lg border border-[#E3DCD3] dark:border-[#3C3530] bg-[#FAF8F5] dark:bg-[#221E1A] text-[#1E1A17] dark:text-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#FF5338]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#58524C] dark:text-[#A89F95]">
                Channel Focus / Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. High-velocity visual storytelling & challenge formats"
                className="w-full h-9 px-3 text-xs rounded-lg border border-[#E3DCD3] dark:border-[#3C3530] bg-[#FAF8F5] dark:bg-[#221E1A] text-[#1E1A17] dark:text-[#FAF8F5] placeholder-[#8C8379] focus:outline-none focus:ring-2 focus:ring-[#FF5338]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#58524C] dark:text-[#A89F95]">
                Top / Outlier Video Title
              </label>
              <input
                type="text"
                value={mostPopularVideoTitle}
                onChange={(e) => setMostPopularVideoTitle(e.target.value)}
                placeholder="e.g. I Spent 50 Hours In Solitary"
                className="w-full h-9 px-3 text-xs rounded-lg border border-[#E3DCD3] dark:border-[#3C3530] bg-[#FAF8F5] dark:bg-[#221E1A] text-[#1E1A17] dark:text-[#FAF8F5] placeholder-[#8C8379] focus:outline-none focus:ring-2 focus:ring-[#FF5338]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#58524C] dark:text-[#A89F95]">
                Top Video URL
              </label>
              <input
                type="url"
                value={mostPopularVideoUrl}
                onChange={(e) => setMostPopularVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full h-9 px-3 text-xs rounded-lg border border-[#E3DCD3] dark:border-[#3C3530] bg-[#FAF8F5] dark:bg-[#221E1A] text-[#1E1A17] dark:text-[#FAF8F5] placeholder-[#8C8379] focus:outline-none focus:ring-2 focus:ring-[#FF5338]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#58524C] dark:text-[#A89F95]">
                Channel Started Date
              </label>
              <input
                type="date"
                value={startedDate}
                onChange={(e) => setStartedDate(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-lg border border-[#E3DCD3] dark:border-[#3C3530] bg-[#FAF8F5] dark:bg-[#221E1A] text-[#1E1A17] dark:text-[#FAF8F5] placeholder-[#8C8379] focus:outline-none focus:ring-2 focus:ring-[#FF5338]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#58524C] dark:text-[#A89F95]">
                Avg Views / Video
              </label>
              <input
                type="text"
                value={avgViewCount}
                onChange={(e) => setAvgViewCount(e.target.value)}
                placeholder="e.g. 250K or 1.2M"
                className="w-full h-9 px-3 text-xs rounded-lg border border-[#E3DCD3] dark:border-[#3C3530] bg-[#FAF8F5] dark:bg-[#221E1A] text-[#1E1A17] dark:text-[#FAF8F5] placeholder-[#8C8379] focus:outline-none focus:ring-2 focus:ring-[#FF5338]"
              />
            </div>
          </>
        )}

        <div className="space-y-1 md:col-span-2">
          <label className="text-[11px] font-bold text-[#58524C] dark:text-[#A89F95]">
            Personal Note
          </label>
          <input
            type="text"
            value={personalNote}
            onChange={(e) => setPersonalNote(e.target.value)}
            placeholder="Why you're tracking this channel..."
            className="w-full h-9 px-3 text-xs rounded-lg border border-[#E3DCD3] dark:border-[#3C3530] bg-[#FAF8F5] dark:bg-[#221E1A] text-[#1E1A17] dark:text-[#FAF8F5] placeholder-[#8C8379] focus:outline-none focus:ring-2 focus:ring-[#FF5338]"
          />
        </div>

        {/* Reproducible Niche Toggle */}
        <div className="flex items-center gap-3 md:col-span-2 p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#221E1A] border border-[#E3DCD3] dark:border-[#3C3530]">
          <input
            type="checkbox"
            id="competitor-reproducible-checkbox"
            checked={reproducible}
            onChange={(e) => setReproducible(e.target.checked)}
            className="w-4 h-4 rounded text-[#FF5338] accent-[#FF5338] focus:ring-[#FF5338] border-[#E3DCD3] dark:border-[#3C3530] cursor-pointer"
          />
          <label
            htmlFor="competitor-reproducible-checkbox"
            className="text-xs font-semibold text-[#1E1A17] dark:text-[#FAF8F5] cursor-pointer select-none"
          >
            Reproducible Niche{" "}
            <span className="text-[11px] font-normal text-[#8C8379]">
              (Can we reproduce/execute this channel&apos;s format and niche?)
            </span>
          </label>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={isPending || isFetchingYt}
          className="h-8 px-5 rounded-full bg-[#FF5338] text-white text-xs font-bold tactile-btn disabled:opacity-50"
        >
          {isPending ? "Adding…" : "Add Competitor"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-8 px-4 rounded-full text-xs font-bold text-[#58524C] dark:text-[#A89F95] hover:bg-[#F1EDE6] dark:hover:bg-[#2A2521]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function CompetitorCard({
  competitor,
  onDelete,
  onUpdate,
  onInspect,
}: {
  competitor: CompetitorRecord;
  onDelete: () => void;
  onUpdate: (data: UpdateCompetitorInput) => void;
  onInspect: () => void;
}) {
  return (
    <div
      onClick={onInspect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onInspect();
        }
      }}
      className="bg-white dark:bg-[#1E1A17] rounded-2xl border border-[#E3DCD3] dark:border-[#3C3530] hover:border-[#FF5338]/60 overflow-hidden card-lift flex flex-col transition-all duration-200 group/card text-left cursor-pointer"
    >
      {/* Channel Header */}
      <div className="p-5 pb-3 flex items-start gap-3.5">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#F1EDE6] dark:bg-[#2A2521] shrink-0 flex items-center justify-center border border-[#E3DCD3]/60 dark:border-[#3C3530]/60 shadow-xs">
          {competitor.avatarUrl ? (
            <img
              src={competitor.avatarUrl}
              alt={competitor.channelName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-base font-black text-[#FF5338]">
              {competitor.channelName.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-extrabold text-sm text-[#1E1A17] dark:text-[#FAF8F5] truncate group-hover/card:text-[#FF5338] transition-colors">
                {competitor.channelName}
              </h3>
              <a
                href={competitor.channelUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[11px] text-[#8C8379] hover:text-[#FF5338] hover:underline font-grotesk truncate block"
              >
                {competitor.customUrl ||
                  competitor.channelUrl.replace(
                    /^https?:\/\/(www\.)?/,
                    "",
                  )}{" "}
                ↗
              </a>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title="Stop tracking"
              className="text-[#8C8379] hover:text-[#FF5338] transition-colors p-1 -mt-1 -mr-1 rounded-md"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Cadence & Reproducible Status Strip */}
      <div className="px-5 pb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onUpdate({ reproducible: !competitor.reproducible });
          }}
          title="Click to toggle reproducible niche status"
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all border ${
            competitor.reproducible
              ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100"
              : "bg-[#FAF8F5] dark:bg-[#221E1A] text-[#8C8379] border-[#E3DCD3] dark:border-[#3C3530] hover:text-[#1E1A17] dark:hover:text-[#FAF8F5]"
          }`}
        >
          <span>{competitor.reproducible ? "✓" : "○"}</span>
          <span>
            {competitor.reproducible
              ? "Reproducible Niche"
              : "Mark Reproducible"}
          </span>
        </button>

        {competitor.uploadFrequency && (
          <span className="text-[10px] font-bold text-[#914c00] dark:text-amber-300 bg-[#FFF0D6] dark:bg-amber-950/30 px-2.5 py-0.5 rounded-full capitalize shrink-0">
            {competitor.uploadFrequency}
          </span>
        )}
      </div>

      {/* Key Metrics Essentials Grid */}
      <div className="px-5 pb-3 grid grid-cols-2 gap-2">
        <div className="bg-[#F7F4EF] dark:bg-[#221E1A] rounded-xl p-2.5 space-y-0.5">
          <p className="text-[10px] font-bold text-[#8C8379] uppercase tracking-wide">
            Subscribers
          </p>
          <p className="text-sm font-extrabold text-[#1E1A17] dark:text-[#FAF8F5]">
            {competitor.currentSubscriberCount || "—"}
          </p>
        </div>

        <div className="bg-[#F7F4EF] dark:bg-[#221E1A] rounded-xl p-2.5 space-y-0.5">
          <p className="text-[10px] font-bold text-[#8C8379] uppercase tracking-wide">
            Avg Views / Video
          </p>
          <p className="text-sm font-extrabold text-[#1E1A17] dark:text-[#FAF8F5]">
            {competitor.avgViewCount || "—"}
          </p>
        </div>
      </div>

      {/* Top Video 1-line Signal */}
      {competitor.mostPopularVideoTitle && (
        <div className="px-5 pb-3">
          <div className="bg-[#FAF8F5] dark:bg-[#221E1A] border border-[#E3DCD3]/60 dark:border-[#3C3530]/60 rounded-xl px-3 py-2 flex items-center gap-2">
            <span className="text-xs shrink-0 text-[#FF5338]">⚡</span>
            <p className="text-xs font-semibold text-[#1E1A17] dark:text-[#FAF8F5] truncate min-w-0">
              {competitor.mostPopularVideoTitle}
            </p>
          </div>
        </div>
      )}

      {/* Apple-grade Footer Affordance */}
      <div className="px-5 py-3 mt-auto border-t border-[#E3DCD3]/50 dark:border-[#3C3530]/50 flex items-center justify-between text-[11px] text-[#8C8379] group-hover/card:text-[#FF5338] transition-colors">
        <span className="font-semibold">Inspect channel intel</span>
        <span className="font-bold">→</span>
      </div>
    </div>
  );
}

export function CompetitorSpyView() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "reproducible">("all");
  const [inspectingCompetitorId, setInspectingCompetitorId] = useState<
    string | null
  >(null);

  const { data: competitors = [], isLoading } = useCompetitors();
  const createMutation = useCreateCompetitor();
  const updateMutation = useUpdateCompetitor();
  const deleteMutation = useDeleteCompetitor();

  const handleAdd = async (data: CreateCompetitorInput) => {
    await createMutation.mutateAsync(data);
    setShowAddForm(false);
  };

  const handleUpdate = (id: string, data: UpdateCompetitorInput) => {
    updateMutation.mutate({ id, data });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const reproducibleCount = competitors.filter((c) => c.reproducible).length;
  const displayedCompetitors =
    filter === "reproducible"
      ? competitors.filter((c) => c.reproducible)
      : competitors;

  const currentInspectingCompetitor = inspectingCompetitorId
    ? (competitors.find((c) => c.id === inspectingCompetitorId) ?? null)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E3DCD3] dark:border-[#3C3530] pb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-extrabold tracking-tight text-[#1E1A17] dark:text-[#FAF8F5]">
            🎯 Competitor Benchmark Radar
          </h2>
          {competitors.length > 0 && (
            <span className="px-3 py-0.5 rounded-full text-xs font-bold font-grotesk bg-[#FFF0D6] text-[#914c00] dark:bg-amber-950/40 dark:text-amber-300">
              {competitors.length} Tracked
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm((v) => !v)}
          className="h-9 px-5 rounded-full text-xs font-bold flex items-center gap-2 bg-[#1E1A17] dark:bg-[#FAF8F5] text-white dark:text-[#1E1A17] tactile-btn shrink-0"
        >
          <span>{showAddForm ? "✕ Cancel" : "+ Track Channel"}</span>
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <AddCompetitorForm
          onAdd={handleAdd}
          onCancel={() => setShowAddForm(false)}
          isPending={createMutation.isPending}
        />
      )}

      {/* Filter Tabs */}
      {!isLoading && competitors.length > 0 && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
              filter === "all"
                ? "bg-[#1E1A17] text-white dark:bg-[#FAF8F5] dark:text-[#1E1A17]"
                : "bg-[#F1EDE6] dark:bg-[#2A2521] text-[#58524C] dark:text-[#A89F95] hover:bg-[#E3DCD3] dark:hover:bg-[#3C3530]"
            }`}
          >
            All Channels ({competitors.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("reproducible")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 ${
              filter === "reproducible"
                ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-white"
                : "bg-[#F1EDE6] dark:bg-[#2A2521] text-[#58524C] dark:text-[#A89F95] hover:bg-[#E3DCD3] dark:hover:bg-[#3C3530]"
            }`}
          >
            <span>✓</span> Reproducible Niche ({reproducibleCount})
          </button>
        </div>
      )}

      {/* Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-[#F1EDE6] dark:bg-[#221E1A] animate-pulse"
            />
          ))}
        </div>
      ) : competitors.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border-2 border-dashed border-[#E3DCD3] dark:border-[#3C3530] space-y-3">
          <div className="text-3xl">🕵️</div>
          <h3 className="text-sm font-bold text-[#1E1A17] dark:text-[#FAF8F5]">
            No competitors tracked yet
          </h3>
          <p className="text-xs text-[#58524C] dark:text-[#A89F95] max-w-sm mx-auto">
            Click &quot;Track Channel&quot; to start spying on competitors —
            paste any YouTube channel or video link to automatically detect
            upload cadence, subscribers, and top-performing content.
          </p>
        </div>
      ) : displayedCompetitors.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-[#E3DCD3] dark:border-[#3C3530] bg-[#FAF8F5] dark:bg-[#1E1A17] space-y-2">
          <p className="text-sm font-bold text-[#1E1A17] dark:text-[#FAF8F5]">
            No reproducible competitors marked yet
          </p>
          <p className="text-xs text-[#58524C] dark:text-[#A89F95]">
            Click &quot;Mark Reproducible&quot; on any channel card to flag
            niches you can reproduce.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {displayedCompetitors.map((c) => (
            <CompetitorCard
              key={c.id}
              competitor={c}
              onDelete={() => handleDelete(c.id)}
              onUpdate={(data) => handleUpdate(c.id, data)}
              onInspect={() => setInspectingCompetitorId(c.id)}
            />
          ))}
        </div>
      )}

      {/* Competitor Inspector Modal */}
      <CompetitorInspectorModal
        competitor={currentInspectingCompetitor}
        onClose={() => setInspectingCompetitorId(null)}
      />
    </div>
  );
}

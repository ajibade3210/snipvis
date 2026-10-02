"use client";

import type { FormattedInspiration } from "@/types";
import { getStrengthScoreBadgeStyle } from "@/types/hook-analysis";
import { useMemo, useState } from "react";

interface GlobalVaultViewProps {
  inspirations: FormattedInspiration[];
  searchQuery: string;
  onOpenAddModal: () => void;
  onToggleFavorite: (item: FormattedInspiration) => void;
  onEditNote: (item: FormattedInspiration) => void;
  onRemoveItem: (item: FormattedInspiration) => void;
  selectedProjectId?: string | null;
}

type FilterChip = "ALL" | "THUMBNAIL" | "TITLE" | "HOOK" | "OUTLIER";
type ViewMode = "grid" | "masonry" | "compact";
type SortOption = "score" | "ctr" | "views" | "recent";

export function GlobalVaultView({
  inspirations,
  searchQuery,
  onOpenAddModal,
  onToggleFavorite,
  onEditNote,
  onRemoveItem,
  selectedProjectId,
}: GlobalVaultViewProps) {
  const [filterChip, setFilterChip] = useState<FilterChip>("ALL");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("ctr");

  const thumbnailCount = inspirations.filter(
    (i) => i.type === "THUMBNAIL",
  ).length;
  const titleCount = inspirations.filter((i) => i.type === "TITLE").length;
  const hookCount = inspirations.filter((i) => i.type === "HOOK").length;

  const filtered = useMemo(() => {
    const list = inspirations.filter((item) => {
      if (filterChip === "THUMBNAIL" && item.type !== "THUMBNAIL") return false;
      if (filterChip === "TITLE" && item.type !== "TITLE") return false;
      if (filterChip === "HOOK" && item.type !== "HOOK") return false;
      if (
        filterChip === "OUTLIER" &&
        !item.ctrBadge?.includes("14") &&
        !item.views?.includes("M")
      ) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesChannel = item.channelName?.toLowerCase().includes(q);
        const matchesNote = item.note?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesChannel && !matchesNote) return false;
      }

      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === "score") {
        const scoreA = a.strength_score ?? a.strengthScore ?? 0;
        const scoreB = b.strength_score ?? b.strengthScore ?? 0;
        return scoreB - scoreA;
      }
      if (sortBy === "recent") {
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      }
      if (sortBy === "views") {
        const parseViews = (v?: string | null) => {
          if (!v) return 0;
          const num = Number.parseFloat(v) || 0;
          if (v.includes("M")) return num * 1_000_000;
          if (v.includes("K")) return num * 1_000;
          return num;
        };
        return parseViews(b.views) - parseViews(a.views);
      }
      // "ctr"
      const parseCtr = (c = "") =>
        Number.parseFloat(c.replace(/[^0-9.]/g, "")) || 0;
      return parseCtr(b.ctrBadge) - parseCtr(a.ctrBadge);
    });
  }, [inspirations, filterChip, searchQuery, sortBy]);

  return (
    <div className="space-y-6">
      {/* View Header & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-black/[0.05] dark:border-white/[0.06] pb-4 sm:pb-5">
        <div>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1E1A17] dark:text-[#FAF8F5]">
              Inspo Vault
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-black/[0.04] dark:bg-white/[0.06] text-[#8C8379]">
              {filtered.length} Inspirations
            </span>
          </div>
        </div>

        {/* View Switcher & Sort */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          <div className="flex items-center p-0.5 bg-black/[0.03] dark:bg-white/[0.04] rounded-full border border-black/[0.04] dark:border-white/[0.06] shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`px-2 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white dark:bg-[#201C18] text-[#1E1A17] dark:text-[#FAF8F5] shadow-xs font-semibold"
                  : "text-[#58524C] dark:text-[#A89F95] hover:text-[#1E1A17] dark:hover:text-[#FAF8F5]"
              }`}
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode("masonry")}
              className={`px-2 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium transition-all cursor-pointer ${
                viewMode === "masonry"
                  ? "bg-white dark:bg-[#201C18] text-[#1E1A17] dark:text-[#FAF8F5] shadow-xs font-semibold"
                  : "text-[#58524C] dark:text-[#A89F95] hover:text-[#1E1A17] dark:hover:text-[#FAF8F5]"
              }`}
            >
              Masonry
            </button>
            <button
              type="button"
              onClick={() => setViewMode("compact")}
              className={`px-2 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium transition-all cursor-pointer ${
                viewMode === "compact"
                  ? "bg-white dark:bg-[#201C18] text-[#1E1A17] dark:text-[#FAF8F5] shadow-xs font-semibold"
                  : "text-[#58524C] dark:text-[#A89F95] hover:text-[#1E1A17] dark:hover:text-[#FAF8F5]"
              }`}
            >
              Compact
            </button>
          </div>

          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-8 pl-2.5 sm:pl-3 pr-6 sm:pr-7 rounded-full border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.025] dark:bg-white/[0.03] text-[11px] sm:text-xs font-medium text-[#1E1A17] dark:text-[#FAF8F5] focus:outline-none focus:ring-1 focus:ring-[#FF5338] shadow-xs cursor-pointer appearance-none"
            >
              <option value="ctr">Sort: Highest CTR</option>
              <option value="score">Sort: AI Score</option>
              <option value="views">Sort: Most Views</option>
              <option value="recent">Sort: Most Recent</option>
            </select>
            <span className="absolute right-2 top-2 pointer-events-none text-xs text-[#8C8379]">
              ⌵
            </span>
          </div>
        </div>
      </div>

      {/* Filter Ribbon Strip */}
      <div className="w-full overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
        <div className="inline-flex items-center gap-1.5 min-w-full sm:min-w-0">
          {(
            [
              { id: "ALL", label: "All Items", count: inspirations.length },
              { id: "THUMBNAIL", label: "🖼️ Thumbnails", count: thumbnailCount },
              { id: "TITLE", label: "🏷️ Titles", count: titleCount },
              { id: "HOOK", label: "🎣 Hooks", count: hookCount },
              { id: "OUTLIER", label: "🚀 Outliers (>10x Avg)" },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterChip(f.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                filterChip === f.id
                  ? "bg-[#1E1A17] dark:bg-[#FAF8F5] text-white dark:text-[#1E1A17] shadow-xs font-semibold"
                  : "bg-black/[0.03] dark:bg-white/[0.04] text-[#58524C] dark:text-[#A89F95] hover:bg-black/[0.05] dark:hover:bg-white/[0.06]"
              }`}
            >
              <span>{f.label}</span>
              {"count" in f ? (
                <span className="font-mono text-[10px] opacity-75">
                  {f.count}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* Cards — layout driven by viewMode */}
      {viewMode === "masonry" ? (
        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-0 pb-24">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-[#1E1A17] rounded-2xl border border-black/[0.06] dark:border-white/[0.08] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between break-inside-avoid mb-6"
            >
              <div>
                <div className="bg-black/[0.03] dark:bg-white/[0.04] relative overflow-hidden group">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title || "Inspiration thumbnail"}
                    className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/75 text-white text-[10px] font-mono font-medium">
                    {item.duration || "14:20"}
                  </div>
                  <div
                    className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-white text-[11px] font-mono font-bold shadow-xs ${
                      item.ctrColor || "bg-[#059669]"
                    }`}
                  >
                    {item.ctrBadge || "📈 13.5% CTR"}
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full truncate max-w-[170px] ${
                          item.categoryColor ||
                          "bg-[#FFEBE7] text-[#b51d07] dark:bg-red-950/40"
                        }`}
                      >
                        {item.categoryTag || "Viral Benchmark"}
                      </span>
                      {(item.strength_score ?? item.strengthScore) != null && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${getStrengthScoreBadgeStyle(
                            item.strength_score ?? item.strengthScore,
                          )}`}
                        >
                          ⭐ {item.strength_score ?? item.strengthScore}/10
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-[#8C8379] dark:text-[#A89F95] truncate max-w-[100px]">
                      @{item.channelName || "Creator"}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm leading-snug text-[#1E1A17] dark:text-[#FAF8F5]">
                    {item.title}
                  </h3>
                  <div className="bg-black/[0.025] dark:bg-white/[0.03] rounded-xl p-3 border border-black/[0.04] dark:border-white/[0.05] space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-medium">
                      <span className="text-[#1E1A17] dark:text-[#FAF8F5] flex items-center gap-1">
                        <span className="text-[#FF5338] font-bold">TT</span>{" "}
                        {item.insightLeft || "Pacing Test"}
                      </span>
                      <span
                        className={item.insightRightColor || "text-[#059669]"}
                      >
                        {item.insightRight || "Variant A Win"}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#58524C] dark:text-[#A89F95] italic leading-relaxed line-clamp-2">
                      💡 <span className="font-medium not-italic">Note:</span> "
                      {item.note || "Curated in research vault."}"
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-3.5 border-t border-black/[0.04] dark:border-white/[0.05] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${item.projectDot || "bg-[#FF5338]"}`}
                  />
                  <span className="text-[11px] font-medium text-[#58524C] dark:text-[#A89F95] truncate max-w-[130px]">
                    {item.projectName || "Global Vault"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onEditNote(item)}
                    className="p-1 rounded text-[#8C8379] hover:text-[#1E1A17] dark:hover:text-white transition-colors cursor-pointer"
                    title="Edit Note"
                  >
                    📝
                  </button>
                  {selectedProjectId ? (
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item)}
                      className="p-1 rounded text-[#8C8379] hover:text-red-500 transition-colors cursor-pointer"
                      title="Detach from project"
                    >
                      ✕
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(item)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                      item.projectContext?.favorite
                        ? "text-[#FF5338]"
                        : "text-[#8C8379] hover:text-[#FF5338]"
                    }`}
                    title="Bookmark & Save"
                  >
                    <svg
                      className="w-4 h-4"
                      fill={
                        item.projectContext?.favorite ? "currentColor" : "none"
                      }
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : viewMode === "compact" ? (
        <div className="flex flex-col divide-y divide-black/[0.04] dark:divide-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] rounded-2xl overflow-hidden bg-white dark:bg-[#1E1A17] pb-24 shadow-xs">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 px-4 py-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group"
            >
              {/* Small thumbnail */}
              <div className="w-20 h-12 rounded-lg overflow-hidden bg-black/[0.03] dark:bg-white/[0.04] shrink-0 relative">
                <img
                  src={item.thumbnailUrl}
                  alt={item.title || ""}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <div
                  className={`absolute top-1 right-1 px-1 py-px rounded text-white text-[9px] font-bold ${
                    item.ctrColor || "bg-[#059669]"
                  }`}
                >
                  {(item.ctrBadge || "13.5%")
                    .replace(" CTR", "")
                    .replace(/[^0-9.%]/g, "")
                    .trim() || "CTR"}
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-bold text-[#1E1A17] dark:text-[#FAF8F5] line-clamp-1 group-hover:text-[#FF5338] transition-colors">
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`text-[9px] font-semibold px-1.5 py-px rounded-full ${
                      item.categoryColor ||
                      "bg-[#FFEBE7] text-[#b51d07] dark:bg-red-950/40"
                    }`}
                  >
                    {item.categoryTag || "Benchmark"}
                  </span>
                  {(item.strength_score ?? item.strengthScore) != null && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-px rounded-full border ${getStrengthScoreBadgeStyle(
                        item.strength_score ?? item.strengthScore,
                      )}`}
                    >
                      ⭐ {item.strength_score ?? item.strengthScore}/10
                    </span>
                  )}
                  <span className="text-[10px] text-[#8C8379] dark:text-[#A89F95] truncate">
                    @{item.channelName || "Creator"}
                  </span>
                  {item.note && (
                    <span className="text-[10px] text-[#58524C] dark:text-[#A89F95] italic truncate hidden sm:block">
                      “{item.note}”
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => onEditNote(item)}
                  className="p-1 rounded text-[#8C8379] hover:text-[#1E1A17] dark:hover:text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Edit Note"
                >
                  📝
                </button>
                {selectedProjectId ? (
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item)}
                    className="p-1 rounded text-[#8C8379] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Detach"
                  >
                    ✕
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => onToggleFavorite(item)}
                  className={`w-6 h-6 rounded flex items-center justify-center transition-colors cursor-pointer ${
                    item.projectContext?.favorite
                      ? "text-[#FF5338]"
                      : "text-[#8C8379] hover:text-[#FF5338]"
                  }`}
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill={
                      item.projectContext?.favorite ? "currentColor" : "none"
                    }
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Default: Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-24">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-[#1E1A17] rounded-2xl border border-black/[0.06] dark:border-white/[0.08] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Media Thumbnail Container */}
                <div className="aspect-video bg-black/[0.03] dark:bg-white/[0.04] relative overflow-hidden group">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title || "Inspiration thumbnail"}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />

                  {/* Duration Badge */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/75 text-white text-[10px] font-mono font-medium">
                    {item.duration || "14:20"}
                  </div>

                  {/* CTR Badge */}
                  <div
                    className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-white text-[11px] font-mono font-bold shadow-xs ${
                      item.ctrColor || "bg-[#059669]"
                    }`}
                  >
                    {item.ctrBadge || "📈 13.5% CTR"}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full truncate max-w-[170px] ${
                          item.categoryColor ||
                          "bg-[#FFEBE7] text-[#b51d07] dark:bg-red-950/40"
                        }`}
                      >
                        {item.categoryTag || "Viral Benchmark"}
                      </span>
                      {(item.strength_score ?? item.strengthScore) != null && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${getStrengthScoreBadgeStyle(
                            item.strength_score ?? item.strengthScore,
                          )}`}
                        >
                          ⭐ {item.strength_score ?? item.strengthScore}/10
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-[#8C8379] dark:text-[#A89F95] truncate max-w-[100px]">
                      @{item.channelName || "Creator"}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm leading-snug text-[#1E1A17] dark:text-[#FAF8F5] line-clamp-2">
                    {item.title}
                  </h3>

                  {/* Embedded Insight Container */}
                  <div className="bg-black/[0.025] dark:bg-white/[0.03] rounded-xl p-3 border border-black/[0.04] dark:border-white/[0.05] space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-medium">
                      <span className="text-[#1E1A17] dark:text-[#FAF8F5] flex items-center gap-1">
                        <span className="text-[#FF5338] font-bold">TT</span>{" "}
                        {item.insightLeft || "Pacing Test"}
                      </span>
                      <span
                        className={item.insightRightColor || "text-[#059669]"}
                      >
                        {item.insightRight || "Variant A Win"}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#58524C] dark:text-[#A89F95] italic leading-relaxed line-clamp-2">
                      💡 <span className="font-medium not-italic">Note:</span> "
                      {item.note || "Curated in research vault."}"
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="p-3.5 border-t border-black/[0.04] dark:border-white/[0.05] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${item.projectDot || "bg-[#FF5338]"}`}
                  />
                  <span className="text-[11px] font-medium text-[#58524C] dark:text-[#A89F95] truncate max-w-[130px]">
                    {item.projectName || "Global Vault"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onEditNote(item)}
                    className="p-1 rounded text-[#8C8379] hover:text-[#1E1A17] dark:hover:text-white transition-colors cursor-pointer"
                    title="Edit Note"
                  >
                    📝
                  </button>
                  {selectedProjectId ? (
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item)}
                      className="p-1 rounded text-[#8C8379] hover:text-red-500 transition-colors cursor-pointer"
                      title="Detach from project"
                    >
                      ✕
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(item)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                      item.projectContext?.favorite
                        ? "text-[#FF5338]"
                        : "text-[#8C8379] hover:text-[#FF5338]"
                    }`}
                    title="Bookmark & Save"
                  >
                    <svg
                      className="w-4 h-4"
                      fill={
                        item.projectContext?.favorite ? "currentColor" : "none"
                      }
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="py-16 text-center rounded-3xl border border-dashed border-black/[0.08] dark:border-white/[0.08] bg-black/[0.01] dark:bg-white/[0.01] p-8 space-y-3">
          <div className="text-3xl">🔍</div>
          <h3 className="text-sm font-bold text-[#1E1A17] dark:text-[#FAF8F5]">
            No inspirations found
          </h3>
          <p className="text-xs text-[#8C8379] max-w-sm mx-auto">
            {searchQuery
              ? `No matches for "${searchQuery}" in your current filter.`
              : "Capture or add your first inspiration to populate this section."}
          </p>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="h-9 px-4 rounded-full bg-[#FF5338] text-white text-xs font-semibold shadow-xs hover:bg-[#d93820] active:scale-95 transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>+</span>
            <span>Add Inspiration</span>
          </button>
        </div>
      )}
    </div>
  );
}

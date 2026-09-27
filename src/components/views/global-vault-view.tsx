"use client";

import { useState, useMemo } from "react";

interface GlobalVaultViewProps {
  inspirations: any[];
  searchQuery: string;
  onOpenAddModal: () => void;
  onToggleFavorite: (item: any) => void;
  onEditNote: (item: any) => void;
  onRemoveItem: (item: any) => void;
  selectedProjectId?: string | null;
}

type FilterChip = "ALL" | "THUMBNAIL" | "TITLE" | "HOOK" | "OUTLIER";
type ViewMode = "grid" | "masonry" | "compact";
type SortOption = "ctr" | "views" | "recent";

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
      if (sortBy === "recent") {
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      }
      if (sortBy === "views") {
        const parseViews = (v: string = "") => {
          const num = parseFloat(v) || 0;
          if (v.includes("M")) return num * 1_000_000;
          if (v.includes("K")) return num * 1_000;
          return num;
        };
        return parseViews(b.views) - parseViews(a.views);
      }
      // "ctr"
      const parseCtr = (c: string = "") =>
        parseFloat(c.replace(/[^0-9.]/g, "")) || 0;
      return parseCtr(b.ctrBadge) - parseCtr(a.ctrBadge);
    });
  }, [inspirations, filterChip, searchQuery, sortBy]);

  return (
    <div className="space-y-6">
      {/* View Header & Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E3DCD3] dark:border-[#3C3530] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#1E1A17] dark:text-[#FAF8F5]">
              Global Vault
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold font-grotesk bg-[#FFEBE7] text-[#b51d07] dark:bg-red-950/40 dark:text-red-300">
              {filtered.length} Inspirations
            </span>
          </div>
          <p className="text-xs text-[#58524C] dark:text-[#A89F95] font-medium mt-1">
            All saved thumbnails, hooks, and titles across your library and
            creator channels.
          </p>
        </div>

        {/* View Switcher & Sort */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-[#F1EDE6] dark:bg-[#221E1A] rounded-xl border border-[#E3DCD3] dark:border-[#3C3530]">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                viewMode === "grid"
                  ? "bg-white dark:bg-[#2A2521] text-[#FF5338] shadow-xs"
                  : "text-[#58524C] dark:text-[#A89F95]"
              }`}
            >
              <span>Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("masonry")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === "masonry"
                  ? "bg-white dark:bg-[#2A2521] text-[#FF5338] shadow-xs"
                  : "text-[#58524C] dark:text-[#A89F95]"
              }`}
            >
              <span>Masonry</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("compact")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === "compact"
                  ? "bg-white dark:bg-[#2A2521] text-[#FF5338] shadow-xs"
                  : "text-[#58524C] dark:text-[#A89F95]"
              }`}
            >
              <span>Compact</span>
            </button>
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-9 px-3.5 rounded-xl border border-[#E3DCD3] dark:border-[#3C3530] bg-white dark:bg-[#221E1A] text-xs font-bold text-[#1E1A17] dark:text-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#FF5338] shadow-xs cursor-pointer appearance-none pr-8"
            >
              <option value="ctr">Sort: Highest CTR</option>
              <option value="views">Sort: Most Views</option>
              <option value="recent">Sort: Most Recent</option>
            </select>
            <span className="absolute right-2.5 top-2.5 pointer-events-none text-xs text-[#8C8379]">
              ⌵
            </span>
          </div>
        </div>
      </div>

      {/* Filter Ribbon Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
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
              className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                filterChip === f.id
                  ? "bg-[#1E1A17] dark:bg-[#FAF8F5] text-white dark:text-[#1E1A17] shadow-xs"
                  : "bg-[#F1EDE6] dark:bg-[#221E1A] text-[#1E1A17] dark:text-[#FAF8F5] hover:bg-[#EBE5DC] border border-[#E3DCD3]/60 dark:border-[#3C3530]/60"
              }`}
            >
              <span>{f.label}</span>
              {"count" in f ? (
                <span className="font-grotesk font-normal opacity-80 text-[10px]">
                  {f.count}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* 4-Column Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-24">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-[#1E1A17] rounded-2xl border border-[#E3DCD3] dark:border-[#3C3530] overflow-hidden card-lift flex flex-col justify-between"
          >
            <div>
              {/* Media Thumbnail Container */}
              <div className="aspect-video bg-[#F1EDE6] dark:bg-[#2A2521] relative overflow-hidden group">
                {/* biome-ignore lint/a11y/noSvgWithoutTitle: thumbnail image */}
                <img
                  src={item.thumbnailUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />

                {/* Duration Badge */}
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-white text-[10px] font-grotesk font-bold">
                  {item.duration || "14:20"}
                </div>

                {/* CTR Badge */}
                <div
                  className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-white text-[11px] font-grotesk font-extrabold shadow-sm ${
                    item.ctrColor || "bg-[#059669]"
                  }`}
                >
                  {item.ctrBadge || "📈 13.5% CTR"}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full truncate max-w-[170px] ${
                      item.categoryColor ||
                      "bg-[#FFEBE7] text-[#b51d07] dark:bg-red-950/40"
                    }`}
                  >
                    {item.categoryTag || "Viral Benchmark"}
                  </span>
                  <span className="text-[11px] font-bold text-[#58524C] dark:text-[#A89F95] truncate max-w-[100px]">
                    @{item.channelName || "Creator"}
                  </span>
                </div>

                <h3 className="font-extrabold text-sm leading-snug text-[#1E1A17] dark:text-[#FAF8F5] line-clamp-2">
                  {item.title}
                </h3>

                {/* Embedded Insight Container */}
                <div className="bg-[#F7F4EF] dark:bg-[#25201C] rounded-xl p-3 border border-[#E3DCD3]/70 dark:border-[#3C3530]/70 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-grotesk font-bold">
                    <span className="text-[#1E1A17] dark:text-[#FAF8F5] flex items-center gap-1">
                      <span className="text-[#FF5338]">TT</span>{" "}
                      {item.insightLeft || "Pacing Test"}
                    </span>
                    <span
                      className={item.insightRightColor || "text-[#059669]"}
                    >
                      {item.insightRight || "Variant A Win"}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#58524C] dark:text-[#A89F95] italic leading-relaxed line-clamp-2">
                    💡 <span className="font-medium">Note:</span> "
                    {item.note || "Curated in research vault."}"
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="p-4 pt-1 border-t border-[#E3DCD3]/50 dark:border-[#3C3530]/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${item.projectDot || "bg-[#FF5338]"}`}
                />
                <span className="text-[11px] font-bold text-[#58524C] dark:text-[#A89F95] truncate max-w-[130px]">
                  {item.projectName || "Global Vault"}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onEditNote(item)}
                  className="p-1 rounded text-[#8C8379] hover:text-[#1E1A17] dark:hover:text-white"
                  title="Edit Note"
                >
                  📝
                </button>
                {selectedProjectId ? (
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item)}
                    className="p-1 rounded text-[#8C8379] hover:text-red-500"
                    title="Detach from project"
                  >
                    ✕
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => onToggleFavorite(item)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
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

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="py-16 text-center rounded-2xl border-2 border-dashed border-[#E3DCD3] dark:border-[#3C3530] p-8 space-y-3">
          <div className="text-3xl">🔍</div>
          <h3 className="text-sm font-bold text-[#1E1A17] dark:text-[#FAF8F5]">
            No inspirations found
          </h3>
          <p className="text-xs text-[#58524C] dark:text-[#A89F95] max-w-sm mx-auto">
            {searchQuery
              ? `No matches for "${searchQuery}" in your current filter.`
              : "Capture or add your first inspiration to populate this section."}
          </p>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-full bg-[#FF5338] text-white text-xs font-bold tactile-btn shadow-sm"
          >
            + Add Inspiration
          </button>
        </div>
      )}
    </div>
  );
}

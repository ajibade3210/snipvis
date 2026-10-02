"use client";

import { DEFAULT_PROJECT_GRADIENTS } from "@/lib/constants";
import type { ProjectRecord } from "@/types";

interface ProjectsHubViewProps {
  projects: ProjectRecord[];
  selectedChannelId?: string | null;
  onClearChannelFilter?: () => void;
  onSelectProject: (id: string) => void;
  onOpenNewProject: () => void;
}

export function ProjectsHubView({
  projects,
  selectedChannelId,
  onClearChannelFilter,
  onSelectProject,
  onOpenNewProject,
}: ProjectsHubViewProps) {
  const getProjectGradient = (id: string, name: string) => {
    let hash = 0;
    const str = `${id}-${name}`;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % DEFAULT_PROJECT_GRADIENTS.length;
    return DEFAULT_PROJECT_GRADIENTS[index];
  };

  const filteredProjects = selectedChannelId
    ? projects.filter(
        (p) =>
          p.channelId === selectedChannelId ||
          (typeof p.channel === "object" &&
            p.channel?.id === selectedChannelId),
      )
    : projects;

  const activeChannelName = selectedChannelId
    ? (() => {
        const match = projects.find(
          (p) =>
            p.channelId === selectedChannelId ||
            (typeof p.channel === "object" &&
              p.channel?.id === selectedChannelId),
        );
        if (match?.channel && typeof match.channel === "object") {
          return match.channel.name;
        }
        return null;
      })()
    : null;

  // Group into Active and Completed
  const activeProjects = filteredProjects.filter((p) => p.status !== "DONE");
  const doneProjects = filteredProjects.filter((p) => p.status === "DONE");
  const activeCount = activeProjects.length;

  const renderProjectCard = (proj: ProjectRecord, isDone: boolean) => {
    const inspCount = proj._count?.inspirations ?? 0;
    const assetCount = proj._count?.assets ?? 0;
    const gradientTheme = getProjectGradient(proj.id, proj.name);

    // Pick main thumbnail or first available
    const mainThumbnail =
      proj.thumbnails?.find((t) => t.isMain) || proj.thumbnails?.[0] || null;

    const initials = proj.name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

    const channelName =
      typeof proj.channel === "object" && proj.channel
        ? proj.channel.name
        : typeof proj.channel === "string"
          ? proj.channel
          : null;

    return (
      <button
        key={proj.id}
        type="button"
        onClick={() => onSelectProject(proj.id)}
        className={`flex flex-col text-left w-full cursor-pointer group select-none transition-all ${
          isDone ? "opacity-75 hover:opacity-100" : ""
        }`}
      >
        {/* YouTube 16:9 Thumbnail Box */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#201C18] border border-black/[0.06] dark:border-white/[0.08] shadow-xs transition-all duration-300 group-hover:shadow-md group-hover:scale-[1.01]">
          {mainThumbnail ? (
            <img
              src={mainThumbnail.url}
              alt={proj.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
            />
          ) : (
            /* Colorful Default Dynamic Thumbnail with Rich Typography */
            <div
              className={`w-full h-full bg-gradient-to-br ${gradientTheme.gradient} flex flex-col items-center justify-center p-6 text-white relative`}
            >
              {/* Subtle background pattern */}
              <div className="absolute inset-0 bg-black/15 pointer-events-none" />

              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner mb-2 border border-white/25 group-hover:scale-105 transition-transform">
                <span className="font-extrabold text-xl tracking-tight text-white drop-shadow-sm">
                  {proj.emoji || initials || "SV"}
                </span>
              </div>

              <span className="text-[11px] font-bold uppercase tracking-widest text-white/90 drop-shadow-sm text-center line-clamp-1 px-4">
                {proj.name}
              </span>
            </div>
          )}

          {/* Done Badge Overlay */}
          {isDone && (
            <div className="absolute bottom-2.5 right-2.5">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#059669] text-white shadow-xs">
                ✓ Done
              </span>
            </div>
          )}
        </div>

        {/* YouTube Video Info Row: Avatar + Title/Channel Details */}
        <div className="flex items-start gap-3 mt-3 px-0.5">
          {/* Channel Avatar Circle */}
          <div
            className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradientTheme.gradient} shrink-0 flex items-center justify-center text-white font-bold text-xs shadow-xs border border-white/10`}
          >
            {channelName
              ? channelName.slice(0, 1).toUpperCase()
              : initials.slice(0, 1) || "S"}
          </div>

          {/* Details Column */}
          <div className="flex-1 min-w-0">
            {/* Title (2-line clamp, bold) */}
            <h3 className="font-bold text-sm md:text-base text-[#1E1A17] dark:text-[#FAF8F5] leading-snug line-clamp-2 group-hover:text-[#FF5338] transition-colors">
              {proj.emoji ? <span className="mr-1.5">{proj.emoji}</span> : null}
              {proj.name}
            </h3>

            {/* Channel handle */}
            <div className="text-xs text-[#8C8379] dark:text-[#A89F95] mt-0.5 flex items-center gap-1.5 truncate">
              {channelName ? (
                <span>@{channelName}</span>
              ) : (
                <span>Snipvis Creator</span>
              )}
              <span>•</span>
              <span className="font-mono text-[11px]">
                {inspCount} swipe{inspCount === 1 ? "" : "s"}
              </span>
              <span>•</span>
              <span className="font-mono text-[11px]">
                {assetCount} asset{assetCount === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/[0.05] dark:border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[#1E1A17] dark:text-[#FAF8F5]">
              🎬 Projects
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-black/[0.04] dark:bg-white/[0.06] text-[#8C8379]">
              {activeCount} Active Production{activeCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenNewProject}
          className="h-9 px-4 rounded-full bg-[#FF5338] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs hover:bg-[#d93820] active:scale-95 transition-all self-start md:self-auto cursor-pointer"
        >
          <span className="text-sm leading-none">+</span>
          <span>Create New Project</span>
        </button>
      </div>

      {/* Filter Pill Banner */}
      {selectedChannelId && (
        <div className="flex items-center justify-between p-3 px-4 rounded-2xl bg-black/[0.025] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] text-xs text-foreground">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Filtered by Channel:</span>
            <span className="font-bold text-foreground">
              {activeChannelName || "Selected Channel"}
            </span>
            <span className="text-muted-foreground">
              ({filteredProjects.length} project
              {filteredProjects.length === 1 ? "" : "s"})
            </span>
          </div>
          {onClearChannelFilter && (
            <button
              type="button"
              onClick={onClearChannelFilter}
              className="text-xs font-semibold text-[#FF5338] hover:underline cursor-pointer"
            >
              ✕ View All Projects
            </button>
          )}
        </div>
      )}

      {/* Active Projects Grid (YouTube-Style) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#8C8379]">
            In Production ({activeCount})
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeProjects.map((proj) => renderProjectCard(proj, false))}

          {/* Inline Create New Project Card */}
          <button
            type="button"
            onClick={onOpenNewProject}
            className="aspect-video w-full rounded-2xl border border-dashed border-black/[0.1] dark:border-white/[0.1] bg-black/[0.01] dark:bg-white/[0.01] p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#FF5338] hover:bg-[#FFEBE7]/20 dark:hover:bg-red-950/10 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-black/[0.04] dark:bg-white/[0.05] text-[#FF5338] flex items-center justify-center group-hover:scale-105 transition-transform mb-2">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </div>
            <h3 className="font-bold text-sm text-[#1E1A17] dark:text-[#FAF8F5]">
              Start New Video Project
            </h3>
            <span className="text-[11px] text-[#8C8379] mt-1">
              Add packaging, scripts & assets
            </span>
          </button>
        </div>
      </div>

      {/* Completed Projects Section (if any) */}
      {doneProjects.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-black/[0.05] dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#8C8379]">
              Completed Projects ({doneProjects.length})
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D1FAE5] text-[#065F46] dark:bg-emerald-950/40 dark:text-emerald-300">
              Published & Archived
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {doneProjects.map((proj) => renderProjectCard(proj, true))}
          </div>
        </div>
      )}
    </div>
  );
}

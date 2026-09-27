"use client";

import { Button } from "@/components/ui/button";

interface ProjectsHubViewProps {
  projects: Array<{
    id: string;
    name: string;
    slug?: string;
    channel?: string | null;
    angle?: string | null;
    hook?: string | null;
    scriptLink?: string | null;
    notes?: string | null;
    _count?: { inspirations: number; assets: number };
  }>;
  onSelectProject: (id: string) => void;
  onOpenNewProject: () => void;
}

export function ProjectsHubView({
  projects,
  onSelectProject,
  onOpenNewProject,
}: ProjectsHubViewProps) {
  const calculateBriefProgress = (proj: (typeof projects)[0]) => {
    let score = 0;
    if (proj.name) score += 25;
    if (proj.angle) score += 25;
    if (proj.hook) score += 25;
    if (proj.scriptLink || proj.notes) score += 25;
    return score;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E3DCD3] dark:border-[#3C3530] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-extrabold tracking-tight text-[#1E1A17] dark:text-[#FAF8F5]">
              🎬 Active Projects Pipeline
            </h2>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold font-grotesk bg-[#FFEBE7] text-[#b51d07] dark:bg-red-950/40 dark:text-red-300">
              {projects.length} Video Productions
            </span>
          </div>
          <p className="text-xs text-[#58524C] dark:text-[#A89F95] font-medium mt-1">
            Track ideation, creative briefs, script links, and attached swipe
            files across your production pipeline.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewProject}
          className="h-10 px-5 rounded-full bg-[#FF5338] text-white text-xs font-bold flex items-center gap-1.5 tactile-btn shadow-sm hover:bg-[#d93820] self-start md:self-auto"
        >
          <span>+</span> Create New Project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Inline Create New Project Card */}
        <button
          type="button"
          onClick={onOpenNewProject}
          className="rounded-2xl border-2 border-dashed border-[#E3DCD3] dark:border-[#3C3530] p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#FF5338] hover:bg-[#FFEBE7]/20 dark:hover:bg-red-950/10 transition-all min-h-[220px] group w-full"
        >
          <div className="w-12 h-12 rounded-full bg-[#F1EDE6] dark:bg-[#2A2521] text-[#FF5338] flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
            <svg
              className="w-5 h-5"
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
          <h3 className="font-extrabold text-sm text-[#1E1A17] dark:text-[#FAF8F5]">
            Start New Post
          </h3>
        </button>

        {/* Project Cards */}
        {projects.map((proj) => {
          const progress = calculateBriefProgress(proj);
          const inspCount = proj._count?.inspirations ?? 0;
          const assetCount = proj._count?.assets ?? 0;

          return (
            <div
              key={proj.id}
              className="bg-white dark:bg-[#1E1A17] rounded-2xl border border-[#E3DCD3] dark:border-[#3C3530] p-5 flex flex-col justify-between card-lift transition-all space-y-4"
            >
              <div className="space-y-3">
                {/* Title & Channel Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <button
                      type="button"
                      onClick={() => onSelectProject(proj.id)}
                      className="font-extrabold text-base text-[#1E1A17] dark:text-[#FAF8F5] hover:text-[#FF5338] cursor-pointer line-clamp-1 text-left"
                    >
                      {proj.name}
                    </button>
                    {proj.channel ? (
                      <span className="text-xs font-semibold text-[#8C8379]">
                        @{proj.channel}
                      </span>
                    ) : null}
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-grotesk bg-[#F1EDE6] dark:bg-[#2A2521] text-[#1E1A17] dark:text-[#FAF8F5]">
                    {progress}% Brief
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[#F1EDE6] dark:bg-[#2A2521] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#059669] h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Concept Premise / Angle */}
                <p className="text-xs text-[#58524C] dark:text-[#A89F95] line-clamp-2 leading-relaxed">
                  {proj.angle ||
                    proj.notes ||
                    "No concept angle defined yet. Click to complete creative brief."}
                </p>

                {/* Inventory Counters */}
                <div className="flex items-center gap-3 text-xs font-bold font-grotesk text-[#58524C] dark:text-[#A89F95]">
                  <span className="flex items-center gap-1">
                    <span>💡</span> {inspCount} Inspirations
                  </span>
                  <span className="flex items-center gap-1">
                    <span>📎</span> {assetCount} Media Assets
                  </span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-[#E3DCD3]/50 dark:border-[#3C3530]/50 flex items-center justify-between">
                {proj.scriptLink ? (
                  <a
                    href={proj.scriptLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-[#FF5338] hover:underline flex items-center gap-1"
                  >
                    <span>📝</span> Open Script ↗
                  </a>
                ) : (
                  <span className="text-xs text-[#8C8379]">
                    No script attached
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => onSelectProject(proj.id)}
                  className="px-3.5 py-1.5 rounded-full bg-[#F1EDE6] dark:bg-[#2A2521] hover:bg-[#EBE5DC] text-xs font-bold text-[#1E1A17] dark:text-white transition-colors"
                >
                  Open Workspace →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

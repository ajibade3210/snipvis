"use client";

import { AssetsView } from "@/components/assets-view";
import { BriefView } from "@/components/brief-view";
import { GlobalVaultView } from "@/components/views/global-vault-view";
import type { FormattedInspiration, ProjectRecord } from "@/types";

interface ProjectWorkspaceViewProps {
  project: {
    id: string;
    name: string;
    description?: string | null;
    channel?: string | null;
    _count?: { inspirations: number; assets: number };
  };
  activeTab: "inspirations" | "brief" | "assets";
  onTabChange: (tab: "inspirations" | "brief" | "assets") => void;
  inspirations: FormattedInspiration[];
  searchQuery: string;
  onOpenAddModal: () => void;
  onToggleFavorite: (item: FormattedInspiration) => void;
  onEditNote: (item: FormattedInspiration) => void;
  onRemoveItem: (item: FormattedInspiration) => void;
  allProjects: ProjectRecord[];
}

export function ProjectWorkspaceView({
  project,
  activeTab,
  onTabChange,
  inspirations,
  searchQuery,
  onOpenAddModal,
  onToggleFavorite,
  onEditNote,
  onRemoveItem,
  allProjects,
}: ProjectWorkspaceViewProps) {
  return (
    <div className="space-y-6">
      {/* Project Stage Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3DCD3] dark:border-[#3C3530] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#1E1A17] dark:text-[#FAF8F5]">
              {project.name}
            </h1>
            {project.channel ? (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F1EDE6] dark:bg-[#2A2521] text-[#1E1A17] dark:text-white font-bold">
                @{project.channel}
              </span>
            ) : null}
          </div>
          <p className="text-xs text-[#58524C] dark:text-[#A89F95] font-medium mt-1">
            {project.description ||
              "Project research vault, creative brief, and media assets."}
          </p>
        </div>

        {/* Sub-Tab Switcher */}
        <div className="flex items-center p-1 bg-[#F1EDE6] dark:bg-[#221E1A] rounded-xl border border-[#E3DCD3] dark:border-[#3C3530] text-xs font-bold">
          <button
            type="button"
            onClick={() => onTabChange("inspirations")}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === "inspirations"
                ? "bg-white dark:bg-[#2A2521] text-[#FF5338] shadow-xs"
                : "text-[#58524C] dark:text-[#A89F95]"
            }`}
          >
            💡 Inspirations ({inspirations.length})
          </button>
          <button
            type="button"
            onClick={() => onTabChange("brief")}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === "brief"
                ? "bg-white dark:bg-[#2A2521] text-[#FF5338] shadow-xs"
                : "text-[#58524C] dark:text-[#A89F95]"
            }`}
          >
            📋 Creative Brief
          </button>
          <button
            type="button"
            onClick={() => onTabChange("assets")}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === "assets"
                ? "bg-white dark:bg-[#2A2521] text-[#FF5338] shadow-xs"
                : "text-[#58524C] dark:text-[#A89F95]"
            }`}
          >
            📎 Assets ({project._count?.assets ?? 0})
          </button>
        </div>
      </div>

      {/* Sub-Tabs Content */}
      {activeTab === "inspirations" && (
        <GlobalVaultView
          inspirations={inspirations}
          searchQuery={searchQuery}
          onOpenAddModal={onOpenAddModal}
          onToggleFavorite={onToggleFavorite}
          onEditNote={onEditNote}
          onRemoveItem={onRemoveItem}
          selectedProjectId={project.id}
        />
      )}

      {activeTab === "brief" && <BriefView projectId={project.id} />}

      {activeTab === "assets" && (
        <AssetsView
          projectId={project.id}
          projectName={project.name}
          projects={allProjects}
        />
      )}
    </div>
  );
}

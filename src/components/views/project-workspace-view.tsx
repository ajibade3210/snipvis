"use client";

import { AssetsView } from "@/components/assets-view";
import { BriefView } from "@/components/brief-view";
import { ProjectModal } from "@/components/project-modal";
import { ThumbnailGallery } from "@/components/thumbnail-gallery";
import { GlobalVaultView } from "@/components/views/global-vault-view";
import { useProject, useUpdateProject } from "@/hooks/use-projects";
import type {
  FormattedInspiration,
  ProjectRecord,
  ProjectThumbnailRecord,
} from "@/types";
import type { ChannelRecord } from "@/types/channel";
import { useState } from "react";

interface ProjectWorkspaceViewProps {
  project: {
    id: string;
    name: string;
    description?: string | null;
    channelId?: string | null;
    channel?: ChannelRecord | string | null;
    status?: "ACTIVE" | "DONE";
    thumbnails?: ProjectThumbnailRecord[];
    _count?: { inspirations: number; assets: number };
  };
  activeTab: "inspirations" | "brief" | "assets" | "thumbnails";
  onTabChange: (
    tab: "inspirations" | "brief" | "assets" | "thumbnails",
  ) => void;
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const updateProjectMutation = useUpdateProject();
  const { data: liveProject } = useProject(project.id);
  const isDone = project.status === "DONE";

  const handleToggleDone = async () => {
    try {
      await updateProjectMutation.mutateAsync({
        id: project.id,
        data: { status: isDone ? "ACTIVE" : "DONE" },
      });
    } catch (err) {
      console.error("Failed to toggle project status:", err);
    }
  };

  const thumbnailCount = project.thumbnails?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Project Stage Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3DCD3] dark:border-[#3C3530] pb-5">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1E1A17] dark:text-[#FAF8F5]">
            {project.name}
          </h1>

          {(() => {
            const channelName =
              typeof project.channel === "object" && project.channel
                ? project.channel.name
                : typeof project.channel === "string"
                  ? project.channel
                  : null;
            return channelName ? (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F1EDE6] dark:bg-[#2A2521] text-[#1E1A17] dark:text-white font-bold">
                @{channelName}
              </span>
            ) : null;
          })()}

          {/* Edit Project Details button */}
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            title="Edit project name & target channel"
            className="p-1.5 rounded-lg text-[#58524C] dark:text-[#A89F95] hover:text-[#1E1A17] dark:hover:text-[#FAF8F5] hover:bg-[#F1EDE6] dark:hover:bg-[#2A2521] transition-colors cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
              />
            </svg>
          </button>

          {/* Mark as Done / Reopen Button */}
          <button
            type="button"
            onClick={handleToggleDone}
            disabled={updateProjectMutation.isPending}
            title={
              isDone
                ? "Click to reopen this project"
                : "Mark this video project as complete"
            }
            className={`h-8 px-4 rounded-full text-xs font-extrabold flex items-center gap-2 transition-all duration-200 cursor-pointer select-none ${
              updateProjectMutation.isPending
                ? "opacity-60 cursor-not-allowed bg-[#E3DCD3] dark:bg-[#2A2521] text-[#8C8379]"
                : isDone
                  ? "bg-transparent border-2 border-emerald-500/60 text-emerald-600 dark:text-emerald-400 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                  : "bg-[#059669] hover:bg-[#047857] active:scale-95 text-white shadow-sm shadow-emerald-900/20 tactile-btn"
            }`}
          >
            {updateProjectMutation.isPending ? (
              <>
                <svg
                  className="w-3 h-3 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <span>Saving…</span>
              </>
            ) : isDone ? (
              <>
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                <span>Done</span>
                <span className="text-[10px] font-medium opacity-70 border-l border-current/30 pl-2">
                  Reopen?
                </span>
              </>
            ) : (
              <>
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                <span>Mark as Done</span>
              </>
            )}
          </button>
        </div>

        {/* Sub-Tab Switcher (4 Tabs) */}
        <div className="flex items-center flex-wrap p-1 bg-[#F1EDE6] dark:bg-[#221E1A] rounded-xl border border-[#E3DCD3] dark:border-[#3C3530] text-xs font-bold gap-0.5">
          <button
            type="button"
            onClick={() => onTabChange("inspirations")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "inspirations"
                ? "bg-white dark:bg-[#2A2521] text-[#FF5338] shadow-xs"
                : "text-[#58524C] dark:text-[#A89F95] hover:text-[#1E1A17] dark:hover:text-white"
            }`}
          >
            💡 Inspirations ({inspirations.length})
          </button>
          <button
            type="button"
            onClick={() => onTabChange("thumbnails")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "thumbnails"
                ? "bg-white dark:bg-[#2A2521] text-[#FF5338] shadow-xs"
                : "text-[#58524C] dark:text-[#A89F95] hover:text-[#1E1A17] dark:hover:text-white"
            }`}
          >
            🖼️ Thumbnails ({thumbnailCount})
          </button>
          <button
            type="button"
            onClick={() => onTabChange("brief")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "brief"
                ? "bg-white dark:bg-[#2A2521] text-[#FF5338] shadow-xs"
                : "text-[#58524C] dark:text-[#A89F95] hover:text-[#1E1A17] dark:hover:text-white"
            }`}
          >
            📋 Creative Brief
          </button>
          <button
            type="button"
            onClick={() => onTabChange("assets")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "assets"
                ? "bg-white dark:bg-[#2A2521] text-[#FF5338] shadow-xs"
                : "text-[#58524C] dark:text-[#A89F95] hover:text-[#1E1A17] dark:hover:text-white"
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

      {activeTab === "thumbnails" && (
        <ThumbnailGallery
          projectId={project.id}
          projectName={project.name}
          thumbnails={project.thumbnails}
        />
      )}

      {activeTab === "brief" && (
        <div className="relative">
          {/* Preview Button — floated top-right of the brief section */}
          <div className="absolute top-0 right-0 z-10">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              title="Preview script as a standalone clean view"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#F1EDE6] dark:bg-[#2A2521] text-[#58524C] dark:text-[#A89F95] hover:bg-[#E8E0D5] dark:hover:bg-[#332E28] hover:text-[#1E1A17] dark:hover:text-white transition-all cursor-pointer border border-[#E3DCD3] dark:border-[#3C3530]"
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
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.641 0-8.58-3.007-9.964-7.178z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Preview
            </button>
          </div>
          <BriefView projectId={project.id} />
        </div>
      )}

      {activeTab === "assets" && (
        <AssetsView
          projectId={project.id}
          projectName={project.name}
          projects={allProjects}
        />
      )}

      <ProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        project={project}
      />

      {/* Script Preview Overlay — clean standalone content view */}
      {isPreviewOpen && (
        <dialog
          open
          className="fixed inset-0 z-50 m-0 h-full w-full max-w-none bg-white dark:bg-[#0F0D0B] overflow-y-auto p-0 border-0"
          aria-label="Script Preview"
        >
          {/* Preview Toolbar */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 border-b border-[#E3DCD3] dark:border-[#3C3530] bg-white/95 dark:bg-[#0F0D0B]/95 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black uppercase tracking-widest text-[#8C8379] dark:text-[#A89F95]">
                Preview
              </span>
              <span className="text-sm font-bold text-[#1E1A17] dark:text-[#FAF8F5] truncate max-w-xs">
                {project.name}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#58524C] dark:text-[#A89F95] hover:bg-[#F1EDE6] dark:hover:bg-[#2A2521] transition-all cursor-pointer"
            >
              <svg
                className="w-4 h-4"
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
              Close Preview
            </button>
          </div>

          {/* Content Area */}
          <div className="max-w-3xl mx-auto px-6 py-12">
            {/* Hook */}
            {liveProject?.hook && (
              <div className="mb-10 p-5 rounded-xl bg-[#FFEBE7]/60 dark:bg-red-950/20 border border-[#FF5338]/20">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#FF5338] mb-2">
                  🎣 Opening Hook
                </p>
                <p className="text-sm leading-relaxed text-[#1E1A17] dark:text-[#FAF8F5] whitespace-pre-wrap font-medium">
                  {liveProject.hook}
                </p>
              </div>
            )}

            {/* Script body */}
            {liveProject?.script ? (
              <div
                className="prose prose-sm dark:prose-invert max-w-none text-[#1E1A17] dark:text-[#FAF8F5] leading-relaxed"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: script is user-authored rich text from ScriptEditor
                dangerouslySetInnerHTML={{ __html: liveProject.script }}
              />
            ) : (
              <div className="text-center py-20 text-[#8C8379] dark:text-[#A89F95]">
                <p className="text-4xl mb-3">📄</p>
                <p className="text-sm font-semibold">No script written yet.</p>
                <p className="text-xs mt-1">
                  Write content in the Creative Brief tab and it will appear
                  here.
                </p>
              </div>
            )}
          </div>
        </dialog>
      )}
    </div>
  );
}

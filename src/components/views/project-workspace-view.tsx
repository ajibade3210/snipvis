"use client";

import { AssetsView } from "@/components/assets-view";
import { BriefView } from "@/components/brief-view";
import { ProjectModal } from "@/components/project-modal";
import { ThumbnailGallery } from "@/components/thumbnail-gallery";
import { GlobalVaultView } from "@/components/views/global-vault-view";
import { useProject, useUpdateProject } from "@/hooks/use-projects";
import { DEFAULT_PROJECT_EMOJIS } from "@/lib/constants";
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
    emoji?: string | null;
    description?: string | null;
    channelId?: string | null;
    channel?: ChannelRecord | string | null;
    status?: "ACTIVE" | "DONE";
    hook?: string | null;
    script?: string | null;
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
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const updateProjectMutation = useUpdateProject();
  const { data: liveProject } = useProject(project.id);
  const currentProject = liveProject ?? project;
  const isDone = currentProject.status === "DONE";

  const handleUpdateEmoji = async (newEmoji: string | null) => {
    setIsEmojiPickerOpen(false);
    try {
      await updateProjectMutation.mutateAsync({
        id: currentProject.id,
        data: { emoji: newEmoji },
      });
    } catch (err) {
      console.error("Failed to update project emoji:", err);
    }
  };

  const handleToggleDone = async () => {
    try {
      await updateProjectMutation.mutateAsync({
        id: currentProject.id,
        data: { status: isDone ? "ACTIVE" : "DONE" },
      });
    } catch (err) {
      console.error("Failed to toggle project status:", err);
    }
  };

  const thumbnailCount = currentProject.thumbnails?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Project Stage Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-black/[0.05] dark:border-white/[0.06] pb-4 sm:pb-5">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Project Emoji & Quick Picker */}
          <div
            className="relative"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsEmojiPickerOpen(false);
              }
            }}
          >
            <button
              type="button"
              onClick={() => setIsEmojiPickerOpen((prev) => !prev)}
              aria-expanded={isEmojiPickerOpen}
              aria-haspopup="dialog"
              title={
                currentProject.emoji
                  ? "Change or remove emoji"
                  : "Add project emoji"
              }
              className="p-1 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors flex items-center justify-center cursor-pointer group"
            >
              {currentProject.emoji ? (
                <span className="text-2xl sm:text-3xl leading-none">
                  {currentProject.emoji}
                </span>
              ) : (
                <span className="text-xs font-semibold text-[#8C8379] group-hover:text-[#1E1A17] dark:group-hover:text-[#FAF8F5] px-2 py-1 rounded-lg border border-dashed border-black/[0.1] dark:border-white/[0.1]">
                  + Add Icon
                </span>
              )}
            </button>

            {isEmojiPickerOpen && (
              <>
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label="Close emoji picker"
                  className="fixed inset-0 z-40 bg-transparent cursor-default border-none p-0 w-full h-full"
                  onClick={() => setIsEmojiPickerOpen(false)}
                />
                <div className="absolute left-0 top-full mt-2 z-50 p-2.5 bg-[#FCFAF7] dark:bg-[#1C1815] border border-black/[0.06] dark:border-white/[0.08] rounded-2xl shadow-xl w-64 space-y-2 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between text-xs font-bold text-[#8C8379] pb-1 border-b border-black/[0.04] dark:border-white/[0.05]">
                    <span>Project Emoji</span>
                    {currentProject.emoji ? (
                      <button
                        type="button"
                        onClick={() => handleUpdateEmoji(null)}
                        className="text-[11px] text-destructive hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {DEFAULT_PROJECT_EMOJIS.map((em) => (
                      <button
                        key={em}
                        type="button"
                        title={`Select ${em}`}
                        aria-label={`Select ${em}`}
                        onClick={() => handleUpdateEmoji(em)}
                        className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-transform active:scale-90 cursor-pointer ${
                          currentProject.emoji === em
                            ? "bg-primary/20 ring-1 ring-primary"
                            : ""
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-[#1E1A17] dark:text-[#FAF8F5]">
            {currentProject.name}
          </h1>

          {(() => {
            const channelName =
              typeof currentProject.channel === "object" &&
              currentProject.channel
                ? currentProject.channel.name
                : typeof currentProject.channel === "string"
                  ? currentProject.channel
                  : null;
            return channelName ? (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-[#1E1A17] dark:text-white font-medium">
                @{channelName}
              </span>
            ) : null;
          })()}

          {/* Edit Project Details button */}
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            title="Edit project name & target channel"
            className="p-1.5 rounded-lg text-[#8C8379] hover:text-[#1E1A17] dark:hover:text-[#FAF8F5] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
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
            className={`h-8 px-3.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer select-none ${
              updateProjectMutation.isPending
                ? "opacity-60 cursor-not-allowed bg-black/[0.04] dark:bg-white/[0.06] text-[#8C8379]"
                : isDone
                  ? "bg-transparent border border-emerald-500/60 text-emerald-600 dark:text-emerald-400 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20"
                  : "bg-[#059669] hover:bg-[#047857] active:scale-95 text-white shadow-xs"
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
                <span className="text-[10px] font-medium opacity-70 border-l border-current/30 pl-1.5">
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

        {/* Sub-Tab Switcher (4 Tabs with horizontal mobile scroll) */}
        <div className="w-full sm:w-auto overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
          <div className="inline-flex items-center p-1 bg-black/[0.03] dark:bg-white/[0.04] rounded-full border border-black/[0.04] dark:border-white/[0.06] text-xs font-medium gap-1 min-w-full sm:min-w-0">
            <button
              type="button"
              onClick={() => onTabChange("inspirations")}
              className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === "inspirations"
                  ? "bg-white dark:bg-[#201C18] text-[#1E1A17] dark:text-[#FAF8F5] shadow-xs font-semibold"
                  : "text-[#58524C] dark:text-[#A89F95] hover:text-[#1E1A17] dark:hover:text-[#FAF8F5]"
              }`}
            >
              💡 Inspirations ({inspirations.length})
            </button>
            <button
              type="button"
              onClick={() => onTabChange("thumbnails")}
              className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === "thumbnails"
                  ? "bg-white dark:bg-[#201C18] text-[#1E1A17] dark:text-[#FAF8F5] shadow-xs font-semibold"
                  : "text-[#58524C] dark:text-[#A89F95] hover:text-[#1E1A17] dark:hover:text-[#FAF8F5]"
              }`}
            >
              🖼️ Thumbnails ({thumbnailCount})
            </button>
            <button
              type="button"
              onClick={() => onTabChange("brief")}
              className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === "brief"
                  ? "bg-white dark:bg-[#201C18] text-[#1E1A17] dark:text-[#FAF8F5] shadow-xs font-semibold"
                  : "text-[#58524C] dark:text-[#A89F95] hover:text-[#1E1A17] dark:hover:text-[#FAF8F5]"
              }`}
            >
              📋 Creative Brief
            </button>
            <button
              type="button"
              onClick={() => onTabChange("assets")}
              className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === "assets"
                  ? "bg-white dark:bg-[#201C18] text-[#1E1A17] dark:text-[#FAF8F5] shadow-xs font-semibold"
                  : "text-[#58524C] dark:text-[#A89F95] hover:text-[#1E1A17] dark:hover:text-[#FAF8F5]"
              }`}
            >
              📎 Assets ({currentProject._count?.assets ?? 0})
            </button>
          </div>
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
          projectId={currentProject.id}
          projectName={currentProject.name}
          hook={currentProject.hook}
          channelName={
            typeof currentProject.channel === "object" &&
            currentProject.channel !== null
              ? currentProject.channel.name
              : typeof currentProject.channel === "string"
                ? currentProject.channel
                : null
          }
          thumbnails={currentProject.thumbnails}
          referenceInspirations={inspirations.map((i) => ({
            id: i.id,
            title: i.title || "Untitled Reference",
            thumbnailUrl: i.thumbnailUrl,
            channelName: i.channelName,
            views: i.views,
            duration: i.duration,
          }))}
        />
      )}

      {activeTab === "brief" && (
        <BriefView
          projectId={project.id}
          onPreview={() => setIsPreviewOpen(true)}
        />
      )}

      {activeTab === "assets" && (
        <AssetsView
          projectId={currentProject.id}
          projectName={currentProject.name}
          projects={allProjects}
        />
      )}

      <ProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        project={currentProject}
      />

      {/* Script Preview Overlay — clean standalone content view */}
      {isPreviewOpen && (
        <dialog
          open
          className="fixed inset-0 z-50 m-0 h-full w-full max-w-none bg-[#FCFAF7] dark:bg-[#12100E] overflow-y-auto p-0 border-0"
          aria-label="Script Preview"
        >
          {/* Preview Toolbar */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 border-b border-black/[0.05] dark:border-white/[0.06] bg-[#FCFAF7] dark:bg-[#12100E]">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#8C8379]">
                Preview
              </span>
              <span className="text-sm font-bold text-[#1E1A17] dark:text-[#FAF8F5] truncate max-w-xs">
                {currentProject.name}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-[#58524C] dark:text-[#A89F95] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-all cursor-pointer"
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
            {currentProject.hook && (
              <div className="mb-10 p-5 rounded-xl bg-[#FFEBE7]/60 dark:bg-red-950/20 border border-[#FF5338]/20">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#FF5338] mb-2">
                  🎣 Opening Hook
                </p>
                <p className="text-sm leading-relaxed text-[#1E1A17] dark:text-[#FAF8F5] whitespace-pre-wrap font-medium">
                  {currentProject.hook}
                </p>
              </div>
            )}

            {/* Script body */}
            {currentProject.script ? (
              <div
                className="prose prose-sm dark:prose-invert max-w-none text-[#1E1A17] dark:text-[#FAF8F5] leading-relaxed"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: script is user-authored rich text from ScriptEditor
                dangerouslySetInnerHTML={{ __html: currentProject.script }}
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

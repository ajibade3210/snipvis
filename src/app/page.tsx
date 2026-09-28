"use client";

import { AnalyzeHookModal } from "@/components/analyze-hook-modal";
import { InspirationModal } from "@/components/inspiration-modal";
import { NoteModal } from "@/components/note-modal";
import { ProjectModal } from "@/components/project-modal";
import { Sidebar } from "@/components/sidebar";
import { TopHeader } from "@/components/top-header";
import { ChannelsView } from "@/components/views/channels-view";
import { CompetitorSpyView } from "@/components/views/competitor-spy-view";
import { GlobalVaultView } from "@/components/views/global-vault-view";
import { ProjectWorkspaceView } from "@/components/views/project-workspace-view";
import { ProjectsHubView } from "@/components/views/projects-hub-view";
import { SettingsView } from "@/components/views/settings-view";
import {
  useCreateInspiration,
  useDeleteTagInspiration,
  useInspirationsByProject,
  useInspirationsGlobal,
  useTagInspiration,
} from "@/hooks/use-inspirations";
import { useProjects } from "@/hooks/use-projects";
import { formatInspirations } from "@/lib/format-inspirations";
import type { FormattedInspiration, NavView } from "@/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";

function CreatorLabShell() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const rawNav = searchParams.get("view");
  const activeNav: NavView =
    rawNav === "active-projects" ? "projects" : (rawNav as NavView) || "global";

  const selectedProjectId = searchParams.get("project") || null;
  const activeTab =
    (searchParams.get("tab") as
      | "inspirations"
      | "brief"
      | "assets"
      | "thumbnails") || "brief";

  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [initialYoutubeUrl, setInitialYoutubeUrl] = useState("");

  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [newProjectDefaultChannelId, setNewProjectDefaultChannelId] = useState<
    string | null
  >(null);
  const [isAddInspirationOpen, setIsAddInspirationOpen] = useState(false);
  const [isAnalyzeHookOpen, setIsAnalyzeHookOpen] = useState(false);
  const [noteModalData, setNoteModalData] = useState<{
    inspirationId: string;
    projectId: string;
    note?: string | null;
  } | null>(null);

  // Global Keyboard Shortcuts (⌘K, N, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const el = document.activeElement;
      const isInput =
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (!isInput && e.key.toLowerCase() === "n") {
        e.preventDefault();
        setInitialYoutubeUrl("");
        setIsAddInspirationOpen(true);
      } else if (e.key === "Escape") {
        setIsAddInspirationOpen(false);
        setIsNewProjectOpen(false);
        setIsAnalyzeHookOpen(false);
        setNoteModalData(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const { data: dbProjects = [] } = useProjects();
  const globalQuery = useInspirationsGlobal();
  const projectQuery = useInspirationsByProject(selectedProjectId);
  const dbInspirations = selectedProjectId
    ? (projectQuery.data ?? [])
    : (globalQuery.data ?? []);

  const tagMutation = useTagInspiration();
  const deleteTagMutation = useDeleteTagInspiration();
  const createInspirationMutation = useCreateInspiration();

  const updateUrl = (params: {
    view?: string | null;
    project?: string | null;
    tab?: string | null;
    channel?: string | null;
  }) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    for (const [key, value] of Object.entries(params)) {
      if (value === null) current.delete(key);
      else if (value !== undefined) current.set(key, value);
    }
    const search = current.toString();
    router.push(`${pathname}${search ? `?${search}` : ""}`);
  };

  const currentProject = dbProjects.find((p) => p.id === selectedProjectId);
  const formattedInspirations = useMemo(
    () => formatInspirations(dbInspirations, currentProject?.name),
    [dbInspirations, currentProject?.name],
  );

  const handleToggleFavorite = async (item: FormattedInspiration) => {
    const projId =
      selectedProjectId || item.projectContext?.projectId || dbProjects[0]?.id;
    if (!projId) {
      setIsNewProjectOpen(true);
      return;
    }
    await tagMutation.mutateAsync({
      inspirationId: item.id,
      projectId: projId,
      favorite: !item.projectContext?.favorite,
      note: item.projectContext?.note || undefined,
    });
  };

  const handleRemoveItem = async (item: FormattedInspiration) => {
    if (!selectedProjectId) return;
    if (confirm("Remove this inspiration from current project?")) {
      await deleteTagMutation.mutateAsync({
        projectId: selectedProjectId,
        inspirationId: item.id,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#171412] text-[#1E1A17] dark:text-[#FAF8F5] flex flex-col font-sans">
      <TopHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchKeyDown={(e) => {
          if (e.key === "Enter" && searchQuery.includes("youtu")) {
            setInitialYoutubeUrl(searchQuery.trim());
            setIsAddInspirationOpen(true);
          }
        }}
        searchInputRef={searchInputRef}
        itemCount={formattedInspirations.length}
        onOpenAddInspiration={() => setIsAddInspirationOpen(true)}
        onOpenSettings={() =>
          updateUrl({ view: "settings", project: null, tab: null })
        }
      />

      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar
          projects={dbProjects}
          totalInspirationsCount={formattedInspirations.length}
          activeNav={activeNav}
          selectedProjectId={selectedProjectId}
          onSelectNav={(nav) =>
            updateUrl({ view: nav, project: null, tab: null, channel: null })
          }
          onSelectProject={(id) =>
            updateUrl(
              id === null
                ? { view: "global", project: null, tab: null, channel: null }
                : { view: null, project: id, tab: "brief", channel: null },
            )
          }
          onOpenNewProject={() => {
            setNewProjectDefaultChannelId(null);
            setIsNewProjectOpen(true);
          }}
          onAnalyzeUrl={() => {
            setIsAnalyzeHookOpen(true);
          }}
        />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-[1600px]">
          {selectedProjectId && currentProject ? (
            <ProjectWorkspaceView
              project={currentProject}
              activeTab={activeTab}
              onTabChange={(tab) => updateUrl({ tab })}
              inspirations={formattedInspirations}
              searchQuery={searchQuery}
              onOpenAddModal={() => setIsAddInspirationOpen(true)}
              onToggleFavorite={handleToggleFavorite}
              onEditNote={(item) =>
                setNoteModalData({
                  inspirationId: item.id,
                  projectId: selectedProjectId,
                  note: item.note,
                })
              }
              onRemoveItem={handleRemoveItem}
              allProjects={dbProjects}
            />
          ) : (
            <>
              {activeNav === "global" && (
                <GlobalVaultView
                  inspirations={formattedInspirations}
                  searchQuery={searchQuery}
                  onOpenAddModal={() => setIsAddInspirationOpen(true)}
                  onToggleFavorite={handleToggleFavorite}
                  onEditNote={(item) => {
                    if (dbProjects.length === 0) {
                      setIsNewProjectOpen(true);
                      return;
                    }
                    setNoteModalData({
                      inspirationId: item.id,
                      projectId: dbProjects[0]?.id || "",
                      note: item.note,
                    });
                  }}
                  onRemoveItem={() => {}}
                />
              )}
              {activeNav === "channels" && (
                <ChannelsView
                  onSelectChannel={(channelId) =>
                    updateUrl({
                      view: "projects",
                      channel: channelId,
                      project: null,
                      tab: null,
                    })
                  }
                  onOpenNewProjectForChannel={(channelId) => {
                    setNewProjectDefaultChannelId(channelId);
                    setIsNewProjectOpen(true);
                  }}
                />
              )}
              {(activeNav === "projects" ||
                activeNav === "active-projects") && (
                <ProjectsHubView
                  projects={dbProjects}
                  selectedChannelId={searchParams.get("channel")}
                  onClearChannelFilter={() => updateUrl({ channel: null })}
                  onSelectProject={(id) =>
                    updateUrl({ view: null, project: id, tab: "brief" })
                  }
                  onOpenNewProject={() => {
                    setNewProjectDefaultChannelId(
                      searchParams.get("channel") || null,
                    );
                    setIsNewProjectOpen(true);
                  }}
                />
              )}
              {activeNav === "competitor-spy" && (
                <CompetitorSpyView
                  onImportOutlier={(data) =>
                    createInspirationMutation.mutateAsync(data)
                  }
                />
              )}
              {activeNav === "settings" && (
                <SettingsView
                  inspirations={formattedInspirations}
                  projects={dbProjects}
                />
              )}
            </>
          )}
        </main>
      </div>

      <ProjectModal
        isOpen={isNewProjectOpen}
        defaultChannelId={newProjectDefaultChannelId}
        onClose={() => {
          setIsNewProjectOpen(false);
          setNewProjectDefaultChannelId(null);
        }}
        onCreated={(id) => updateUrl({ view: null, project: id, tab: "brief" })}
      />
      <InspirationModal
        isOpen={isAddInspirationOpen}
        onClose={() => {
          setIsAddInspirationOpen(false);
          setInitialYoutubeUrl("");
        }}
        projects={dbProjects}
        defaultProjectId={selectedProjectId}
        initialUrl={initialYoutubeUrl}
      />
      <AnalyzeHookModal
        isOpen={isAnalyzeHookOpen}
        onClose={() => setIsAnalyzeHookOpen(false)}
        projects={dbProjects}
        defaultProjectId={selectedProjectId}
        initialUrl={searchQuery.trim()}
      />
      {noteModalData && (
        <NoteModal
          isOpen={true}
          onClose={() => setNoteModalData(null)}
          inspirationId={noteModalData.inspirationId}
          projectId={noteModalData.projectId}
          initialNote={noteModalData.note}
        />
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F5] p-8 text-center text-xs">
          Loading Snipvis OS...
        </div>
      }
    >
      <CreatorLabShell />
    </Suspense>
  );
}

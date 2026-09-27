"use client";

import { useState, useMemo, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useProjects } from "@/hooks/use-projects";
import { projectService } from "@/services/api/project.service";
import {
  useInspirationsGlobal,
  useInspirationsByProject,
  useTagInspiration,
  useDeleteTagInspiration,
  useCreateInspiration,
} from "@/hooks/use-inspirations";
import { Sidebar, type NavView } from "@/components/sidebar";
import { TopHeader } from "@/components/top-header";
import { BottomPill } from "@/components/bottom-pill";
import { ProjectModal } from "@/components/project-modal";
import { InspirationModal } from "@/components/inspiration-modal";
import { NoteModal } from "@/components/note-modal";
import { formatInspirations } from "@/lib/format-inspirations";
import { GlobalVaultView } from "@/components/views/global-vault-view";
import { ProjectsHubView } from "@/components/views/projects-hub-view";
import { CompetitorSpyView } from "@/components/views/competitor-spy-view";
import { SettingsView } from "@/components/views/settings-view";
import { ProjectWorkspaceView } from "@/components/views/project-workspace-view";

function CreatorLabShell() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const activeNav = (searchParams.get("view") as NavView) || "global";
  const selectedProjectId = searchParams.get("project") || null;
  const activeTab =
    (searchParams.get("tab") as "inspirations" | "brief" | "assets") ||
    "inspirations";

  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [initialYoutubeUrl, setInitialYoutubeUrl] = useState("");

  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isAddInspirationOpen, setIsAddInspirationOpen] = useState(false);
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

  useEffect(() => {
    if (
      dbProjects.length === 0 &&
      !globalQuery.isLoading &&
      globalQuery.data?.length === 0
    ) {
      projectService
        .seed()
        .then(() => globalQuery.refetch())
        .catch(() => {});
    }
  }, [dbProjects.length, globalQuery]);

  const updateUrl = (params: {
    view?: string | null;
    project?: string | null;
    tab?: string | null;
  }) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    for (const [key, value] of Object.entries(params)) {
      if (value === null) current.delete(key);
      else if (value !== undefined) current.set(key, value);
    }
    const search = current.toString();
    router.push(`${pathname}${search ? `?${search}` : ""}`);
  };

  const currentProject = dbProjects.find(p => p.id === selectedProjectId);
  const formattedInspirations = useMemo(
    () => formatInspirations(dbInspirations, currentProject?.name),
    [dbInspirations, currentProject?.name],
  );

  const handleToggleFavorite = async (item: any) => {
    const projId =
      selectedProjectId || item.projectContext?.projectId || dbProjects[0]?.id;
    if (!projId) {
      setIsNewProjectOpen(true);
      return;
    }
    await tagMutation.mutateAsync({
      inspirationId: item.id,
      projectId: projId,
      favorite: !Boolean(item.projectContext?.favorite),
      note: item.projectContext?.note || undefined,
    });
  };

  const handleRemoveItem = async (item: any) => {
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
        onSearchKeyDown={e => {
          if (e.key === "Enter" && searchQuery.includes("youtu")) {
            setInitialYoutubeUrl(searchQuery.trim());
            setIsAddInspirationOpen(true);
          }
        }}
        searchInputRef={searchInputRef}
        itemCount={formattedInspirations.length}
        onOpenQuickCapture={() => {
          setInitialYoutubeUrl("");
          setIsAddInspirationOpen(true);
        }}
        onOpenAddInspiration={() => setIsAddInspirationOpen(true)}
      />

      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar
          projects={dbProjects}
          totalInspirationsCount={formattedInspirations.length}
          activeNav={activeNav}
          selectedProjectId={selectedProjectId}
          onSelectNav={nav =>
            updateUrl({ view: nav, project: null, tab: null })
          }
          onSelectProject={id =>
            updateUrl(
              id === null
                ? { view: "global", project: null, tab: null }
                : { view: null, project: id, tab: "brief" },
            )
          }
          onOpenNewProject={() => setIsNewProjectOpen(true)}
        />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-[1600px]">
          {selectedProjectId && currentProject ? (
            <ProjectWorkspaceView
              project={currentProject}
              activeTab={activeTab}
              onTabChange={tab => updateUrl({ tab })}
              inspirations={formattedInspirations}
              searchQuery={searchQuery}
              onOpenAddModal={() => setIsAddInspirationOpen(true)}
              onToggleFavorite={handleToggleFavorite}
              onEditNote={item =>
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
                  onEditNote={item =>
                    setNoteModalData({
                      inspirationId: item.id,
                      projectId: dbProjects[0]?.id || "",
                      note: item.note,
                    })
                  }
                  onRemoveItem={() => {}}
                />
              )}
              {activeNav === "active-projects" && (
                <ProjectsHubView
                  projects={dbProjects}
                  onSelectProject={id =>
                    updateUrl({ view: null, project: id, tab: "brief" })
                  }
                  onOpenNewProject={() => setIsNewProjectOpen(true)}
                />
              )}
              {activeNav === "competitor-spy" && (
                <CompetitorSpyView
                  onImportOutlier={data =>
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

      <BottomPill
        onAnalyze={() => {
          if (searchQuery.includes("youtu"))
            setInitialYoutubeUrl(searchQuery.trim());
          setIsAddInspirationOpen(true);
        }}
      />
      <ProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        onCreated={id => updateUrl({ view: null, project: id, tab: "brief" })}
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

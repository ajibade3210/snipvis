"use client";

import { BRAND_ASSETS, STORAGE_KEYS } from "@/lib/constants";
import type { NavView } from "@/types";
import { useEffect, useState } from "react";

interface SidebarProps {
  projects: Array<{
    id: string;
    name: string;
    slug?: string;
    channel?: string | null;
    status?: "ACTIVE" | "DONE";
    _count?: { inspirations: number; assets: number };
  }>;
  totalInspirationsCount: number;
  activeNav: NavView;
  selectedProjectId: string | null;
  onSelectNav: (nav: NavView) => void;
  onSelectProject: (id: string | null) => void;
  onOpenNewProject: () => void;
  onAnalyzeUrl?: () => void;
}

export function Sidebar({
  projects,
  totalInspirationsCount,
  activeNav,
  selectedProjectId,
  onSelectNav,
  onSelectProject,
  onOpenNewProject,
  onAnalyzeUrl,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const activeProjects = projects.filter((p) => p.status !== "DONE");
  const doneProjects = projects.filter((p) => p.status === "DONE");
  const sortedProjects = [...activeProjects, ...doneProjects];
  const activeCount = activeProjects.length;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED);
      if (saved === "true") setIsCollapsed(true);
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(next));
      }
      return next;
    });
  };

  // Pre-assigned emojis for projects to give that creator-lab energy
  const projectEmojis = ["🔥", "⚡", "💰", "🎬", "🚀", "🎯", "🧬", "🧠"];

  return (
    <aside
      className={`border-r border-[#E3DCD3] dark:border-[#3C3530] bg-[#FAF8F5] dark:bg-[#1A1613] flex flex-col h-[calc(100vh-65px)] sticky top-[65px] select-none text-[#1E1A17] dark:text-[#FAF8F5] transition-all duration-200 shrink-0 ${
        isCollapsed ? "w-full md:w-[68px]" : "w-full md:w-72"
      }`}
    >
      {/* Brand & Minimize / Expand Action Header */}
      {isCollapsed ? (
        <div className="p-3 border-b border-[#E3DCD3]/70 dark:border-[#3C3530]/70 flex flex-col items-center gap-2.5">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-black border border-[#E3DCD3] dark:border-[#3C3530] flex items-center justify-center shrink-0 shadow-xs">
            <img
              src={BRAND_ASSETS.LOGO}
              alt={`${BRAND_ASSETS.APP_NAME} ${BRAND_ASSETS.APP_SUFFIX}`}
              className="w-full h-full object-contain"
            />
          </div>
          <button
            type="button"
            onClick={toggleCollapse}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8C8379] hover:bg-[#F1EDE6] dark:hover:bg-[#2A2521] hover:text-[#1E1A17] dark:hover:text-[#FAF8F5] transition-colors cursor-pointer"
            title="Expand Sidebar"
            aria-label="Expand Sidebar"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M9 3v18" />
              <path d="m12 9 3 3-3 3" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="p-4 border-b border-[#E3DCD3]/70 dark:border-[#3C3530]/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-black border border-[#E3DCD3] dark:border-[#3C3530] flex items-center justify-center shrink-0 shadow-xs">
              <img
                src={BRAND_ASSETS.LOGO}
                alt={`${BRAND_ASSETS.APP_NAME} ${BRAND_ASSETS.APP_SUFFIX}`}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1 font-extrabold text-base tracking-tight leading-none">
                <span>{BRAND_ASSETS.APP_NAME}</span>
                <span className="text-[#FF5338]">
                  {BRAND_ASSETS.APP_SUFFIX}
                </span>
              </div>
              <div className="text-[11px] text-[#58524C] dark:text-[#A89F95] font-medium tracking-tight mt-0.5">
                {BRAND_ASSETS.TAGLINE}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleCollapse}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8C8379] hover:bg-[#F1EDE6] dark:hover:bg-[#2A2521] hover:text-[#1E1A17] dark:hover:text-[#FAF8F5] transition-colors cursor-pointer"
            title="Minimize Sidebar"
            aria-label="Minimize Sidebar"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M9 3v18" />
              <path d="m14 9-3 3 3 3" />
            </svg>
          </button>
        </div>
      )}

      {/* New Project CTA */}
      <div className={isCollapsed ? "p-2 flex justify-center" : "p-4 pb-2"}>
        <button
          type="button"
          onClick={onOpenNewProject}
          title="New Project"
          aria-label="New Project"
          className={
            isCollapsed
              ? "w-10 h-10 rounded-xl border border-[#E3DCD3] dark:border-[#3C3530] bg-white dark:bg-[#221E1A] hover:bg-[#F7F4EF] dark:hover:bg-[#2A2521] font-bold text-base text-[#FF5338] flex items-center justify-center shadow-xs transition-all active:scale-[0.98] cursor-pointer"
              : "w-full h-10 px-4 rounded-xl border border-[#E3DCD3] dark:border-[#3C3530] bg-white dark:bg-[#221E1A] hover:bg-[#F7F4EF] dark:hover:bg-[#2A2521] font-bold text-xs tracking-tight text-[#1E1A17] dark:text-[#FAF8F5] flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          }
        >
          <span className="text-[#FF5338] text-base leading-none font-black">
            +
          </span>
          {!isCollapsed && <span>New Project</span>}
        </button>
      </div>

      {/* Main Nav Items */}
      <div
        className={
          isCollapsed
            ? "px-2 py-2 space-y-1.5 flex flex-col items-center"
            : "px-3 py-2 space-y-1"
        }
      >
        {/* Global Vault */}
        <button
          type="button"
          onClick={() => onSelectNav("global")}
          title={`Global Vault (${totalInspirationsCount})`}
          aria-label="Global Vault"
          className={
            isCollapsed
              ? `w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  selectedProjectId === null && activeNav === "global"
                    ? "bg-[#FF5338] text-white shadow-sm"
                    : "text-[#1E1A17] dark:text-[#FAF8F5] hover:bg-[#F1EDE6] dark:hover:bg-[#2A2521]"
                }`
              : `w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs tracking-tight flex items-center justify-between transition-all cursor-pointer ${
                  selectedProjectId === null && activeNav === "global"
                    ? "bg-[#FF5338] text-white shadow-sm"
                    : "text-[#1E1A17] dark:text-[#FAF8F5] hover:bg-[#F1EDE6] dark:hover:bg-[#2A2521]"
                }`
          }
        >
          <div
            className={
              isCollapsed
                ? "flex items-center justify-center"
                : "flex items-center gap-2.5"
            }
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
            {!isCollapsed && <span>Global Vault</span>}
          </div>
          {!isCollapsed && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-grotesk ${
                selectedProjectId === null && activeNav === "global"
                  ? "bg-white/25 text-white"
                  : "bg-[#EBE5DC] dark:bg-[#322C28] text-[#58524C] dark:text-[#A89F95]"
              }`}
            >
              {totalInspirationsCount}
            </span>
          )}
        </button>

        {/* Projects */}
        <button
          type="button"
          onClick={() => onSelectNav("projects")}
          title={`Projects (${activeCount} active)`}
          aria-label="Projects"
          className={
            isCollapsed
              ? `w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  selectedProjectId === null &&
                  (activeNav === "projects" || activeNav === "active-projects")
                    ? "bg-[#F1EDE6] dark:bg-[#2A2521] text-[#1E1A17] dark:text-[#FAF8F5]"
                    : "text-[#58524C] dark:text-[#A89F95] hover:bg-[#F1EDE6]/70 dark:hover:bg-[#2A2521]"
                }`
              : `w-full text-left px-3.5 py-2 rounded-xl font-semibold text-xs tracking-tight flex items-center justify-between transition-colors cursor-pointer ${
                  selectedProjectId === null &&
                  (activeNav === "projects" || activeNav === "active-projects")
                    ? "bg-[#F1EDE6] dark:bg-[#2A2521] text-[#1E1A17] dark:text-[#FAF8F5]"
                    : "text-[#58524C] dark:text-[#A89F95] hover:bg-[#F1EDE6]/70 dark:hover:bg-[#2A2521]"
                }`
          }
        >
          <div
            className={
              isCollapsed
                ? "flex items-center justify-center"
                : "flex items-center gap-2.5"
            }
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
                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
              />
            </svg>
            {!isCollapsed && <span>Projects</span>}
          </div>
          {!isCollapsed && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold font-grotesk bg-[#EBE5DC] dark:bg-[#322C28] text-[#58524C] dark:text-[#A89F95]">
              {activeCount}
            </span>
          )}
        </button>

        {/* Competitor Spy */}
        <button
          type="button"
          onClick={() => onSelectNav("competitor-spy")}
          title="Competitor Spy"
          aria-label="Competitor Spy"
          className={
            isCollapsed
              ? `w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  selectedProjectId === null && activeNav === "competitor-spy"
                    ? "bg-[#F1EDE6] dark:bg-[#2A2521] text-[#1E1A17] dark:text-[#FAF8F5]"
                    : "text-[#58524C] dark:text-[#A89F95] hover:bg-[#F1EDE6]/70 dark:hover:bg-[#2A2521]"
                }`
              : `w-full text-left px-3.5 py-2 rounded-xl font-semibold text-xs tracking-tight flex items-center justify-between transition-colors cursor-pointer ${
                  selectedProjectId === null && activeNav === "competitor-spy"
                    ? "bg-[#F1EDE6] dark:bg-[#2A2521] text-[#1E1A17] dark:text-[#FAF8F5]"
                    : "text-[#58524C] dark:text-[#A89F95] hover:bg-[#F1EDE6]/70 dark:hover:bg-[#2A2521]"
                }`
          }
        >
          <div
            className={
              isCollapsed
                ? "flex items-center justify-center"
                : "flex items-center gap-2.5"
            }
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
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            {!isCollapsed && <span>Competitor Spy</span>}
          </div>
          <span className="w-2 h-2 rounded-full bg-[#FF8A00]" />
        </button>

        {/* Settings */}
        <button
          type="button"
          onClick={() => onSelectNav("settings")}
          title="Settings"
          aria-label="Settings"
          className={
            isCollapsed
              ? `w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  selectedProjectId === null && activeNav === "settings"
                    ? "bg-[#F1EDE6] dark:bg-[#2A2521] text-[#1E1A17] dark:text-[#FAF8F5]"
                    : "text-[#58524C] dark:text-[#A89F95] hover:bg-[#F1EDE6]/70 dark:hover:bg-[#2A2521]"
                }`
              : `w-full text-left px-3.5 py-2 rounded-xl font-semibold text-xs tracking-tight flex items-center gap-2.5 transition-colors cursor-pointer ${
                  selectedProjectId === null && activeNav === "settings"
                    ? "bg-[#F1EDE6] dark:bg-[#2A2521] text-[#1E1A17] dark:text-[#FAF8F5]"
                    : "text-[#58524C] dark:text-[#A89F95] hover:bg-[#F1EDE6]/70 dark:hover:bg-[#2A2521]"
                }`
          }
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
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {!isCollapsed && <span>Settings</span>}
        </button>
      </div>

      {/* Projects List Section */}
      <div className="flex-1 overflow-y-auto px-2 py-3 border-t border-[#E3DCD3]/70 dark:border-[#3C3530]/70">
        {!isCollapsed && (
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#8C8379]">
              PROJECTS ({activeCount})
            </span>
            <svg
              className="w-3.5 h-3.5 text-[#8C8379]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
          </div>
        )}

        <div
          className={
            isCollapsed
              ? "space-y-1.5 flex flex-col items-center"
              : "space-y-0.5"
          }
        >
          {sortedProjects.length === 0 ? (
            !isCollapsed ? (
              <div className="p-3 text-center rounded-xl bg-white/50 dark:bg-[#221E1A]/50 border border-dashed border-[#E3DCD3] dark:border-[#3C3530]">
                <p className="text-xs text-[#58524C] dark:text-[#A89F95]">
                  No projects added yet.
                </p>
                <button
                  type="button"
                  onClick={onOpenNewProject}
                  className="mt-2 text-xs font-bold text-[#FF5338] hover:underline cursor-pointer"
                >
                  + Create Project
                </button>
              </div>
            ) : null
          ) : (
            sortedProjects.map((proj, idx) => {
              const isSelected = selectedProjectId === proj.id;
              const isDone = proj.status === "DONE";
              const emoji = isDone
                ? "✓"
                : projectEmojis[idx % projectEmojis.length];
              const count = proj._count?.inspirations ?? 0;

              return (
                <button
                  key={proj.id}
                  type="button"
                  onClick={() => onSelectProject(proj.id)}
                  title={`${proj.name} ${isDone ? "(Completed)" : ""} (${count} inspirations)`}
                  aria-label={proj.name}
                  className={
                    isCollapsed
                      ? `w-10 h-10 rounded-xl text-xs font-bold tracking-tight flex items-center justify-center transition-all cursor-pointer ${
                          isDone ? "opacity-60 hover:opacity-100" : ""
                        } ${
                          isSelected
                            ? "bg-[#F1EDE6] dark:bg-[#2A2521] text-[#1E1A17] dark:text-[#FAF8F5] ring-2 ring-[#FF5338]/40 shadow-xs"
                            : "text-[#58524C] dark:text-[#A89F95] hover:bg-[#F1EDE6]/60 dark:hover:bg-[#2A2521]"
                        }`
                      : `w-full text-left px-3 py-2 rounded-xl text-xs font-bold tracking-tight flex items-center justify-between transition-all group cursor-pointer ${
                          isDone ? "opacity-60 hover:opacity-100" : ""
                        } ${
                          isSelected
                            ? "bg-[#F1EDE6] dark:bg-[#2A2521] text-[#1E1A17] dark:text-[#FAF8F5] shadow-xs"
                            : "text-[#58524C] dark:text-[#A89F95] hover:bg-[#F1EDE6]/60 dark:hover:bg-[#2A2521]"
                        }`
                  }
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span
                      className={`text-sm shrink-0 ${isDone ? "text-emerald-500 font-bold" : ""}`}
                    >
                      {emoji}
                    </span>
                    {!isCollapsed && (
                      <span className="truncate">{proj.name}</span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <span className="text-[11px] font-grotesk text-[#8C8379] shrink-0 font-semibold">
                      {count}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Instant AI Hook Breakdown Section */}
      {onAnalyzeUrl ? (
        <div className="p-3 border-t border-[#E3DCD3]/70 dark:border-[#3C3530]/70 mt-auto shrink-0 flex justify-center">
          {isCollapsed ? (
            <button
              type="button"
              onClick={onAnalyzeUrl}
              title="Instant AI Hook Breakdown (Analyze URL)"
              aria-label="Instant AI Hook Breakdown"
              className="w-10 h-10 rounded-xl bg-[#2D2824] dark:bg-[#221D19] border border-white/10 text-white flex items-center justify-center shadow-xs hover:bg-[#FF5338] transition-colors cursor-pointer"
            >
              <span className="text-[#FF8A00] text-base leading-none">✨</span>
            </button>
          ) : (
            <div className="w-full p-3.5 rounded-2xl bg-[#2D2824] dark:bg-[#221D19] text-white shadow-sm border border-white/10 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="text-[#FF8A00]">✨</span>
                <span className="tracking-tight text-white/95">
                  Instant AI Hook Breakdown ready
                </span>
              </div>
              <button
                type="button"
                onClick={onAnalyzeUrl}
                className="w-full h-8 rounded-xl bg-[#FF5338] hover:bg-[#d93820] text-white text-xs font-bold tactile-btn shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Analyze URL</span>
                <span className="text-xs">→</span>
              </button>
            </div>
          )}
        </div>
      ) : null}
    </aside>
  );
}

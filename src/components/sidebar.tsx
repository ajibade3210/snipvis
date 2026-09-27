"use client";

import { Button } from "@/components/ui/button";

export type NavView =
  | "global"
  | "active-projects"
  | "competitor-spy"
  | "settings";

interface SidebarProps {
  projects: Array<{
    id: string;
    name: string;
    slug?: string;
    channel?: string | null;
    _count?: { inspirations: number; assets: number };
  }>;
  totalInspirationsCount: number;
  activeNav: NavView;
  selectedProjectId: string | null;
  onSelectNav: (nav: NavView) => void;
  onSelectProject: (id: string | null) => void;
  onOpenNewProject: () => void;
}

export function Sidebar({
  projects,
  totalInspirationsCount,
  activeNav,
  selectedProjectId,
  onSelectNav,
  onSelectProject,
  onOpenNewProject,
}: SidebarProps) {
  // Pre-assigned emojis for projects to give that creator-lab energy
  const projectEmojis = ["🔥", "⚡", "💰", "🎬", "🚀", "🎯", "🧬", "🧠"];

  return (
    <aside className="w-full md:w-72 border-r border-[#E3DCD3] dark:border-[#3C3530] bg-[#FAF8F5] dark:bg-[#1A1613] flex flex-col h-[calc(100vh-65px)] sticky top-[65px] select-none text-[#1E1A17] dark:text-[#FAF8F5]">
      {/* Brand & Workspace Switcher */}
      <div className="p-4 border-b border-[#E3DCD3]/70 dark:border-[#3C3530]/70 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#FF5338] text-white flex items-center justify-center font-black text-xl shadow-xs">
            S
          </div>
          <div>
            <div className="flex items-center gap-1 font-extrabold text-base tracking-tight leading-none">
              <span>Snipvis</span>
              <span className="text-[#FF5338]">OS</span>
            </div>
            <div className="text-[11px] text-[#58524C] dark:text-[#A89F95] font-medium tracking-tight mt-0.5">
              Creator Research Lab
            </div>
          </div>
        </div>
        <button
          type="button"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8C8379] hover:bg-[#F1EDE6] dark:hover:bg-[#2A2521] transition-colors"
          title="Switch Workspace"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 9l4-4 4 4m0 6l-4 4-4-4"
            />
          </svg>
        </button>
      </div>

      {/* New Project CTA */}
      <div className="p-4 pb-2">
        <button
          type="button"
          onClick={onOpenNewProject}
          className="w-full h-10 px-4 rounded-xl border border-[#E3DCD3] dark:border-[#3C3530] bg-white dark:bg-[#221E1A] hover:bg-[#F7F4EF] dark:hover:bg-[#2A2521] font-bold text-xs tracking-tight text-[#1E1A17] dark:text-[#FAF8F5] flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98]"
        >
          <span className="text-[#FF5338] text-base leading-none font-black">
            +
          </span>
          <span>New Project</span>
        </button>
      </div>

      {/* Main Nav Items */}
      <div className="px-3 py-2 space-y-1">
        {/* Global Vault */}
        <button
          type="button"
          onClick={() => {
            onSelectNav("global");
          }}
          className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs tracking-tight flex items-center justify-between transition-all ${
            selectedProjectId === null && activeNav === "global"
              ? "bg-[#FF5338] text-white shadow-sm"
              : "text-[#1E1A17] dark:text-[#FAF8F5] hover:bg-[#F1EDE6] dark:hover:bg-[#2A2521]"
          }`}
        >
          <div className="flex items-center gap-2.5">
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
            <span>Global Vault</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-grotesk ${
              selectedProjectId === null && activeNav === "global"
                ? "bg-white/25 text-white"
                : "bg-[#EBE5DC] dark:bg-[#322C28] text-[#58524C] dark:text-[#A89F95]"
            }`}
          >
            {totalInspirationsCount}
          </span>
        </button>

        {/* Active Projects */}
        <button
          type="button"
          onClick={() => {
            onSelectNav("active-projects");
          }}
          className={`w-full text-left px-3.5 py-2 rounded-xl font-semibold text-xs tracking-tight flex items-center justify-between transition-colors ${
            selectedProjectId === null && activeNav === "active-projects"
              ? "bg-[#F1EDE6] dark:bg-[#2A2521] text-[#1E1A17] dark:text-[#FAF8F5]"
              : "text-[#58524C] dark:text-[#A89F95] hover:bg-[#F1EDE6]/70 dark:hover:bg-[#2A2521]"
          }`}
        >
          <div className="flex items-center gap-2.5">
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
            <span>Active Projects</span>
          </div>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold font-grotesk bg-[#EBE5DC] dark:bg-[#322C28] text-[#58524C] dark:text-[#A89F95]">
            {projects.length}
          </span>
        </button>

        {/* Competitor Spy */}
        <button
          type="button"
          onClick={() => {
            onSelectNav("competitor-spy");
          }}
          className={`w-full text-left px-3.5 py-2 rounded-xl font-semibold text-xs tracking-tight flex items-center justify-between transition-colors ${
            selectedProjectId === null && activeNav === "competitor-spy"
              ? "bg-[#F1EDE6] dark:bg-[#2A2521] text-[#1E1A17] dark:text-[#FAF8F5]"
              : "text-[#58524C] dark:text-[#A89F95] hover:bg-[#F1EDE6]/70 dark:hover:bg-[#2A2521]"
          }`}
        >
          <div className="flex items-center gap-2.5">
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
            <span>Competitor Spy</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-[#FF8A00]" />
        </button>

        {/* Settings */}
        <button
          type="button"
          onClick={() => {
            onSelectNav("settings");
          }}
          className={`w-full text-left px-3.5 py-2 rounded-xl font-semibold text-xs tracking-tight flex items-center gap-2.5 transition-colors ${
            selectedProjectId === null && activeNav === "settings"
              ? "bg-[#F1EDE6] dark:bg-[#2A2521] text-[#1E1A17] dark:text-[#FAF8F5]"
              : "text-[#58524C] dark:text-[#A89F95] hover:bg-[#F1EDE6]/70 dark:hover:bg-[#2A2521]"
          }`}
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
          <span>Settings</span>
        </button>
      </div>

      {/* Projects List Section */}
      <div className="flex-1 overflow-y-auto px-3 py-3 border-t border-[#E3DCD3]/70 dark:border-[#3C3530]/70">
        <div className="flex items-center justify-between px-3 mb-2">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#8C8379]">
            PROJECTS ({projects.length})
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

        <div className="space-y-0.5">
          {projects.length === 0 ? (
            <div className="p-3 text-center rounded-xl bg-white/50 dark:bg-[#221E1A]/50 border border-dashed border-[#E3DCD3] dark:border-[#3C3530]">
              <p className="text-xs text-[#58524C] dark:text-[#A89F95]">
                No projects added yet.
              </p>
              <button
                type="button"
                onClick={onOpenNewProject}
                className="mt-2 text-xs font-bold text-[#FF5338] hover:underline"
              >
                + Create Project
              </button>
            </div>
          ) : (
            projects.map((proj, idx) => {
              const isSelected = selectedProjectId === proj.id;
              const emoji = projectEmojis[idx % projectEmojis.length];
              const count = proj._count?.inspirations ?? 0;

              return (
                <button
                  key={proj.id}
                  type="button"
                  onClick={() => {
                    onSelectProject(proj.id);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold tracking-tight flex items-center justify-between transition-all group ${
                    isSelected
                      ? "bg-[#F1EDE6] dark:bg-[#2A2521] text-[#1E1A17] dark:text-[#FAF8F5] shadow-xs"
                      : "text-[#58524C] dark:text-[#A89F95] hover:bg-[#F1EDE6]/60 dark:hover:bg-[#2A2521]"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="text-sm shrink-0">{emoji}</span>
                    <span className="truncate">{proj.name}</span>
                  </div>
                  <span className="text-[11px] font-grotesk text-[#8C8379] shrink-0 font-semibold">
                    {count}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}

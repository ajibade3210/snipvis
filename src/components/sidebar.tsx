"use client";

import { useChannels } from "@/hooks/use-channels";
import { BRAND_ASSETS, STORAGE_KEYS } from "@/lib/constants";
import type { NavView } from "@/types";
import type { ChannelRecord } from "@/types/channel";
import { useEffect, useState } from "react";

interface SidebarProps {
  projects: Array<{
    id: string;
    name: string;
    slug?: string;
    emoji?: string | null;
    channel?: ChannelRecord | string | null;
    status?: "ACTIVE" | "DONE";
    updatedAt?: string | Date;
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
  const { data: channels = [] } = useChannels();

  // Active state for top navigation buttons
  const isGlobalActive = selectedProjectId === null && activeNav === "global";
  const isProjectsActive =
    selectedProjectId === null &&
    (activeNav === "projects" || activeNav === "active-projects");
  const isChannelsActive =
    selectedProjectId === null && activeNav === "channels";
  const isCompetitorSpyActive =
    selectedProjectId === null && activeNav === "competitor-spy";
  const isSettingsActive =
    selectedProjectId === null && activeNav === "settings";

  // Top 4 active projects sorted by last updated
  const topActiveProjects = projects
    .filter((p) => p.status !== "DONE")
    .sort((a, b) => {
      const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return timeB - timeA;
    })
    .slice(0, 4);

  const activeProjectsCount = projects.filter(
    (p) => p.status !== "DONE",
  ).length;

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

  return (
    <aside
      className={`border-r border-black/[0.05] dark:border-white/[0.06] bg-[#FAF8F5] dark:bg-[#171412] flex flex-col h-[calc(100vh-65px)] sticky top-[65px] select-none text-[#1E1A17] dark:text-[#FAF8F5] transition-all duration-200 shrink-0 ${
        isCollapsed ? "w-full md:w-[68px]" : "w-full md:w-72"
      }`}
    >
      {/* Brand & Minimize / Expand Action Header */}
      {isCollapsed ? (
        <div className="p-3 border-b border-black/[0.05] dark:border-white/[0.06] flex flex-col items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white dark:bg-[#201C18] border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center shrink-0 shadow-xs">
            <img
              src={BRAND_ASSETS.LOGO}
              alt={`${BRAND_ASSETS.APP_NAME} ${BRAND_ASSETS.APP_SUFFIX}`}
              className="w-full h-full object-contain"
            />
          </div>
          <button
            type="button"
            onClick={toggleCollapse}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8C8379] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] hover:text-[#1E1A17] dark:hover:text-[#FAF8F5] transition-colors cursor-pointer"
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
        <div className="p-4 border-b border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white dark:bg-[#201C18] border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center shrink-0 shadow-xs">
              <img
                src={BRAND_ASSETS.LOGO}
                alt={`${BRAND_ASSETS.APP_NAME} ${BRAND_ASSETS.APP_SUFFIX}`}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1 font-extrabold text-sm tracking-tight leading-none">
                <span>{BRAND_ASSETS.APP_NAME}</span>
                <span className="text-[#FF5338]">
                  {BRAND_ASSETS.APP_SUFFIX}
                </span>
              </div>
              <div className="text-[11px] text-[#8C8379] font-medium tracking-tight mt-0.5">
                {BRAND_ASSETS.TAGLINE}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleCollapse}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8C8379] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] hover:text-[#1E1A17] dark:hover:text-[#FAF8F5] transition-colors cursor-pointer"
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
      <div className={isCollapsed ? "p-2 flex justify-center" : "p-3 pb-1"}>
        <button
          type="button"
          onClick={onOpenNewProject}
          title="New Project"
          aria-label="New Project"
          className={
            isCollapsed
              ? "w-10 h-10 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#201C18] hover:bg-black/[0.02] dark:hover:bg-white/[0.03] font-bold text-base text-[#FF5338] flex items-center justify-center shadow-xs transition-all active:scale-[0.98] cursor-pointer"
              : "w-full h-9 px-3.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#201C18] hover:bg-black/[0.02] dark:hover:bg-white/[0.03] font-semibold text-xs tracking-tight text-[#1E1A17] dark:text-[#FAF8F5] flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          }
        >
          <span className="text-[#FF5338] text-sm leading-none font-bold">
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
                    ? "bg-[#FF5338] text-white shadow-xs font-semibold"
                    : "text-[#58524C] dark:text-[#A89F95] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] hover:text-[#1E1A17] dark:hover:text-[#FAF8F5]"
                }`
              : `w-full text-left px-3 py-2 rounded-xl text-xs tracking-tight flex items-center justify-between transition-all cursor-pointer ${
                  selectedProjectId === null && activeNav === "global"
                    ? "bg-[#FF5338] text-white shadow-xs font-semibold"
                    : "text-[#58524C] dark:text-[#A89F95] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] hover:text-[#1E1A17] dark:hover:text-[#FAF8F5] font-medium"
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
                  ? "bg-white/20 text-white"
                  : "bg-black/[0.04] dark:bg-white/[0.06] text-[#8C8379]"
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
          title={`Projects (${activeProjectsCount} active)`}
          aria-label="Projects"
          className={
            isCollapsed
              ? `w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  isProjectsActive
                    ? "bg-[#FF5338] text-white shadow-xs font-semibold"
                    : "text-[#58524C] dark:text-[#A89F95] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] hover:text-[#1E1A17] dark:hover:text-[#FAF8F5]"
                }`
              : `w-full text-left px-3 py-2 rounded-xl text-xs tracking-tight flex items-center justify-between transition-all cursor-pointer ${
                  isProjectsActive
                    ? "bg-[#FF5338] text-white shadow-xs font-semibold"
                    : "text-[#58524C] dark:text-[#A89F95] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] hover:text-[#1E1A17] dark:hover:text-[#FAF8F5] font-medium"
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
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold font-grotesk ${
                isProjectsActive
                  ? "bg-white/20 text-white"
                  : "bg-black/[0.04] dark:bg-white/[0.06] text-[#8C8379]"
              }`}
            >
              {activeProjectsCount}
            </span>
          )}
        </button>

        {/* Channels */}
        <button
          type="button"
          onClick={() => onSelectNav("channels")}
          title={`Channels (${channels.length})`}
          aria-label="Channels"
          className={
            isCollapsed
              ? `w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  isChannelsActive
                    ? "bg-[#FF5338] text-white shadow-xs font-semibold"
                    : "text-[#58524C] dark:text-[#A89F95] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] hover:text-[#1E1A17] dark:hover:text-[#FAF8F5]"
                }`
              : `w-full text-left px-3 py-2 rounded-xl text-xs tracking-tight flex items-center justify-between transition-all cursor-pointer ${
                  isChannelsActive
                    ? "bg-[#FF5338] text-white shadow-xs font-semibold"
                    : "text-[#58524C] dark:text-[#A89F95] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] hover:text-[#1E1A17] dark:hover:text-[#FAF8F5] font-medium"
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
              <rect width="20" height="15" x="2" y="7" rx="2" ry="2" />
              <polyline points="17 2 12 7 7 2" />
            </svg>
            {!isCollapsed && <span>Channels</span>}
          </div>
          {!isCollapsed && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold font-grotesk ${
                isChannelsActive
                  ? "bg-white/20 text-white"
                  : "bg-black/[0.04] dark:bg-white/[0.06] text-[#8C8379]"
              }`}
            >
              {channels.length}
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
                  isCompetitorSpyActive
                    ? "bg-[#FF5338] text-white shadow-xs font-semibold"
                    : "text-[#58524C] dark:text-[#A89F95] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] hover:text-[#1E1A17] dark:hover:text-[#FAF8F5]"
                }`
              : `w-full text-left px-3 py-2 rounded-xl text-xs tracking-tight flex items-center justify-between transition-all cursor-pointer ${
                  isCompetitorSpyActive
                    ? "bg-[#FF5338] text-white shadow-xs font-semibold"
                    : "text-[#58524C] dark:text-[#A89F95] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] hover:text-[#1E1A17] dark:hover:text-[#FAF8F5] font-medium"
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
          <span
            className={`w-2 h-2 rounded-full ${
              isCompetitorSpyActive ? "bg-white" : "bg-[#FF8A00]"
            }`}
          />
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
                  isSettingsActive
                    ? "bg-[#FF5338] text-white shadow-xs font-semibold"
                    : "text-[#58524C] dark:text-[#A89F95] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] hover:text-[#1E1A17] dark:hover:text-[#FAF8F5]"
                }`
              : `w-full text-left px-3 py-2 rounded-xl text-xs tracking-tight flex items-center gap-2.5 transition-all cursor-pointer ${
                  isSettingsActive
                    ? "bg-[#FF5338] text-white shadow-xs font-semibold"
                    : "text-[#58524C] dark:text-[#A89F95] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] hover:text-[#1E1A17] dark:hover:text-[#FAF8F5] font-medium"
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
      <div className="flex-1 overflow-y-auto px-2 py-3 border-t border-black/[0.05] dark:border-white/[0.06]">
        {!isCollapsed && (
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#8C8379]">
              PROJECTS ({topActiveProjects.length})
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
          {topActiveProjects.length === 0 ? (
            !isCollapsed ? (
              <div className="p-3 text-center rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-dashed border-black/[0.08] dark:border-white/[0.08]">
                <p className="text-xs text-[#8C8379]">No active projects.</p>
                <button
                  type="button"
                  onClick={onOpenNewProject}
                  className="mt-2 text-xs font-semibold text-[#FF5338] hover:underline cursor-pointer"
                >
                  + Create Project
                </button>
              </div>
            ) : null
          ) : (
            topActiveProjects.map((proj) => {
              const isSelected = selectedProjectId === proj.id;

              return (
                <button
                  key={proj.id}
                  type="button"
                  onClick={() => onSelectProject(proj.id)}
                  title={proj.name}
                  aria-label={proj.name}
                  className={
                    isCollapsed
                      ? `w-10 h-10 rounded-xl text-xs font-medium tracking-tight flex items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-black/[0.06] dark:bg-white/[0.08] text-[#1E1A17] dark:text-[#FAF8F5] ring-1 ring-[#FF5338]/40 shadow-xs"
                            : "text-[#58524C] dark:text-[#A89F95] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                        }`
                      : `w-full text-left px-3 py-2 rounded-xl text-xs tracking-tight flex items-center justify-between transition-all group cursor-pointer ${
                          isSelected
                            ? "bg-black/[0.06] dark:bg-white/[0.08] text-[#1E1A17] dark:text-[#FAF8F5] font-semibold shadow-xs"
                            : "text-[#58524C] dark:text-[#A89F95] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] font-medium"
                        }`
                  }
                >
                  <div
                    className={
                      isCollapsed
                        ? "flex items-center justify-center"
                        : "flex items-center gap-2 truncate pr-2"
                    }
                  >
                    {proj.emoji ? (
                      <span className="text-sm shrink-0">{proj.emoji}</span>
                    ) : (
                      <svg
                        className="w-3.5 h-3.5 text-[#8C8379] shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                        />
                      </svg>
                    )}
                    {!isCollapsed && (
                      <span className="truncate">{proj.name}</span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Instant AI Hook Breakdown Section */}
      {onAnalyzeUrl ? (
        <div className="p-3 border-t border-black/[0.05] dark:border-white/[0.06] mt-auto shrink-0 flex justify-center">
          {isCollapsed ? (
            <button
              type="button"
              onClick={onAnalyzeUrl}
              title="Instant AI Hook Breakdown (Analyze URL)"
              aria-label="Instant AI Hook Breakdown"
              className="w-10 h-10 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] text-[#1E1A17] dark:text-[#FAF8F5] flex items-center justify-center shadow-xs hover:bg-[#FF5338] hover:text-white transition-colors cursor-pointer"
            >
              <span className="text-[#FF8A00] text-base leading-none">✨</span>
            </button>
          ) : (
            <div className="w-full p-3 rounded-2xl bg-black/[0.025] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1E1A17] dark:text-[#FAF8F5]">
                <span className="text-[#FF8A00]">✨</span>
                <span className="tracking-tight">
                  Instant AI Hook Breakdown
                </span>
              </div>
              <button
                type="button"
                onClick={onAnalyzeUrl}
                className="w-full h-8 rounded-xl bg-[#FF5338] hover:bg-[#d93820] text-white text-xs font-semibold shadow-xs transition-transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
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

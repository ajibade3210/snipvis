"use client";

import type { NavView } from "@/types";

interface MobileNavProps {
  activeNav: NavView;
  selectedProjectId: string | null;
  onSelectNav: (nav: NavView) => void;
  onOpenAddInspiration: () => void;
}

export function MobileNav({
  activeNav,
  selectedProjectId,
  onSelectNav,
  onOpenAddInspiration,
}: MobileNavProps) {
  const isVaultActive = selectedProjectId === null && activeNav === "global";
  const isProjectsActive =
    selectedProjectId !== null ||
    activeNav === "projects" ||
    activeNav === "active-projects";
  const isChannelsActive =
    selectedProjectId === null && activeNav === "channels";
  const isCompetitorActive =
    selectedProjectId === null && activeNav === "competitor-spy";

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 dark:bg-[#171412]/95 backdrop-blur-md border-t border-black/[0.06] dark:border-white/[0.08] md:hidden px-2 py-1.5 flex items-center justify-around select-none"
    >
      {/* Vault */}
      <button
        type="button"
        onClick={() => onSelectNav("global")}
        className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 text-[10px] font-medium transition-colors cursor-pointer ${
          isVaultActive
            ? "text-[#FF5338] font-bold"
            : "text-[#8C8379] hover:text-[#1E1A17] dark:hover:text-[#FAF8F5]"
        }`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={isVaultActive ? "2.5" : "2"}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
        <span>Vault</span>
      </button>

      {/* Projects */}
      <button
        type="button"
        onClick={() => onSelectNav("projects")}
        className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 text-[10px] font-medium transition-colors cursor-pointer ${
          isProjectsActive
            ? "text-[#FF5338] font-bold"
            : "text-[#8C8379] hover:text-[#1E1A17] dark:hover:text-[#FAF8F5]"
        }`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={isProjectsActive ? "2.5" : "2"}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
          />
        </svg>
        <span>Projects</span>
      </button>

      {/* Quick-Capture Center Button */}
      <div className="flex flex-col items-center justify-center flex-1 -mt-4">
        <button
          type="button"
          onClick={onOpenAddInspiration}
          title="Capture Inspiration"
          aria-label="Capture Inspiration"
          className="w-11 h-11 rounded-full bg-[#FF5338] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform border-2 border-[#FAF8F5] dark:border-[#171412] cursor-pointer"
        >
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
        </button>
        <span className="text-[9px] font-bold text-[#FF5338] mt-0.5">
          Capture
        </span>
      </div>

      {/* Channels */}
      <button
        type="button"
        onClick={() => onSelectNav("channels")}
        className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 text-[10px] font-medium transition-colors cursor-pointer ${
          isChannelsActive
            ? "text-[#FF5338] font-bold"
            : "text-[#8C8379] hover:text-[#1E1A17] dark:hover:text-[#FAF8F5]"
        }`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={isChannelsActive ? "2.5" : "2"}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        <span>Channels</span>
      </button>

      {/* Competitor Radar */}
      <button
        type="button"
        onClick={() => onSelectNav("competitor-spy")}
        className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 text-[10px] font-medium transition-colors cursor-pointer ${
          isCompetitorActive
            ? "text-[#FF5338] font-bold"
            : "text-[#8C8379] hover:text-[#1E1A17] dark:hover:text-[#FAF8F5]"
        }`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={isCompetitorActive ? "2.5" : "2"}
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
        <span>Radar</span>
      </button>
    </nav>
  );
}

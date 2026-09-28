"use client";

import { useUserProfile } from "@/hooks/use-settings";
import { useTheme } from "@/lib/theme-provider";
import type { RefObject } from "react";

interface TopHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  searchInputRef: RefObject<HTMLInputElement>;
  itemCount: number;
  onOpenQuickCapture: () => void;
  onOpenAddInspiration: () => void;
  onOpenSettings?: () => void;
}

export function TopHeader({
  searchQuery,
  onSearchChange,
  onSearchKeyDown,
  searchInputRef,
  itemCount,
  onOpenQuickCapture,
  onOpenAddInspiration,
  onOpenSettings,
}: TopHeaderProps) {
  const { theme, toggle } = useTheme();
  const { data: userProfile } = useUserProfile();

  return (
    <header className="h-[65px] border-b border-[#E3DCD3] dark:border-[#3C3530] bg-[#FAF8F5]/95 dark:bg-[#171412]/95 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between gap-4">
      {/* Search Capsule */}
      <div className="flex-1 max-w-2xl relative flex items-center">
        <svg
          className="w-4 h-4 text-[#8C8379] absolute left-4.5 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={searchInputRef}
          type="text"
          placeholder={`Paste YouTube video URL or search across ${itemCount} items...`}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={onSearchKeyDown}
          className="w-full h-11 pl-11 pr-14 text-xs font-medium rounded-full border border-[#E3DCD3] dark:border-[#3C3530] bg-white dark:bg-[#221E1A] text-[#1E1A17] dark:text-[#FAF8F5] placeholder-[#8C8379] focus:outline-none focus:ring-2 focus:ring-[#FF5338] shadow-xs"
        />
        <kbd className="absolute right-4 px-2 py-0.5 text-[10px] font-grotesk font-bold rounded bg-[#F1EDE6] dark:bg-[#2A2521] text-[#8C8379] border border-[#E3DCD3] dark:border-[#3C3530] pointer-events-none">
          ⌘K
        </kbd>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onOpenQuickCapture}
          className="h-10 px-4 rounded-full border border-[#E3DCD3] dark:border-[#3C3530] bg-white dark:bg-[#221E1A] hover:bg-[#F7F4EF] dark:hover:bg-[#2A2521] text-xs font-bold text-[#1E1A17] dark:text-[#FAF8F5] flex items-center gap-1.5 shadow-xs transition-transform active:scale-[0.98]"
        >
          <span className="text-[#FF8A00] text-sm">⚡</span>
          <span>Quick Capture</span>
          <kbd className="ml-0.5 px-1.5 py-0.2 text-[10px] font-grotesk font-bold rounded bg-[#F1EDE6] dark:bg-[#2A2521] text-[#8C8379]">
            N
          </kbd>
        </button>

        <button
          type="button"
          onClick={onOpenAddInspiration}
          className="h-10 px-5 rounded-full bg-[#FF5338] text-white text-xs font-bold flex items-center gap-1.5 tactile-btn shadow-sm hover:bg-[#d93820]"
        >
          <span className="text-base font-black leading-none">+</span>
          <span>Add Inspiration</span>
        </button>

        <div className="h-6 w-px bg-[#E3DCD3] dark:bg-[#3C3530] mx-1" />

        <button
          type="button"
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#58524C] dark:text-[#A89F95] hover:bg-[#F1EDE6] dark:hover:bg-[#2A2521] relative transition-colors"
          title="Notifications"
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
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="w-2 h-2 rounded-full bg-[#FF5338] absolute top-2 right-2 border-2 border-[#FAF8F5] dark:border-[#171412]" />
        </button>

        <button
          type="button"
          onClick={toggle}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#58524C] dark:text-[#A89F95] hover:bg-[#F1EDE6] dark:hover:bg-[#2A2521] transition-colors"
          title="Toggle Theme"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          title="Creator Profile & Settings"
          className="w-8 h-8 rounded-full overflow-hidden border border-[#E3DCD3] dark:border-[#3C3530] shadow-xs cursor-pointer flex items-center justify-center bg-[#F1EDE6] dark:bg-[#2A2521] transition-transform active:scale-95"
        >
          {userProfile?.avatarUrl ? (
            <img
              src={userProfile.avatarUrl}
              alt={userProfile.name || "Profile"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[11px] font-black font-grotesk text-[#FF5338]">
              {userProfile?.name
                ? userProfile.name.slice(0, 2).toUpperCase()
                : "SV"}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

"use client";

import { useUserProfile } from "@/hooks/use-settings";
import { AUTH_ROUTES } from "@/lib/constants";
import { useTheme } from "@/lib/theme-provider";
import { useQueryClient } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import { type RefObject, useEffect, useRef, useState } from "react";

interface TopHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  searchInputRef: RefObject<HTMLInputElement>;
  itemCount: number;
  onOpenAddInspiration: () => void;
  onOpenSettings?: () => void;
  onToggleMobileMenu?: () => void;
}

export function TopHeader({
  searchQuery,
  onSearchChange,
  onSearchKeyDown,
  searchInputRef,
  itemCount,
  onOpenAddInspiration,
  onOpenSettings,
  onToggleMobileMenu,
}: TopHeaderProps) {
  const { theme, toggle } = useTheme();
  const { data: userProfile } = useUserProfile();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    queryClient.clear();
    await signOut({ redirect: false });
    window.location.href = AUTH_ROUTES.SIGN_IN;
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-[65px] border-b border-black/[0.05] dark:border-white/[0.06] bg-[#FAF8F5] dark:bg-[#171412] sticky top-0 z-40 px-3 sm:px-6 flex items-center justify-between gap-2.5 sm:gap-4">
      {/* Mobile Hamburger Button */}
      {onToggleMobileMenu && (
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-[#58524C] dark:text-[#A89F95] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors cursor-pointer shrink-0"
          aria-label="Open navigation menu"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
      )}

      {/* Search Capsule */}
      <div className="flex-1 max-w-2xl relative flex items-center min-w-0">
        <svg
          className="w-4 h-4 text-[#8C8379] absolute left-3.5 pointer-events-none"
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
          placeholder={`Search ${itemCount} items...`}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={onSearchKeyDown}
          className="w-full h-10 pl-9 pr-10 sm:pr-14 text-xs font-medium rounded-full border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.025] dark:bg-white/[0.03] text-[#1E1A17] dark:text-[#FAF8F5] placeholder-[#8C8379] focus:outline-none focus:bg-white dark:focus:bg-[#201C18] focus:border-[#FF5338]/40 focus:ring-2 focus:ring-[#FF5338]/15 transition-all shadow-xs"
        />
        <kbd className="hidden sm:inline-block absolute right-3.5 px-1.5 py-0.5 text-[10px] font-mono font-medium rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-[#8C8379] border border-black/[0.04] dark:border-white/[0.06] pointer-events-none">
          ⌘K
        </kbd>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          type="button"
          onClick={onOpenAddInspiration}
          className="hidden sm:flex h-9 px-4 rounded-full bg-[#FF5338] text-white text-xs font-bold items-center gap-1.5 shadow-sm hover:bg-[#d93820] active:scale-95 transition-all cursor-pointer"
        >
          <span className="text-sm leading-none font-bold">+</span>
          <span>Add Inspiration</span>
        </button>

        <div className="hidden sm:block h-5 w-px bg-black/[0.06] dark:bg-white/[0.08] mx-1" />

        <button
          type="button"
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#58524C] dark:text-[#A89F95] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] relative transition-colors cursor-pointer"
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
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#58524C] dark:text-[#A89F95] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
          title={
            theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
          }
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? (
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="4" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
              />
            </svg>
          ) : (
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
                d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
              />
            </svg>
          )}
        </button>

        {/* Profile Avatar + Dropdown */}
        <div ref={menuRef} className="relative">
          <button
            type="button"
            id="profile-menu-trigger"
            onClick={() => setMenuOpen((prev) => !prev)}
            title={
              userProfile?.email
                ? `${userProfile.name || "Creator"} (${userProfile.email})`
                : "Creator Profile & Settings"
            }
            className="w-8 h-8 rounded-full overflow-hidden border border-black/[0.08] dark:border-white/[0.1] shadow-xs cursor-pointer flex items-center justify-center bg-black/[0.03] dark:bg-white/[0.05] transition-transform active:scale-95"
          >
            {userProfile?.avatarUrl ? (
              <img
                src={userProfile.avatarUrl}
                alt={userProfile.name || "Profile"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[11px] font-bold text-[#FF5338]">
                {userProfile?.name
                  ? userProfile.name.slice(0, 2).toUpperCase()
                  : userProfile?.email
                    ? userProfile.email.slice(0, 2).toUpperCase()
                    : "SV"}
              </span>
            )}
          </button>

          {menuOpen && (
            <div
              id="profile-dropdown"
              className="absolute right-0 top-10 w-56 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-[#FCFAF7] dark:bg-[#1C1815] shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
            >
              {/* User info header */}
              <div className="px-3.5 py-2.5 border-b border-black/[0.04] dark:border-white/[0.05]">
                <p className="text-xs font-bold text-[#1E1A17] dark:text-[#FAF8F5] truncate">
                  {userProfile?.name || "Creator"}
                </p>
                <p className="text-[11px] text-[#8C8379] truncate mt-0.5">
                  {userProfile?.email}
                </p>
              </div>

              {/* Settings */}
              <div className="p-1 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenSettings?.();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#1E1A17] dark:text-[#FAF8F5] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors text-left cursor-pointer"
                >
                  <svg
                    className="w-3.5 h-3.5 opacity-60"
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
                  Settings
                </button>

                {/* Sign Out */}
                <button
                  type="button"
                  id="sign-out-btn"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#FF5338] hover:bg-[#FF5338]/10 transition-colors text-left cursor-pointer"
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
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

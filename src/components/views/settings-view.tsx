"use client";

import { useUpdateUserProfile, useUserProfile } from "@/hooks/use-settings";
import { useTheme } from "@/lib/theme-provider";
import { mediaService } from "@/services/api/media.service";
import type { InspirationRecord, ProjectRecord } from "@/types";
import { useEffect, useRef, useState } from "react";

interface SettingsViewProps {
  inspirations: InspirationRecord[];
  projects: ProjectRecord[];
}

export function SettingsView({ inspirations, projects }: SettingsViewProps) {
  const { theme, toggle, resetToDefault } = useTheme();

  const { data: userProfile } = useUserProfile();
  const updateProfileMutation = useUpdateUserProfile();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (userProfile?.name) {
      setName(userProfile.name);
    }
  }, [userProfile]);

  const handleAvatarFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileFeedback({
        type: "error",
        text: "Please select an image file (PNG, JPG, WebP)",
      });
      return;
    }

    setIsUploadingAvatar(true);
    setProfileFeedback(null);

    try {
      const uploadRes = await mediaService.uploadMediaFile(file, {
        category: "avatars",
      });

      await updateProfileMutation.mutateAsync({
        avatarUrl: uploadRes.publicUrl,
      });

      setProfileFeedback({
        type: "success",
        text: "Profile picture updated successfully!",
      });
      setTimeout(() => setProfileFeedback(null), 3000);
    } catch (err: unknown) {
      setProfileFeedback({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Failed to upload profile picture",
      });
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileFeedback(null);

    try {
      await updateProfileMutation.mutateAsync({
        name: name.trim() || null,
      });
      setProfileFeedback({
        type: "success",
        text: "Creator profile saved!",
      });
      setTimeout(() => setProfileFeedback(null), 3000);
    } catch (err: unknown) {
      setProfileFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update profile",
      });
    }
  };

  const handleExportData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      projects,
      inspirations,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `snipvis-os-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="border-b border-black/[0.06] dark:border-white/[0.06] pb-5">
        <h2 className="text-xl font-bold tracking-tight text-[#1C1815] dark:text-[#FBF9F5]">
          Settings
        </h2>
        <p className="text-xs text-[#8C827A] dark:text-[#A89F97] mt-1">
          Manage your workspace preferences, creator identity, and backup data.
        </p>
      </div>

      <div className="space-y-6">
        {/* Creator Profile Section (Profile Picture + Name) */}
        <div className="bg-white dark:bg-[#1E1A17] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-[#1C1815] dark:text-[#FBF9F5]">
              Creator Identity & Avatar
            </h3>
            {profileFeedback && (
              <span
                className={`text-[11px] px-3 py-1 rounded-full font-medium ${
                  profileFeedback.type === "success"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                }`}
              >
                {profileFeedback.text}
              </span>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarFileChange}
            className="hidden"
          />

          <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-1">
            {/* Clickable Avatar Circle */}
            <div className="relative group shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-full overflow-hidden border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.025] dark:bg-white/[0.025] shadow-sm cursor-pointer relative block p-0 transition-transform active:scale-95"
              >
                {userProfile?.avatarUrl ? (
                  <img
                    src={userProfile.avatarUrl}
                    alt="Creator Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-xl text-[#FF5338] bg-gradient-to-br from-[#FFEBE7] to-[#F1EDE6] dark:from-[#2A2521] dark:to-[#1E1A17]">
                    {name ? name.slice(0, 2).toUpperCase() : "SV"}
                  </div>
                )}

                {/* Hover overlay with camera icon */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-medium gap-1">
                  <span>📷</span>
                  <span>{isUploadingAvatar ? "Uploading..." : "Change"}</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="mt-2 text-[11px] font-medium text-[#FF5338] hover:underline block sm:hidden cursor-pointer"
              >
                Change Photo
              </button>
            </div>

            {/* Profile Name Form */}
            <form
              onSubmit={handleSaveProfile}
              className="flex-1 flex flex-col sm:flex-row items-start sm:items-end gap-3"
            >
              <div className="w-full sm:max-w-md space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#8C827A] dark:text-[#A89F97]">
                    Display Name / Channel Handle
                  </label>
                  {userProfile?.email && (
                    <span className="text-[11px] font-mono text-[#8C827A]">
                      {userProfile.email}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="e.g. Jack Neel, TechCraft"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3.5 text-xs font-medium rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.025] dark:bg-white/[0.025] text-[#1C1815] dark:text-white placeholder:text-[#A89F97] focus:outline-none focus:border-[#FF5338] transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="h-10 px-5 rounded-full bg-[#1C1815] dark:bg-[#FAF8F5] hover:bg-[#2C2622] dark:hover:bg-[#EBE5DC] text-white dark:text-[#1C1815] text-xs font-semibold shadow-sm transition-all active:scale-[0.98] cursor-pointer shrink-0"
              >
                Save Profile
              </button>
            </form>
          </div>
        </div>

        {/* Theme & Data Backup */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#1E1A17] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-6 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-sm text-[#1C1815] dark:text-[#FBF9F5]">
                Theme Appearance
              </h3>
              <p className="text-xs text-[#8C827A] dark:text-[#A89F97] mt-1">
                Toggle between Creator Paper (Light) and Dark Studio mode.
              </p>
            </div>
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={toggle}
                className="w-full h-10 px-4 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] text-xs font-semibold text-[#1C1815] dark:text-[#FBF9F5] flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>
                  Current Theme: {theme === "dark" ? "Dark Mode" : "Light Mode"}
                </span>
                <span>
                  {theme === "dark" ? "☀️ Switch to Light" : "🌙 Switch to Dark"}
                </span>
              </button>
              <button
                type="button"
                onClick={resetToDefault}
                className="text-[11px] font-medium text-[#8C827A] dark:text-[#A89F97] hover:text-[#1C1815] dark:hover:text-white transition-colors underline cursor-pointer"
              >
                Reset to System Preference (Clear saved theme)
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E1A17] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-6 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-sm text-[#1C1815] dark:text-[#FBF9F5]">
                Export Research Vault
              </h3>
              <p className="text-xs text-[#8C827A] dark:text-[#A89F97] mt-1">
                Download a complete JSON backup of all projects, briefs, hooks,
                and swipe cards.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportData}
              className="h-10 px-4 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] text-xs font-semibold text-[#1C1815] dark:text-[#FBF9F5] flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              <span>💾</span>
              <span>Export Library (JSON)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

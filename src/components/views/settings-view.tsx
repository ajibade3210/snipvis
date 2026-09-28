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
      <div className="border-b border-[#E3DCD3] dark:border-[#3C3530] pb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-extrabold tracking-tight text-[#1E1A17] dark:text-[#FAF8F5]">
            ⚙️ Settings & Creator Profile
          </h2>
        </div>
        <p className="text-xs text-[#58524C] dark:text-[#A89F95] font-medium mt-1">
          Customize your channel profile, appearance, backups, and demo content.
        </p>
      </div>

      <div className="space-y-6">
        {/* Creator Profile Section (Profile Picture + Name) */}
        <div className="bg-white dark:bg-[#1E1A17] rounded-2xl border border-[#E3DCD3] dark:border-[#3C3530] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#1E1A17] dark:text-[#FAF8F5]">
              Creator Identity & Avatar
            </h3>
            {profileFeedback && (
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
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

          <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-2">
            {/* Clickable Avatar Circle */}
            <div className="relative group shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#E3DCD3] dark:border-[#3C3530] bg-[#F1EDE6] dark:bg-[#2A2521] shadow-sm cursor-pointer relative block p-0"
              >
                {userProfile?.avatarUrl ? (
                  <img
                    src={userProfile.avatarUrl}
                    alt="Creator Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black text-xl text-[#FF5338] bg-gradient-to-br from-[#FFEBE7] to-[#F1EDE6] dark:from-[#2A2521] dark:to-[#1E1A17]">
                    {name ? name.slice(0, 2).toUpperCase() : "SV"}
                  </div>
                )}

                {/* Hover overlay with camera icon */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1">
                  <span>📷</span>
                  <span>{isUploadingAvatar ? "Uploading..." : "Change"}</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="mt-2 text-[11px] font-bold text-[#FF5338] hover:underline block sm:hidden cursor-pointer"
              >
                Change Photo
              </button>
            </div>

            {/* Profile Name Form */}
            <form
              onSubmit={handleSaveProfile}
              className="flex-1 flex flex-col sm:flex-row items-start sm:items-end gap-3"
            >
              <div className="w-full sm:max-w-md space-y-1">
                <label className="text-xs font-bold text-[#58524C] dark:text-[#A89F95]">
                  Display Name / Channel Handle
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jack Neel, TechCraft"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-[#E3DCD3] dark:border-[#3C3530] bg-[#FAF8F5] dark:bg-[#221E1A] text-[#1E1A17] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF5338]"
                />
              </div>

              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="h-10 px-5 rounded-xl bg-[#1E1A17] dark:bg-[#FAF8F5] hover:bg-[#3C3530] dark:hover:bg-[#EBE5DC] text-white dark:text-[#1E1A17] text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                Save Profile
              </button>
            </form>
          </div>
        </div>

        {/* Theme, Data Backup & Demo Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#1E1A17] rounded-2xl border border-[#E3DCD3] dark:border-[#3C3530] p-6 space-y-3 flex flex-col justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-[#1E1A17] dark:text-[#FAF8F5]">
                Theme Appearance
              </h3>
              <p className="text-xs text-[#58524C] dark:text-[#A89F95] mt-0.5">
                Toggle between Creator Paper (Light) and Dark Studio mode.
              </p>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={toggle}
                className="w-full h-10 px-4 rounded-xl border border-[#E3DCD3] dark:border-[#3C3530] bg-[#FAF8F5] dark:bg-[#221E1A] text-xs font-bold text-[#1E1A17] dark:text-white flex items-center justify-between cursor-pointer"
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
                className="text-[11px] text-[#8C8379] hover:text-[#1E1A17] dark:hover:text-white underline cursor-pointer"
              >
                Reset to System Preference (Clear saved theme)
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E1A17] rounded-2xl border border-[#E3DCD3] dark:border-[#3C3530] p-6 space-y-3 flex flex-col justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-[#1E1A17] dark:text-[#FAF8F5]">
                Export Research Vault
              </h3>
              <p className="text-xs text-[#58524C] dark:text-[#A89F95] mt-0.5">
                Download a complete JSON backup of all projects, briefs, hooks,
                and swipe cards.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportData}
              className="h-10 px-4 rounded-xl border border-[#E3DCD3] dark:border-[#3C3530] bg-[#FAF8F5] dark:bg-[#221E1A] hover:bg-[#F1EDE6] text-xs font-bold text-[#1E1A17] dark:text-white flex items-center justify-center gap-2 cursor-pointer"
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

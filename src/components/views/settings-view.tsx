"use client";

import { QUERY_KEYS } from "@/lib/constants";
import { useTheme } from "@/lib/theme-provider";
import { projectService } from "@/services/api/project.service";
import type { InspirationRecord, ProjectRecord } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface SettingsViewProps {
  inspirations: InspirationRecord[];
  projects: ProjectRecord[];
}

export function SettingsView({ inspirations, projects }: SettingsViewProps) {
  const { theme, toggle } = useTheme();
  const qc = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

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

  const handleSyncDemoData = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      await projectService.seed({ force: true });
      await qc.invalidateQueries({ queryKey: [QUERY_KEYS.PROJECTS] });
      await qc.invalidateQueries({ queryKey: [QUERY_KEYS.INSPIRATIONS] });
      setSyncStatus("Default projects, scripts, and swipe cards restored!");
      setTimeout(() => setSyncStatus(null), 4000);
    } catch (err: unknown) {
      setSyncStatus(
        err instanceof Error ? err.message : "Failed to sync demo data",
      );
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="border-b border-[#E3DCD3] dark:border-[#3C3530] pb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-extrabold tracking-tight text-[#1E1A17] dark:text-[#FAF8F5]">
            Settings
          </h2>
        </div>
      </div>

      <div className="space-y-6">
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
            <button
              type="button"
              onClick={toggle}
              className="h-10 px-4 rounded-xl border border-[#E3DCD3] dark:border-[#3C3530] bg-[#FAF8F5] dark:bg-[#221E1A] text-xs font-bold text-[#1E1A17] dark:text-white flex items-center justify-between"
            >
              <span>
                Current Theme: {theme === "dark" ? "Dark Mode" : "Light Mode"}
              </span>
              <span>
                {theme === "dark" ? "☀️ Switch to Light" : "🌙 Switch to Dark"}
              </span>
            </button>
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
              className="h-10 px-4 rounded-xl border border-[#E3DCD3] dark:border-[#3C3530] bg-[#FAF8F5] dark:bg-[#221E1A] hover:bg-[#F1EDE6] text-xs font-bold text-[#1E1A17] dark:text-white flex items-center justify-center gap-2"
            >
              <span>💾</span>
              <span>Export Library (JSON)</span>
            </button>
          </div>

          <div className="bg-white dark:bg-[#1E1A17] rounded-2xl border border-[#E3DCD3] dark:border-[#3C3530] p-6 space-y-3 flex flex-col justify-between md:col-span-2">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-[#1E1A17] dark:text-[#FAF8F5]">
                  Restore & Sync Demonstration Content
                </h3>
                {syncStatus ? (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {syncStatus}
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-[#58524C] dark:text-[#A89F95] mt-0.5">
                Restore the default 4 creator benchmark projects (MrBeast,
                DeepDiveDoc, TechCraft, BrainWave) with full structured video
                scripts, pacing beats, hooks, and swipe cards.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSyncDemoData}
              disabled={isSyncing}
              className="h-10 px-5 rounded-xl border border-[#E3DCD3] dark:border-[#3C3530] bg-[#FAF8F5] dark:bg-[#221E1A] hover:bg-[#F1EDE6] dark:hover:bg-[#2A2521] text-xs font-bold text-[#1E1A17] dark:text-white flex items-center justify-center gap-2 self-start"
            >
              <span>🌱</span>
              <span>
                {isSyncing
                  ? "Restoring Demo Data..."
                  : "Sync Demo Projects & Scripts"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

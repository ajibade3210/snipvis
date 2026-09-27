"use client";

import { useTheme } from "@/lib/theme-provider";
import type { InspirationRecord, ProjectRecord } from "@/types";

interface SettingsViewProps {
  inspirations: InspirationRecord[];
  projects: ProjectRecord[];
}

export function SettingsView({ inspirations, projects }: SettingsViewProps) {
  const { theme, toggle } = useTheme();

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
            Settings
          </h2>
        </div>
      </div>

      <div className="space-y-6">
        {/* Theme & Data Backup */}
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
        </div>
      </div>
    </div>
  );
}

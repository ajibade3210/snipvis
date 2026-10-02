"use client";

import { useSetMainThumbnail, useUpdateProject } from "@/hooks/use-projects";
import {
  PACKAGING_LIMITS,
  PSYCHOLOGY_CONSTANTS,
  SIMULATOR_DEFAULTS,
} from "@/lib/constants";
import { useTheme } from "@/lib/theme-provider";
import type {
  PackagingSimulatorModalProps,
  SimulationDevice,
  SimulationTheme,
  SimulatorReferenceItem,
} from "@/types/packaging-simulator";
import { useEffect, useState } from "react";

export function PackagingSimulatorModal({
  isOpen,
  onClose,
  projectId,
  projectName,
  channelName,
  channelAvatarUrl,
  thumbnails,
  referenceInspirations = [],
}: PackagingSimulatorModalProps) {
  const { theme: websiteTheme } = useTheme();
  const [device, setDevice] = useState<SimulationDevice>("desktop");
  const [theme, setTheme] = useState<SimulationTheme>(
    websiteTheme === "dark" ? "dark" : "light",
  );
  const [isSquintActive, setIsSquintActive] = useState(false);
  const [showTimestamp, setShowTimestamp] = useState(true);
  const [showDangerZone, setShowDangerZone] = useState(false);
  const [showRuleOfThree, setShowRuleOfThree] = useState(false);
  const [showReferences, setShowReferences] = useState(true);

  // Editable title and selected thumbnail variant
  const [draftTitle, setDraftTitle] = useState(projectName);
  const mainThumb = thumbnails.find((t) => t.isMain) || thumbnails[0];
  const [selectedThumbId, setSelectedThumbId] = useState<string>(
    mainThumb?.id || "",
  );
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const updateProjectMutation = useUpdateProject();
  const setMainMutation = useSetMainThumbnail();

  // Keep selected thumb, draft title, and default theme in sync when modal opens
  useEffect(() => {
    if (isOpen) {
      setDraftTitle(projectName);
      setTheme(websiteTheme === "dark" ? "dark" : "light");
      if (mainThumb?.id) {
        setSelectedThumbId(mainThumb.id);
      }
    }
  }, [isOpen, projectName, mainThumb?.id, websiteTheme]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeThumbnail =
    thumbnails.find((t) => t.id === selectedThumbId) || mainThumb;
  const isCurrentMain = activeThumbnail?.isMain ?? false;

  const charCount = draftTitle.trim().length;
  const isSafeOnMobile = charCount <= PACKAGING_LIMITS.MOBILE_SAFE;
  const isSafeOnDesktop = charCount <= PACKAGING_LIMITS.DESKTOP_MAX;

  const displayChannel = channelName || SIMULATOR_DEFAULTS.DEFAULT_CHANNEL;

  // Psychological Title Tension Analysis
  const lowerTitle = draftTitle.toLowerCase();
  const hasLossAversion = PSYCHOLOGY_CONSTANTS.LOSS_AVERSION_KEYWORDS.some(
    (kw) => lowerTitle.includes(kw),
  );
  const hasCuriosityGap = PSYCHOLOGY_CONSTANTS.CURIOSITY_KEYWORDS.some((kw) =>
    lowerTitle.includes(kw),
  );
  const hasExtremeStakes = PSYCHOLOGY_CONSTANTS.EXTREME_STAKES_PATTERNS.some(
    (pattern) => pattern.test(draftTitle),
  );

  const cleanSubject =
    draftTitle
      .replace(/^(the|how|why|i tested|i spent|what happens|from|stop)\s+/i, "")
      .trim() || projectName;

  const formulaPivots = [
    {
      label: "⚡ Loss Aversion",
      title: `The ${cleanSubject} Mistake Nobody Talks About`,
    },
    {
      label: "📈 Extreme Contrast",
      title: `I Tested ${cleanSubject} for 30 Days (Real Results)`,
    },
    {
      label: "❓ Curiosity Gap",
      title: `The Real Reason Why ${cleanSubject} Is Changing Forever`,
    },
  ];

  // Handlers for two-way sync
  const handleSaveTitle = async () => {
    if (!draftTitle.trim()) return;
    try {
      await updateProjectMutation.mutateAsync({
        id: projectId,
        data: { name: draftTitle.trim() },
      });
      setSaveStatus("Title saved!");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch {
      setSaveStatus("Failed to save");
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleSetMain = async (thumbId: string) => {
    try {
      await setMainMutation.mutateAsync({ projectId, thumbId });
      setSaveStatus("Hero thumbnail updated!");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch {
      setSaveStatus("Failed to set hero");
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  // Fallback references if none exist in the project vault
  const displayReferences: SimulatorReferenceItem[] =
    referenceInspirations.length > 0
      ? referenceInspirations.slice(0, 3)
      : [
          {
            id: "ref-1",
            title: "I Built a $100,000 Studio in 7 Days",
            thumbnailUrl:
              "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80",
            channelName: "Studio Architects",
            views: "840K views",
            duration: "18:42",
          },
          {
            id: "ref-2",
            title: "Why 99% of YouTube Hooks Fail in the First 3 Seconds",
            thumbnailUrl:
              "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&auto=format&fit=crop&q=80",
            channelName: "Creator Lab",
            views: "310K views",
            duration: "11:15",
          },
        ];

  return (
    <dialog
      open
      aria-label="YouTube Packaging Simulator"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/35 m-0 h-full w-full max-w-none border-0"
    >
      <div className="bg-[#FCFAF7] dark:bg-[#1C1815] border border-black/[0.08] dark:border-white/[0.08] text-[#1E1A17] dark:text-[#FAF8F5] rounded-3xl w-full max-w-7xl max-h-[92vh] flex flex-col shadow-2xl shadow-black/25 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Apple-Style Deferential Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 sm:px-7 pt-5 pb-3 border-b border-black/[0.04] dark:border-white/[0.05]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight text-[#1E1A17] dark:text-white">
                Packaging Simulator
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FF5338]/10 text-[#FF5338]">
                Feed Stress-Test
              </span>
            </div>
            <p className="text-xs text-[#8C8379] dark:text-[#A89F95] mt-0.5">
              Simulate thumbnail standout, duration badge obstruction, and
              mobile title cutoff.
            </p>
          </div>

          {/* Quick Action Ribbon */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Device Switcher - Apple Sliding Pill Style */}
            <div className="flex items-center p-1 bg-black/[0.04] dark:bg-white/[0.05] rounded-xl">
              <button
                type="button"
                onClick={() => setDevice("desktop")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  device === "desktop"
                    ? "bg-white dark:bg-[#2A2420] text-[#1E1A17] dark:text-white shadow-xs"
                    : "text-[#8C8379] hover:text-[#1E1A17] dark:hover:text-white"
                }`}
              >
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setDevice("mobile")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  device === "mobile"
                    ? "bg-white dark:bg-[#2A2420] text-[#1E1A17] dark:text-white shadow-xs"
                    : "text-[#8C8379] hover:text-[#1E1A17] dark:hover:text-white"
                }`}
              >
                Mobile
              </button>
            </div>

            {/* Squint Test Button */}
            <button
              type="button"
              onClick={() => setIsSquintActive((prev) => !prev)}
              title="Applies blur & grayscale to test thumbnail contrast on small screens"
              className={`h-8 px-3 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                isSquintActive
                  ? "bg-[#1E1A17] dark:bg-white text-white dark:text-[#1E1A17] shadow-xs"
                  : "bg-black/[0.04] dark:bg-white/[0.06] text-[#8C8379] hover:text-[#1E1A17] dark:hover:text-white"
              }`}
            >
              <span>👁️</span>
              <span>{isSquintActive ? "Squinting" : "Squint Test"}</span>
            </button>

            {/* Rule of 3 Cognitive Guard Toggle */}
            <button
              type="button"
              onClick={() => setShowRuleOfThree((prev) => !prev)}
              title="Miller's Law: Verifies thumbnail has at most 3 focal elements"
              className={`h-8 px-3 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                showRuleOfThree
                  ? "bg-[#1E1A17] dark:bg-white text-white dark:text-[#1E1A17] shadow-xs"
                  : "bg-black/[0.04] dark:bg-white/[0.06] text-[#8C8379] hover:text-[#1E1A17] dark:hover:text-white"
              }`}
            >
              <span>Rule of 3</span>
            </button>

            {/* Timestamp Toggle */}
            <button
              type="button"
              onClick={() => setShowTimestamp((prev) => !prev)}
              className={`h-8 px-3 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                showTimestamp
                  ? "bg-black/[0.08] dark:bg-white/[0.12] text-[#1E1A17] dark:text-white"
                  : "bg-black/[0.03] dark:bg-white/[0.04] text-[#8C8379] line-through"
              }`}
            >
              <span>14:28 Badge</span>
            </button>

            {/* Danger Zone Overlay Toggle */}
            <button
              type="button"
              onClick={() => setShowDangerZone((prev) => !prev)}
              title="Highlights the bottom-right area where YouTube badges cover your art"
              className={`h-8 px-3 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                showDangerZone
                  ? "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30"
                  : "bg-black/[0.04] dark:bg-white/[0.06] text-[#8C8379] hover:text-[#1E1A17] dark:hover:text-white"
              }`}
            >
              <span>Badge Blocker</span>
            </button>

            {/* Theme Toggle for Feed Viewport */}
            <button
              type="button"
              onClick={() =>
                setTheme((prev) => (prev === "dark" ? "light" : "dark"))
              }
              className="h-8 px-3 rounded-full text-xs font-medium bg-black/[0.04] dark:bg-white/[0.06] text-[#8C8379] hover:text-[#1E1A17] dark:hover:text-white transition-colors cursor-pointer"
            >
              {theme === "dark" ? "🌙 Dark Feed" : "☀️ Light Feed"}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full text-[#8C8379] hover:text-[#1E1A17] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer ml-1"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Workspace Body: Split Studio */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Column: Decision & Controls Studio (4 cols) */}
          <div className="lg:col-span-4 border-r border-black/[0.04] dark:border-white/[0.05] bg-black/[0.015] dark:bg-white/[0.015] p-6 space-y-6 overflow-y-auto">
            {/* Status message */}
            {saveStatus && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                <span>✓</span>
                <span>{saveStatus}</span>
              </div>
            )}

            {/* Title Lab */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="simulator-title-input"
                  className="text-xs font-semibold text-[#1E1A17] dark:text-white"
                >
                  Draft Video Title
                </label>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                    isSafeOnMobile
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : isSafeOnDesktop
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                  }`}
                >
                  {charCount} chars
                </span>
              </div>

              <textarea
                id="simulator-title-input"
                rows={3}
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                placeholder="Enter YouTube title to test..."
                className="w-full rounded-xl bg-white dark:bg-[#201C18] border border-black/[0.08] dark:border-white/[0.08] focus:border-[#FF5338] text-xs text-[#1E1A17] dark:text-white p-3 outline-none resize-none font-medium"
              />

              {/* Character Truncation Diagnostics */}
              <div className="text-[11px] space-y-1">
                {isSafeOnMobile ? (
                  <p className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                    <span>✓</span>
                    <span>
                      Safe: Fully visible on both mobile & desktop feeds.
                    </span>
                  </p>
                ) : isSafeOnDesktop ? (
                  <p className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5">
                    <span>⚠️</span>
                    <span>
                      Mobile Warning: Words past {PACKAGING_LIMITS.MOBILE_SAFE}{" "}
                      characters will be cut with "..."
                    </span>
                  </p>
                ) : (
                  <p className="text-red-600 dark:text-red-400 font-medium flex items-center gap-1.5">
                    <span>⛔</span>
                    <span>
                      Truncation: Title exceeds {PACKAGING_LIMITS.DESKTOP_MAX}{" "}
                      characters; will be cut off across all devices.
                    </span>
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleSaveTitle}
                disabled={
                  updateProjectMutation.isPending ||
                  draftTitle.trim() === projectName
                }
                className="w-full h-9 rounded-full bg-[#1E1A17] dark:bg-white hover:bg-[#332C26] dark:hover:bg-white/90 text-white dark:text-[#1E1A17] text-xs font-semibold transition-all disabled:opacity-40 cursor-pointer shadow-xs"
              >
                {updateProjectMutation.isPending
                  ? "Saving..."
                  : "Save Title to Project"}
              </button>

              {/* Psychological Triggers & 1-Click Viral Formula Rewrites */}
              <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.05] space-y-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-[#8C8379] dark:text-[#A89F95] uppercase tracking-wider text-[10px]">
                    Viral Tension Drivers
                  </span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                      hasLossAversion || hasCuriosityGap || hasExtremeStakes
                        ? "bg-[#FF5338]/10 text-[#FF5338]"
                        : "bg-black/[0.04] dark:bg-white/[0.06] text-[#8C8379]"
                    }`}
                  >
                    {hasLossAversion && hasCuriosityGap
                      ? "High Viral Tension"
                      : hasLossAversion || hasCuriosityGap || hasExtremeStakes
                        ? "Active Hook Driver"
                        : "Neutral / Informational"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 text-[10px]">
                  <span
                    className={`px-2 py-0.5 rounded-md font-medium ${
                      hasLossAversion
                        ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                        : "bg-black/[0.03] dark:bg-white/[0.04] text-[#8C8379]"
                    }`}
                  >
                    Loss Aversion {hasLossAversion ? "✓" : "○"}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md font-medium ${
                      hasCuriosityGap
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                        : "bg-black/[0.03] dark:bg-white/[0.04] text-[#8C8379]"
                    }`}
                  >
                    Curiosity Gap {hasCuriosityGap ? "✓" : "○"}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md font-medium ${
                      hasExtremeStakes
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        : "bg-black/[0.03] dark:bg-white/[0.04] text-[#8C8379]"
                    }`}
                  >
                    Extreme Stakes {hasExtremeStakes ? "✓" : "○"}
                  </span>
                </div>

                {/* 1-Click Formula Rewrites */}
                <div className="pt-1.5 space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8C8379]">
                    1-Click Formula Pivots:
                  </span>
                  <div className="space-y-1">
                    {formulaPivots.map((pivot) => (
                      <button
                        key={pivot.label}
                        type="button"
                        onClick={() => setDraftTitle(pivot.title)}
                        className="w-full text-left p-2.5 rounded-xl bg-white dark:bg-[#201C18] hover:bg-black/[0.02] dark:hover:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.06] hover:border-[#FF5338]/40 transition-colors text-xs cursor-pointer group shadow-2xs"
                      >
                        <div className="flex items-center justify-between text-[10px] font-semibold text-[#8C8379] group-hover:text-[#FF5338]">
                          <span>{pivot.label}</span>
                          <span>Apply ↵</span>
                        </div>
                        <p className="font-medium truncate mt-0.5 text-xs text-[#1E1A17] dark:text-white">
                          {pivot.title}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Thumbnail Variants Selector */}
            <div className="space-y-3 pt-4 border-t border-black/[0.04] dark:border-white/[0.05]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1E1A17] dark:text-white">
                  Test Thumbnail Variant
                </span>
                <span className="text-xs text-[#8C8379]">
                  {thumbnails.length} concept
                  {thumbnails.length === 1 ? "" : "s"}
                </span>
              </div>

              {thumbnails.length === 0 ? (
                <p className="text-xs text-[#8C8379] italic">
                  No thumbnails uploaded in project. Upload concepts in the
                  Thumbnail Lab.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {thumbnails.map((thumb, index) => {
                    const isSelected = thumb.id === selectedThumbId;
                    return (
                      <button
                        key={thumb.id}
                        type="button"
                        onClick={() => setSelectedThumbId(thumb.id)}
                        className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all cursor-pointer group text-left ${
                          isSelected
                            ? "border-[#FF5338] ring-2 ring-[#FF5338]/20 shadow-xs"
                            : "border-black/[0.06] dark:border-white/[0.08] opacity-75 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={thumb.url}
                          alt={thumb.label || `Concept ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/80 text-white">
                          #{index + 1} {thumb.isMain && "★"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Set as Main Hero Button */}
              {activeThumbnail && !isCurrentMain && (
                <button
                  type="button"
                  onClick={() => handleSetMain(activeThumbnail.id)}
                  disabled={setMainMutation.isPending}
                  className="w-full h-9 rounded-full bg-[#FF5338] hover:bg-[#E0452C] text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
                >
                  {setMainMutation.isPending
                    ? "Updating..."
                    : "★ Set Active Variant as Project Hero"}
                </button>
              )}
            </div>

            {/* Standout Controls */}
            <div className="space-y-2 pt-4 border-t border-black/[0.04] dark:border-white/[0.05]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1E1A17] dark:text-white">
                  Vault Standout Context
                </span>
                <button
                  type="button"
                  onClick={() => setShowReferences((prev) => !prev)}
                  className="text-xs text-[#FF5338] font-medium hover:underline cursor-pointer"
                >
                  {showReferences ? "Hide References" : "Show References"}
                </button>
              </div>
              <p className="text-xs text-[#8C8379] leading-relaxed">
                Puts your candidate next to saved reference videos to test
                whether your visual hook cuts through the noise.
              </p>
            </div>
          </div>

          {/* Right Column: Simulated Feed Viewport (8 cols) */}
          <div
            className={`lg:col-span-8 p-6 overflow-y-auto flex items-center justify-center transition-colors ${
              theme === "dark" ? "bg-[#0F0F0F]" : "bg-[#F9F9F9]"
            }`}
          >
            {device === "desktop" ? (
              /* Desktop Simulated Feed */
              <div className="w-full max-w-4xl space-y-6">
                {/* Mock YouTube Top Navbar */}
                <div
                  className={`flex items-center justify-between pb-4 border-b ${
                    theme === "dark"
                      ? "border-[#272727] text-white"
                      : "border-[#E5E5E5] text-[#0F0F0F]"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-black text-sm tracking-tighter">
                    <span className="text-[#FF0000] text-lg">▶</span>
                    <span>YouTube</span>
                  </div>
                  <div
                    className={`hidden sm:flex items-center w-72 px-3 py-1.5 rounded-full border text-xs ${
                      theme === "dark"
                        ? "bg-[#121212] border-[#303030] text-[#888888]"
                        : "bg-white border-[#CCCCCC] text-[#717171]"
                    }`}
                  >
                    <span>Search</span>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#FF5338] text-white text-xs font-bold flex items-center justify-center">
                    {displayChannel.slice(0, 1).toUpperCase()}
                  </div>
                </div>

                {/* Feed Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* Primary Target Video Card */}
                  <div className="flex flex-col group">
                    {/* Thumbnail Frame */}
                    <div
                      className={`relative aspect-video rounded-xl overflow-hidden bg-black shadow-md transition-all ${
                        isSquintActive ? "blur-[4px] grayscale" : ""
                      }`}
                    >
                      {activeThumbnail ? (
                        <img
                          src={activeThumbnail.url}
                          alt={draftTitle}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-[#888888]">
                          No thumbnail selected
                        </div>
                      )}

                      {/* YouTube Timestamp Badge */}
                      {showTimestamp && (
                        <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[11px] font-bold font-mono bg-black/85 text-white tracking-tight">
                          {SIMULATOR_DEFAULTS.DURATION}
                        </span>
                      )}

                      {/* Blocker Danger Zone Overlay */}
                      {showDangerZone && (
                        <div className="absolute bottom-0 right-0 w-28 h-12 border-2 border-dashed border-red-500 bg-red-600/30 flex items-center justify-center pointer-events-none">
                          <span className="text-[9px] font-black uppercase text-white bg-red-600 px-1 py-0.5 rounded">
                            Overlay Zone
                          </span>
                        </div>
                      )}

                      {/* Rule of 3 Cognitive Overlay Guidelines */}
                      {showRuleOfThree && (
                        <div className="absolute inset-0 border-2 border-[#A855F7]/80 pointer-events-none grid grid-cols-3 grid-rows-3 bg-[#A855F7]/10">
                          <div className="border-r border-b border-[#A855F7]/30 flex items-start p-1.5">
                            <span className="text-[9px] font-black uppercase text-white bg-[#A855F7] px-1 py-0.5 rounded shadow-xs">
                              1. Anchor (Hero)
                            </span>
                          </div>
                          <div className="border-r border-b border-[#A855F7]/30" />
                          <div className="border-b border-[#A855F7]/30 flex items-start justify-end p-1.5">
                            <span className="text-[9px] font-black uppercase text-white bg-[#A855F7] px-1 py-0.5 rounded shadow-xs">
                              2. Tension
                            </span>
                          </div>
                          <div className="border-r border-b border-[#A855F7]/30" />
                          <div className="border-r border-b border-[#A855F7]/30 flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#A855F7] animate-ping" />
                          </div>
                          <div className="border-b border-[#A855F7]/30" />
                          <div className="border-r border-[#A855F7]/30 flex items-end p-1.5">
                            <span className="text-[9px] font-black uppercase text-white bg-[#A855F7] px-1 py-0.5 rounded shadow-xs">
                              3. Accent (Text)
                            </span>
                          </div>
                          <div className="border-r border-b border-[#A855F7]/30" />
                          <div />
                        </div>
                      )}

                      {/* Indicator pill */}
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#FF5338] text-white shadow-sm">
                        Your Draft
                      </span>
                    </div>

                    {/* Metadata Section */}
                    <div className="flex gap-3 mt-3">
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-[#FF5338] text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                        {channelAvatarUrl ? (
                          <img
                            src={channelAvatarUrl}
                            alt={displayChannel}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          displayChannel.slice(0, 1).toUpperCase()
                        )}
                      </div>

                      {/* Title & Stats */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`text-sm font-semibold line-clamp-2 leading-snug ${
                            theme === "dark" ? "text-white" : "text-[#0F0F0F]"
                          }`}
                          title={draftTitle}
                        >
                          {draftTitle || "Untitled Video"}
                        </h3>
                        <p
                          className={`text-xs mt-1 truncate ${
                            theme === "dark"
                              ? "text-[#AAAAAA]"
                              : "text-[#606060]"
                          }`}
                        >
                          {displayChannel}
                        </p>
                        <p
                          className={`text-xs ${
                            theme === "dark"
                              ? "text-[#AAAAAA]"
                              : "text-[#606060]"
                          }`}
                        >
                          {SIMULATOR_DEFAULTS.VIEWS} •{" "}
                          {SIMULATOR_DEFAULTS.UPLOAD_TIME}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Competitor / Vault References */}
                  {showReferences &&
                    displayReferences.map((ref) => (
                      <div key={ref.id} className="flex flex-col opacity-90">
                        <div
                          className={`relative aspect-video rounded-xl overflow-hidden bg-black shadow-md ${
                            isSquintActive ? "blur-[4px] grayscale" : ""
                          }`}
                        >
                          <img
                            src={ref.thumbnailUrl}
                            alt={ref.title}
                            className="w-full h-full object-cover"
                          />
                          {showTimestamp && (
                            <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[11px] font-bold font-mono bg-black/85 text-white">
                              {ref.duration || SIMULATOR_DEFAULTS.DURATION}
                            </span>
                          )}
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-black/70 text-[#D1D1D1]">
                            Reference
                          </span>
                        </div>

                        <div className="flex gap-3 mt-3">
                          <div className="w-9 h-9 rounded-full bg-[#333333] text-white text-xs font-bold flex items-center justify-center shrink-0">
                            {(ref.channelName || "C").slice(0, 1)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3
                              className={`text-sm font-semibold line-clamp-2 leading-snug ${
                                theme === "dark"
                                  ? "text-white"
                                  : "text-[#0F0F0F]"
                              }`}
                            >
                              {ref.title}
                            </h3>
                            <p
                              className={`text-xs mt-1 truncate ${
                                theme === "dark"
                                  ? "text-[#AAAAAA]"
                                  : "text-[#606060]"
                              }`}
                            >
                              {ref.channelName || "Competitor"}
                            </p>
                            <p
                              className={`text-xs ${
                                theme === "dark"
                                  ? "text-[#AAAAAA]"
                                  : "text-[#606060]"
                              }`}
                            >
                              {ref.views || "420K views"} • 2 days ago
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              /* Mobile Simulated Feed (Phone Frame) */
              <div
                className={`w-[360px] rounded-[36px] border-4 border-[#333333] shadow-2xl overflow-hidden flex flex-col ${
                  theme === "dark"
                    ? "bg-[#0F0F0F] text-white"
                    : "bg-[#FFFFFF] text-[#0F0F0F]"
                }`}
              >
                {/* Mobile Top App Bar */}
                <div
                  className={`px-4 py-2.5 flex items-center justify-between border-b ${
                    theme === "dark" ? "border-[#222222]" : "border-[#EEEEEE]"
                  }`}
                >
                  <div className="flex items-center gap-1 font-black text-xs">
                    <span className="text-[#FF0000] text-base">▶</span>
                    <span>YouTube</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span>🔍</span>
                    <span>🔔</span>
                    <div className="w-5 h-5 rounded-full bg-[#FF5338] text-white text-[10px] font-bold flex items-center justify-center">
                      {displayChannel.slice(0, 1).toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Mobile Feed Body */}
                <div
                  className={`divide-y max-h-[520px] overflow-y-auto ${
                    theme === "dark"
                      ? "divide-[#222222]/50"
                      : "divide-[#EEEEEE]"
                  }`}
                >
                  {/* Your Video */}
                  <div className="pb-4">
                    <div
                      className={`relative aspect-video w-full bg-black ${
                        isSquintActive ? "blur-[4px] grayscale" : ""
                      }`}
                    >
                      {activeThumbnail ? (
                        <img
                          src={activeThumbnail.url}
                          alt={draftTitle}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-[#888888]">
                          No thumbnail
                        </div>
                      )}

                      {showTimestamp && (
                        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-black/90 text-white">
                          {SIMULATOR_DEFAULTS.DURATION}
                        </span>
                      )}

                      {showDangerZone && (
                        <div className="absolute bottom-0 right-0 w-24 h-10 border border-dashed border-red-500 bg-red-600/30 flex items-center justify-center pointer-events-none">
                          <span className="text-[8px] font-black uppercase text-white bg-red-600 px-1 py-0.5 rounded">
                            Overlay
                          </span>
                        </div>
                      )}

                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#FF5338] text-white shadow-xs">
                        Your Video
                      </span>
                    </div>

                    <div className="px-3 pt-3 flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#FF5338] text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {displayChannel.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-semibold line-clamp-2 leading-snug">
                          {draftTitle || "Untitled Video"}
                        </h3>
                        <p
                          className={`text-[11px] mt-0.5 ${
                            theme === "dark"
                              ? "text-[#AAAAAA]"
                              : "text-[#606060]"
                          }`}
                        >
                          {displayChannel} • {SIMULATOR_DEFAULTS.VIEWS}
                        </p>
                      </div>
                      <span className="text-[#888888] text-xs">⋮</span>
                    </div>
                  </div>

                  {/* Competitor Reference in Mobile Feed */}
                  {showReferences && displayReferences[0] && (
                    <div className="py-4">
                      <div
                        className={`relative aspect-video w-full bg-black ${
                          isSquintActive ? "blur-[4px] grayscale" : ""
                        }`}
                      >
                        <img
                          src={displayReferences[0].thumbnailUrl}
                          alt={displayReferences[0].title}
                          className="w-full h-full object-cover"
                        />
                        {showTimestamp && (
                          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-black/90 text-white">
                            {displayReferences[0].duration || "12:05"}
                          </span>
                        )}
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-black/70 text-[#D1D1D1]">
                          Reference
                        </span>
                      </div>

                      <div className="px-3 pt-3 flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#444444] text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {(displayReferences[0].channelName || "C").slice(
                            0,
                            1,
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-semibold line-clamp-2 leading-snug">
                            {displayReferences[0].title}
                          </h3>
                          <p
                            className={`text-[11px] mt-0.5 ${
                              theme === "dark"
                                ? "text-[#AAAAAA]"
                                : "text-[#606060]"
                            }`}
                          >
                            {displayReferences[0].channelName || "Competitor"} •{" "}
                            {displayReferences[0].views || "500K views"}
                          </p>
                        </div>
                        <span className="text-[#888888] text-xs">⋮</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}

"use client";

import { HOOK_EMOTION_STYLES } from "@/constants/ai";
import { useAnalyzeHook } from "@/hooks/use-analyze-hook";
import { useCreateInspiration } from "@/hooks/use-inspirations";
import {
  type AnalyzeHookResponse,
  HOOK_TYPE_LABELS,
  RISK_FLAG_LABELS,
  getStrengthScoreBadgeStyle,
} from "@/types/hook-analysis";
import { useEffect, useRef, useState } from "react";

interface AnalyzeHookModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Array<{ id: string; name: string }>;
  defaultProjectId?: string | null;
  initialUrl?: string;
}

export function AnalyzeHookModal({
  isOpen,
  onClose,
  projects,
  defaultProjectId,
  initialUrl,
}: AnalyzeHookModalProps) {
  const [activeTab, setActiveTab] = useState<"url" | "image">("url");

  // Input states
  const [url, setUrl] = useState(initialUrl || "");
  const [manualText, setManualText] = useState("");
  const [showManualFallback, setShowManualFallback] = useState(false);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);

  // Image states
  const [imageBase64, setImageBase64] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Results & Saving states
  const [analysisResult, setAnalysisResult] =
    useState<AnalyzeHookResponse | null>(null);
  const [targetProjectId, setTargetProjectId] = useState<string>(
    defaultProjectId || "",
  );
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Loading animation phase
  const [loadingPhase, setLoadingPhase] = useState(0);

  const analyzeMutation = useAnalyzeHook();
  const createInspiration = useCreateInspiration();

  // Reset or initialize when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (initialUrl) {
        setUrl(initialUrl);
        setActiveTab("url");
      }
      setIsSavedSuccess(false);
      setSaveError(null);
    } else {
      setAnalysisResult(null);
      setShowManualFallback(false);
      setFallbackMessage(null);
      setCopiedField(null);
    }
  }, [isOpen, initialUrl]);

  // Loading phase cycle
  useEffect(() => {
    if (!analyzeMutation.isPending) {
      setLoadingPhase(0);
      return;
    }

    const phases = [0, 1, 2];
    const timer = setInterval(() => {
      setLoadingPhase((prev) => (prev + 1) % phases.length);
    }, 2200);

    return () => clearInterval(timer);
  }, [analyzeMutation.isPending]);

  if (!isOpen) return null;

  // Copy helper with brief state indicator
  const copyToClipboard = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(identifier);
    setTimeout(() => {
      setCopiedField((prev) => (prev === identifier ? null : prev));
    }, 2000);
  };

  // Client-side canvas image downscaler to guarantee payload < 300KB
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setSaveError("Please select a valid image file (PNG, JPG, WebP).");
      return;
    }

    setIsCompressingImage(true);
    setSaveError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 1024;
        let { width, height } = img;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setIsCompressingImage(false);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);

        setImageBase64(compressedDataUrl);
        setImagePreview(compressedDataUrl);
        setIsCompressingImage(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleAnalyze = async () => {
    setSaveError(null);

    if (activeTab === "url" && !url.trim() && !manualText.trim()) {
      setSaveError("Please enter a valid video URL or paste the hook text.");
      return;
    }

    if (activeTab === "image" && !imageBase64) {
      setSaveError("Please upload or drag a thumbnail image to analyze.");
      return;
    }

    try {
      const response = await analyzeMutation.mutateAsync({
        inputType: activeTab === "image" ? "image" : "url",
        url: activeTab === "url" ? url.trim() : undefined,
        manualText: manualText.trim() || undefined,
        imageBase64: activeTab === "image" ? imageBase64 : undefined,
      });

      if (response.needsManualFallback) {
        setShowManualFallback(true);
        setFallbackMessage(
          response.why_it_works ||
            "Unable to auto-extract from this link. Please paste the hook copy below.",
        );
      } else {
        setAnalysisResult(response);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to analyze hook.";
      if (
        msg.includes("platform bot restrictions") ||
        msg.includes("timed out")
      ) {
        setShowManualFallback(true);
        setFallbackMessage(msg);
      } else {
        setSaveError(msg);
      }
    }
  };

  const handleSaveToVault = async () => {
    if (!analysisResult) return;
    setSaveError(null);

    try {
      const recreationListFormatted = analysisResult.recreation_ideas
        .map((idea, idx) => `${idx + 1}. ${idea}`)
        .join("\n");

      const combinedNote = `Triggered Emotion: ${analysisResult.triggered_emotion}\n\nRecreation Formulas:\n${recreationListFormatted}`;

      await createInspiration.mutateAsync({
        title: analysisResult.perceived_copy,
        hook: analysisResult.why_it_works,
        thumbnailUrl: analysisResult.thumbnailUrl || "",
        sourceUrl: analysisResult.sourceUrl || url.trim() || undefined,
        channelName: analysisResult.channelName || "Creator Analysis",
        type: "HOOK",
        note: combinedNote,
        hook_type: analysisResult.hook_type,
        hook_formula: analysisResult.hook_formula,
        triggered_emotion: analysisResult.triggered_emotion,
        strength_score: analysisResult.strength_score,
        score_reason: analysisResult.score_reason,
        improvements: analysisResult.improvements,
        title_variants: analysisResult.title_variants,
        recreation_ideas: analysisResult.recreation_ideas,
        risk_flags: analysisResult.risk_flags,
        projects: targetProjectId
          ? [
              {
                projectId: targetProjectId,
                note: analysisResult.why_it_works,
              },
            ]
          : [],
      });

      setIsSavedSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err: unknown) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to save to Vault.",
      );
    }
  };

  const emotionStyle =
    analysisResult?.triggered_emotion &&
    HOOK_EMOTION_STYLES[analysisResult.triggered_emotion]
      ? HOOK_EMOTION_STYLES[analysisResult.triggered_emotion]
      : HOOK_EMOTION_STYLES.Default;

  const loadingTextPhases = [
    "Deconstructing visual & textual retention cues...",
    "Evaluating psychological curiosity gaps...",
    "Generating actionable creator recreation formulas...",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#1E1A17] border border-[#E3DCD3] dark:border-[#3C3530] rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#E3DCD3] dark:border-[#3C3530] flex items-center justify-between bg-[#FAF8F5] dark:bg-[#25201C] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF5338] text-white flex items-center justify-center font-bold text-base shadow-xs">
              ✨
            </div>
            <div>
              <h2 className="font-extrabold text-base text-[#1E1A17] dark:text-[#FAF8F5] flex items-center gap-1.5">
                <span>Instant AI Hook Breakdown</span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-[#FF5338]/10 text-[#FF5338]">
                  DeepSeek
                </span>
              </h2>
              <p className="text-[11px] text-[#58524C] dark:text-[#A89F95] mt-0.5 font-medium">
                Deconstruct psychological retention triggers and get recreation
                formulas.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-[#8C8379] hover:bg-[#E3DCD3]/60 dark:hover:bg-[#3C3530] flex items-center justify-center text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Global error message */}
          {saveError && (
            <div className="p-3 text-xs rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 font-semibold">
              ⚠️ {saveError}
            </div>
          )}

          {!analysisResult ? (
            <>
              {/* Input Mode Selector Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F1EDE6] dark:bg-[#2A2521] border border-[#E3DCD3] dark:border-[#3C3530]">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("url");
                    setSaveError(null);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === "url"
                      ? "bg-white dark:bg-[#1E1A17] text-[#1E1A17] dark:text-[#FAF8F5] shadow-xs"
                      : "text-[#58524C] dark:text-[#A89F95] hover:text-[#1E1A17] dark:hover:text-[#FAF8F5]"
                  }`}
                >
                  <span>🔗</span>
                  <span>Video / Post URL</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("image");
                    setSaveError(null);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === "image"
                      ? "bg-white dark:bg-[#1E1A17] text-[#1E1A17] dark:text-[#FAF8F5] shadow-xs"
                      : "text-[#58524C] dark:text-[#A89F95] hover:text-[#1E1A17] dark:hover:text-[#FAF8F5]"
                  }`}
                >
                  <span>🖼️</span>
                  <span>Thumbnail Image (Vision)</span>
                </button>
              </div>

              {/* Tab 1: URL Input Mode */}
              {activeTab === "url" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-[#58524C] dark:text-[#A89F95] block mb-1.5">
                      Social or Video URL (YouTube, TikTok, Instagram, X)
                    </label>
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=... or https://x.com/..."
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value);
                        setSaveError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAnalyze();
                      }}
                      className="w-full h-11 px-3.5 text-xs font-medium rounded-xl border border-[#E3DCD3] dark:border-[#3C3530] bg-white dark:bg-[#25201C] text-[#1E1A17] dark:text-[#FAF8F5] placeholder-[#8C8379] focus:outline-none focus:ring-2 focus:ring-[#FF5338]"
                    />
                  </div>

                  {/* Fallback Manual Textarea if extraction failed or user expands */}
                  {showManualFallback ? (
                    <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2 animate-in fade-in">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                        <span>⚠️</span>
                        <span>{fallbackMessage || "Manual Hook Input"}</span>
                      </div>
                      <textarea
                        rows={3}
                        placeholder="Paste the video title, post hook, or caption here..."
                        value={manualText}
                        onChange={(e) => setManualText(e.target.value)}
                        className="w-full p-2.5 text-xs font-medium rounded-lg border border-[#E3DCD3] dark:border-[#3C3530] bg-white dark:bg-[#1E1A17] text-[#1E1A17] dark:text-[#FAF8F5] placeholder-[#8C8379] focus:outline-none focus:ring-2 focus:ring-[#FF5338]"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowManualFallback(true)}
                      className="text-[11px] font-bold text-[#FF5338] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>+</span>
                      <span>Add manual hook text or notes (optional)</span>
                    </button>
                  )}
                </div>
              )}

              {/* Tab 2: Thumbnail Image Mode (Vision) */}
              {activeTab === "image" && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/5 text-blue-700 dark:text-blue-400 text-xs font-medium">
                    ℹ️ Note: DeepSeek operates text-only. Visual image teardown
                    requires a vision-capable provider (e.g. OpenRouter).
                  </div>

                  <button
                    type="button"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                      imagePreview
                        ? "border-[#FF5338]/60 bg-[#FF5338]/5"
                        : "border-[#E3DCD3] dark:border-[#3C3530] hover:border-[#FF5338]/40 hover:bg-[#FAF8F5] dark:hover:bg-[#25201C]"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageFile(file);
                      }}
                      className="hidden"
                    />

                    {imagePreview ? (
                      <div className="space-y-2 w-full max-w-sm mx-auto">
                        <img
                          src={imagePreview}
                          alt="Thumbnail preview"
                          className="w-full h-auto max-h-48 object-contain rounded-xl border border-[#E3DCD3] dark:border-[#3C3530] mx-auto shadow-sm"
                        />
                        <p className="text-[11px] font-bold text-[#FF5338]">
                          Click or drag to change thumbnail
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-[#FF5338]/10 text-[#FF5338] flex items-center justify-center text-xl">
                          🖼️
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#1E1A17] dark:text-[#FAF8F5]">
                            Click to upload or drag & drop thumbnail
                          </p>
                          <p className="text-[10px] text-[#8C8379] mt-0.5">
                            PNG, JPG, WebP (auto-optimized client-side)
                          </p>
                        </div>
                      </>
                    )}
                  </button>

                  <div>
                    <label className="text-xs font-bold text-[#58524C] dark:text-[#A89F95] block mb-1.5">
                      Optional context or title notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Finance channel test A/B variant"
                      value={manualText}
                      onChange={(e) => setManualText(e.target.value)}
                      className="w-full h-10 px-3 text-xs font-medium rounded-xl border border-[#E3DCD3] dark:border-[#3C3530] bg-white dark:bg-[#25201C] text-[#1E1A17] dark:text-[#FAF8F5] placeholder-[#8C8379] focus:outline-none focus:ring-2 focus:ring-[#FF5338]"
                    />
                  </div>
                </div>
              )}

              {/* Loading Skeleton during Analysis */}
              {analyzeMutation.isPending && (
                <div className="p-4 rounded-xl border border-[#E3DCD3] dark:border-[#3C3530] bg-[#FAF8F5] dark:bg-[#221D19] space-y-3 animate-pulse">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#FF5338]">
                    <span className="animate-spin text-sm">⏳</span>
                    <span>{loadingTextPhases[loadingPhase]}</span>
                  </div>
                  <div className="h-4 bg-[#E3DCD3]/70 dark:bg-[#3C3530] rounded w-3/4" />
                  <div className="h-4 bg-[#E3DCD3]/50 dark:bg-[#3C3530]/70 rounded w-1/2" />
                  <div className="h-20 bg-[#E3DCD3]/30 dark:bg-[#3C3530]/40 rounded-xl" />
                </div>
              )}
            </>
          ) : (
            /* Result Breakdown Display (11 fields) */
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* 1. Perceived Hook Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#FAF8F5] to-[#F1EDE6] dark:from-[#25201C] dark:to-[#1A1613] border border-[#E3DCD3] dark:border-[#3C3530] space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8C8379]">
                    Perceived Hook / Title
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Emotion badge */}
                    <span
                      className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${emotionStyle.bg} ${emotionStyle.text} ${emotionStyle.border}`}
                    >
                      ⚡ {analysisResult.triggered_emotion}
                    </span>

                    {/* Hook Type human-readable badge */}
                    <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20">
                      🎯{" "}
                      {HOOK_TYPE_LABELS[analysisResult.hook_type] ||
                        analysisResult.hook_type}
                    </span>

                    {/* Strength Score badge (1-4 red, 5-7 amber, 8-10 green) */}
                    <span
                      className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${getStrengthScoreBadgeStyle(
                        analysisResult.strength_score,
                      )}`}
                    >
                      ⭐ {analysisResult.strength_score}/10
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-[#1E1A17] dark:text-[#FAF8F5] leading-snug">
                  "
                  {analysisResult.perceived_copy ||
                    "No analyzable copy detected"}
                  "
                </h3>

                {/* Score Reason caption */}
                {analysisResult.score_reason && (
                  <p className="text-[11px] text-[#58524C] dark:text-[#A89F95] italic leading-relaxed pt-0.5 border-t border-[#E3DCD3]/50 dark:border-[#3C3530]/50">
                    <span className="font-semibold not-italic text-[#1E1A17] dark:text-[#FAF8F5]">
                      Score breakdown:
                    </span>{" "}
                    {analysisResult.score_reason}
                  </p>
                )}

                {/* Risk Flags (only rendered if non-empty) */}
                {analysisResult.risk_flags &&
                  analysisResult.risk_flags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {analysisResult.risk_flags.map((flag) => (
                        <span
                          key={flag}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                        >
                          <span>⚠️</span>
                          <span>{RISK_FLAG_LABELS[flag] || flag}</span>
                        </span>
                      ))}
                    </div>
                  )}
              </div>

              {/* 2. Why It Works & Hook Formula Card */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#221D19] border border-[#E3DCD3] dark:border-[#3C3530] space-y-3">
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-[#FF5338] flex items-center gap-1.5">
                    <span>🧠</span>
                    <span>Why It Works (Psychological Breakdown)</span>
                  </h4>
                  <p className="text-xs text-[#58524C] dark:text-[#A89F95] leading-relaxed">
                    {analysisResult.why_it_works}
                  </p>
                </div>

                {analysisResult.hook_formula && (
                  <div className="p-3 rounded-lg bg-[#FAF8F5] dark:bg-[#1A1613] border border-[#E3DCD3]/70 dark:border-[#3C3530]/70 flex items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0 flex-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8C8379] block">
                        Hook Formula Template
                      </span>
                      <code className="text-xs font-mono font-bold text-[#1E1A17] dark:text-[#FAF8F5] block truncate">
                        {analysisResult.hook_formula}
                      </code>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(analysisResult.hook_formula, "formula")
                      }
                      className="shrink-0 px-2.5 py-1 text-[11px] font-bold rounded-md bg-white dark:bg-[#2A2521] border border-[#E3DCD3] dark:border-[#3C3530] text-[#58524C] dark:text-[#A89F95] hover:text-[#1E1A17] dark:hover:text-[#FAF8F5] transition-colors cursor-pointer"
                    >
                      {copiedField === "formula" ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Improve This Hook Card */}
              {analysisResult.improvements &&
                analysisResult.improvements.length > 0 && (
                  <div className="p-4 rounded-xl bg-white dark:bg-[#221D19] border border-[#E3DCD3] dark:border-[#3C3530] space-y-2">
                    <h4 className="text-xs font-bold text-[#1E1A17] dark:text-[#FAF8F5] flex items-center gap-1.5">
                      <span>💡</span>
                      <span>Improve This Hook</span>
                    </h4>
                    <ul className="space-y-1.5 pl-1">
                      {analysisResult.improvements.map((improvement, idx) => (
                        <li
                          key={`improvement-${idx}-${improvement.slice(0, 10)}`}
                          className="flex items-start gap-2 text-xs text-[#58524C] dark:text-[#A89F95] leading-relaxed"
                        >
                          <span className="text-[#FF5338] font-bold text-sm leading-none mt-0.5">
                            •
                          </span>
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* 4. Title Variants Card */}
              {analysisResult.title_variants &&
                analysisResult.title_variants.length > 0 && (
                  <div className="p-4 rounded-xl bg-white dark:bg-[#221D19] border border-[#E3DCD3] dark:border-[#3C3530] space-y-2.5">
                    <h4 className="text-xs font-bold text-[#1E1A17] dark:text-[#FAF8F5] flex items-center gap-1.5">
                      <span>🔀</span>
                      <span>Title Variants</span>
                    </h4>
                    <div className="space-y-2">
                      {analysisResult.title_variants.map((variant, idx) => (
                        <div
                          key={`variant-${idx}-${variant.slice(0, 10)}`}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-[#FAF8F5] dark:bg-[#1A1613] border border-[#E3DCD3]/50 dark:border-[#3C3530]/50"
                        >
                          <p className="text-xs font-medium text-[#1E1A17] dark:text-[#FAF8F5] leading-snug flex-1">
                            {variant}
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              copyToClipboard(variant, `variant-${idx}`)
                            }
                            className="shrink-0 px-2 py-1 text-[10px] font-bold rounded-md bg-white dark:bg-[#2A2521] border border-[#E3DCD3] dark:border-[#3C3530] text-[#58524C] dark:text-[#A89F95] hover:text-[#1E1A17] dark:hover:text-[#FAF8F5] transition-colors cursor-pointer"
                          >
                            {copiedField === `variant-${idx}`
                              ? "✓ Copied"
                              : "Copy"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* 5. Recreation Ideas */}
              {analysisResult.recreation_ideas &&
                analysisResult.recreation_ideas.length > 0 && (
                  <div className="p-4 rounded-xl bg-white dark:bg-[#221D19] border border-[#E3DCD3] dark:border-[#3C3530] space-y-2.5">
                    <h4 className="text-xs font-bold text-[#1E1A17] dark:text-[#FAF8F5] flex items-center gap-1.5">
                      <span>🎯</span>
                      <span>Actionable Creator Recreation Ideas</span>
                    </h4>
                    <div className="space-y-2">
                      {analysisResult.recreation_ideas.map((idea, idx) => (
                        <div
                          key={`idea-${idx}-${idea.slice(0, 16)}`}
                          className="flex items-start gap-2.5 p-2 rounded-lg bg-[#FAF8F5] dark:bg-[#1A1613] border border-[#E3DCD3]/50 dark:border-[#3C3530]/50"
                        >
                          <span className="w-5 h-5 rounded-full bg-[#FF5338] text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="text-xs font-medium text-[#1E1A17] dark:text-[#FAF8F5] leading-relaxed">
                            {idea}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* 6. Project Destination Selector */}
              <div className="p-3.5 rounded-xl border border-[#E3DCD3] dark:border-[#3C3530] bg-[#FAF8F5] dark:bg-[#25201C] space-y-1.5">
                <label className="text-xs font-bold text-[#58524C] dark:text-[#A89F95] block">
                  Save Destination
                </label>
                <select
                  value={targetProjectId}
                  onChange={(e) => setTargetProjectId(e.target.value)}
                  className="w-full h-9 px-3 text-xs font-semibold rounded-lg border border-[#E3DCD3] dark:border-[#3C3530] bg-white dark:bg-[#1E1A17] text-[#1E1A17] dark:text-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#FF5338]"
                >
                  <option value="">
                    Global Vault (Shared Across Projects)
                  </option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      Project: {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions Footer - Pinned */}
        <div className="p-4 border-t border-[#E3DCD3] dark:border-[#3C3530] flex items-center justify-between bg-[#FAF8F5] dark:bg-[#25201C] shrink-0">
          {!analysisResult ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-[#58524C] dark:text-[#A89F95] hover:text-[#1E1A17] dark:hover:text-[#FAF8F5] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={analyzeMutation.isPending || isCompressingImage}
                className="px-5 py-2.5 rounded-xl bg-[#FF5338] hover:bg-[#d93820] text-white text-xs font-bold tactile-btn shadow-sm transition-transform active:scale-95 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {analyzeMutation.isPending ? (
                  <>
                    <span className="animate-spin text-sm">⏳</span>
                    <span>Analyzing Hook...</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>Analyze Hook</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setAnalysisResult(null)}
                className="px-4 py-2 text-xs font-bold text-[#58524C] dark:text-[#A89F95] hover:text-[#1E1A17] dark:hover:text-[#FAF8F5] cursor-pointer"
              >
                ← Analyze Another
              </button>
              <button
                type="button"
                onClick={handleSaveToVault}
                disabled={createInspiration.isPending || isSavedSuccess}
                className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold tactile-btn shadow-sm transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                  isSavedSuccess
                    ? "bg-emerald-600 hover:bg-emerald-600"
                    : "bg-[#059669] hover:bg-[#047857]"
                }`}
              >
                {createInspiration.isPending ? (
                  <span>Saving...</span>
                ) : isSavedSuccess ? (
                  <span>✓ Saved to Vault!</span>
                ) : (
                  <>
                    <span>Save to Vault</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

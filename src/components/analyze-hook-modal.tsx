"use client";

import { ConceptSkeletonLoader } from "@/components/ui/concept-skeleton-loader";
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
}: AnalyzeHookModalProps) {
  // Image states
  const [imageBase64, setImageBase64] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [manualNotes, setManualNotes] = useState("");
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

  const analyzeMutation = useAnalyzeHook();
  const createInspiration = useCreateInspiration();

  // Reset or initialize when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsSavedSuccess(false);
      setSaveError(null);
    } else {
      setAnalysisResult(null);
      setImageBase64("");
      setImagePreview("");
      setManualNotes("");
      setCopiedField(null);
      setIsDragging(false);
    }
  }, [isOpen]);

  // Global clipboard paste listener (Cmd+V / Ctrl+V)
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      // Don't intercept paste if user is typing in an input or textarea
      const activeEl = document.activeElement;
      if (
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            handleImageFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isOpen]);

  if (!isOpen) return null;

  // Copy helper
  const copyToClipboard = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(identifier);
    setTimeout(() => {
      setCopiedField((prev) => (prev === identifier ? null : prev));
    }, 2000);
  };

  // Client-side downscaler
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
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleAnalyze = async () => {
    setSaveError(null);

    if (!imageBase64) {
      setSaveError("Please select or paste a thumbnail image to analyze.");
      return;
    }

    try {
      const response = await analyzeMutation.mutateAsync({
        inputType: "image",
        imageBase64,
        manualText: manualNotes.trim() || undefined,
      });

      setAnalysisResult(response);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to analyze thumbnail hook.";
      setSaveError(msg);
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
        thumbnailUrl: analysisResult.thumbnailUrl || imageBase64 || "",
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

  return (
    <dialog
      open
      aria-label="AI Hook Breakdown"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/35 m-0 h-full w-full max-w-none border-0"
    >
      <div className="bg-[#FCFAF7] dark:bg-[#1C1815] border border-black/[0.08] dark:border-white/[0.08] text-[#1E1A17] dark:text-[#FAF8F5] rounded-3xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl shadow-black/25 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Apple-Style Deferential Header */}
        <div className="flex items-center justify-between px-6 sm:px-7 pt-5 pb-3 border-b border-black/[0.04] dark:border-white/[0.05]">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-[#1E1A17] dark:text-white">
              AI Hook Breakdown
            </h2>
            <p className="text-xs text-[#8C8379] dark:text-[#A89F95] mt-0.5">
              Analyze retention psychology and visual contrast from any
              thumbnail.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-[#8C8379] hover:text-[#1E1A17] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Body with Fixed Height Stability */}
        <div className="p-6 sm:p-7 space-y-5 overflow-y-auto flex-1 min-h-[440px]">
          {/* Error Banner */}
          {saveError && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5">
              <span className="font-semibold">Error:</span>
              <p className="flex-1 leading-relaxed">{saveError}</p>
            </div>
          )}

          {analyzeMutation.isPending ? (
            <ConceptSkeletonLoader
              message="Deconstructing retention hook & visual mechanics..."
              submessage="Evaluating visual anchors, chiaroscuro contrast, and psychological trigger"
            />
          ) : !analysisResult ? (
            /* Thumbnail Ingestion Drop Zone */
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageFile(file);
                  e.target.value = "";
                }}
                className="hidden"
              />

              {imagePreview ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="relative rounded-2xl p-6 bg-black/[0.02] dark:bg-white/[0.02] text-center space-y-3"
                >
                  <div className="relative rounded-2xl overflow-hidden shadow-lg border border-black/[0.06] dark:border-white/[0.08] aspect-video bg-black/5 max-w-md mx-auto">
                    <img
                      src={imagePreview}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-medium text-[#FF5338] hover:underline cursor-pointer"
                    >
                      Change Image
                    </button>
                    <span className="text-[#8C8379]">•</span>
                    <button
                      type="button"
                      onClick={() => {
                        setImageBase64("");
                        setImagePreview("");
                      }}
                      className="text-xs font-medium text-[#8C8379] hover:text-[#1E1A17] dark:hover:text-white cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onDragEnter={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                  }}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full relative rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[260px] border-2 border-dashed ${
                    isDragging
                      ? "border-[#FF5338] bg-[#FF5338]/[0.04]"
                      : "border-black/10 dark:border-white/10 hover:border-[#FF5338]/50 hover:bg-[#FF5338]/[0.02]"
                  }`}
                >
                  <div className="space-y-3 max-w-sm mx-auto">
                    <div className="w-12 h-12 rounded-full bg-[#FF5338]/10 text-[#FF5338] flex items-center justify-center mx-auto text-xl">
                      🖼️Xx
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1E1A17] dark:text-[#FAF8F5]">
                        {isCompressingImage
                          ? "Optimizing image..."
                          : "Drop thumbnail image here"}
                      </p>
                      <p className="text-xs text-[#8C8379] mt-1 leading-relaxed">
                        Click to browse, drag & drop, or press{" "}
                        <kbd className="px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/10 font-mono text-[11px]">
                          ⌘V
                        </kbd>{" "}
                        to paste from clipboard.
                      </p>
                    </div>
                  </div>
                </button>
              )}

              {/* Optional Creator Context Notes */}
              <div className="space-y-1.5 pt-1">
                <label
                  htmlFor="manual-notes-input"
                  className="text-xs font-medium text-[#58524C] dark:text-[#A89F95]"
                >
                  Optional Creator Context / Title Notes
                </label>
                <input
                  id="manual-notes-input"
                  type="text"
                  placeholder="e.g. Finance video, testing high-curiosity packaging"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-white dark:bg-[#201C18] border border-black/[0.08] dark:border-white/[0.08] focus:border-[#FF5338] text-xs text-[#1E1A17] dark:text-white outline-none"
                />
              </div>

              {/* Action Bar */}
              <div className="flex justify-end items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-9 px-4 rounded-full text-xs font-medium text-[#8C8379] hover:text-[#1E1A17] dark:hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={!imageBase64 || isCompressingImage}
                  className="h-10 px-6 rounded-full bg-[#FF5338] hover:bg-[#E0452C] disabled:opacity-50 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                >
                  {isCompressingImage
                    ? "Optimizing..."
                    : "Analyze Thumbnail Hook"}
                </button>
              </div>
            </div>
          ) : (
            /* Result Breakdown View (No card-in-card nesting) */
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              {/* Header Badges */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span
                    className={`font-semibold px-2.5 py-0.5 rounded-full text-[11px] border ${getStrengthScoreBadgeStyle(
                      analysisResult.strength_score,
                    )}`}
                  >
                    ⭐ {analysisResult.strength_score}/10 Strength
                  </span>
                  <span
                    className={`font-medium px-2.5 py-0.5 rounded-full text-[11px] ${emotionStyle.bg} ${emotionStyle.text}`}
                  >
                    {analysisResult.triggered_emotion}
                  </span>
                  <span className="font-medium px-2.5 py-0.5 rounded-full text-[11px] bg-black/5 dark:bg-white/10 text-[#58524C] dark:text-[#C5BCB2]">
                    🎯{" "}
                    {HOOK_TYPE_LABELS[analysisResult.hook_type] ||
                      analysisResult.hook_type}
                  </span>
                </div>

                <div className="text-xl sm:text-2xl font-bold tracking-tight text-[#1E1A17] dark:text-[#FAF8F5] leading-snug">
                  &ldquo;
                  {analysisResult.perceived_copy || "Visual Hook Detected"}
                  &rdquo;
                </div>

                {analysisResult.score_reason && (
                  <p className="text-xs text-[#8C8379] leading-relaxed">
                    {analysisResult.score_reason}
                  </p>
                )}
              </div>

              {/* Psychological Breakdown Surface */}
              <div className="rounded-2xl bg-black/[0.025] dark:bg-white/[0.03] p-4 sm:p-5 space-y-3">
                <div className="text-xs font-semibold text-[#1E1A17] dark:text-white">
                  Why It Works
                </div>
                <p className="text-xs text-[#58524C] dark:text-[#C5BCB2] leading-relaxed">
                  {analysisResult.why_it_works}
                </p>

                {analysisResult.hook_formula && (
                  <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.05] flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8C8379] block mb-0.5">
                        Hook Formula Template
                      </span>
                      <code className="text-xs font-mono font-medium text-[#1E1A17] dark:text-white block truncate">
                        {analysisResult.hook_formula}
                      </code>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(analysisResult.hook_formula, "formula")
                      }
                      className="h-7 px-3 rounded-full text-xs font-medium bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[#1E1A17] dark:text-white transition-colors cursor-pointer shrink-0"
                    >
                      {copiedField === "formula" ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                )}
              </div>

              {/* Improvements, Title Variants, Recreation Ideas & Risk Flags */}
              <div className="space-y-4 text-xs text-[#58524C] dark:text-[#B5ACA2]">
                {/* Actionable Recommendations */}
                {analysisResult.improvements?.length > 0 && (
                  <div className="space-y-2">
                    <span className="font-semibold text-[#1E1A17] dark:text-white text-xs block">
                      Key Recommendations
                    </span>
                    <ul className="space-y-1.5">
                      {analysisResult.improvements.map((improvement, idx) => (
                        <li
                          key={`imp-${idx}-${improvement.slice(0, 16)}`}
                          className="flex items-start gap-2 p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02]"
                        >
                          <span className="text-[#FF5338] font-bold text-xs shrink-0 mt-0.5">
                            •
                          </span>
                          <span className="leading-relaxed flex-1 text-xs">
                            {improvement}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Alternative Title Variants */}
                {analysisResult.title_variants?.length > 0 && (
                  <div className="space-y-2">
                    <span className="font-semibold text-[#1E1A17] dark:text-white text-xs block">
                      Alternative Title Variants
                    </span>
                    <div className="space-y-1.5">
                      {analysisResult.title_variants.map((variant) => (
                        <div
                          key={`var-${variant.slice(0, 24)}`}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02]"
                        >
                          <span className="leading-snug flex-1 text-xs">
                            {variant}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(variant, variant)}
                            className="text-[11px] font-medium text-[#8C8379] hover:text-[#1E1A17] dark:hover:text-white cursor-pointer shrink-0"
                          >
                            {copiedField === variant ? "✓" : "Copy"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actionable Recreation Ideas */}
                {analysisResult.recreation_ideas?.length > 0 && (
                  <div className="space-y-2">
                    <span className="font-semibold text-[#1E1A17] dark:text-white text-xs block">
                      Recreation Formulas
                    </span>
                    <div className="space-y-1.5">
                      {analysisResult.recreation_ideas.map((idea, idx) => (
                        <div
                          key={`idea-${idx}-${idea.slice(0, 16)}`}
                          className="flex items-start gap-2.5 p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02]"
                        >
                          <span className="w-4 h-4 rounded-full bg-[#FF5338]/10 text-[#FF5338] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed flex-1 text-xs">
                            {idea}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risk Flags if any */}
                {analysisResult.risk_flags &&
                  analysisResult.risk_flags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {analysisResult.risk_flags.map((flag) => (
                        <span
                          key={flag}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                        >
                          ⚠️ {RISK_FLAG_LABELS[flag] || flag}
                        </span>
                      ))}
                    </div>
                  )}
              </div>

              {/* Save Destination & Actions */}
              <div className="pt-3 border-t border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#8C8379]">Save to:</span>
                  <select
                    value={targetProjectId}
                    onChange={(e) => setTargetProjectId(e.target.value)}
                    className="h-8 px-2.5 rounded-lg text-xs bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] text-[#1E1A17] dark:text-white outline-none cursor-pointer"
                  >
                    <option value="">Global Vault</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAnalysisResult(null);
                      setImageBase64("");
                      setImagePreview("");
                    }}
                    className="h-9 px-4 rounded-full text-xs font-medium text-[#8C8379] hover:text-[#1E1A17] dark:hover:text-white transition-colors cursor-pointer"
                  >
                    ← Analyze Another
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveToVault}
                    disabled={createInspiration.isPending || isSavedSuccess}
                    className={`h-9 px-5 rounded-full text-xs font-semibold text-white transition-all cursor-pointer shadow-xs ${
                      isSavedSuccess
                        ? "bg-emerald-600"
                        : "bg-[#059669] hover:bg-[#047857]"
                    }`}
                  >
                    {createInspiration.isPending
                      ? "Saving..."
                      : isSavedSuccess
                        ? "✓ Saved to Vault"
                        : "Save to Vault"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}

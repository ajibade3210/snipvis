"use client";

import { ThumbnailPromptConceptCard } from "@/components/thumbnail-prompt-concept-card";
import { ConceptSkeletonLoader } from "@/components/ui/concept-skeleton-loader";
import {
  DEFAULT_THUMBNAIL_CONCEPT_OPTION,
  THUMBNAIL_CONCEPT_OPTIONS,
} from "@/constants/thumbnail-options";
import { useGenerateThumbnailPrompt } from "@/hooks/use-thumbnail-prompt";
import type {
  SubjectMode,
  ThumbnailPromptConcept,
} from "@/types/thumbnail-prompt";
import { useEffect, useState } from "react";

interface ThumbnailPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic: string;
  hook?: string | null;
  channelName?: string | null;
}

export function ThumbnailPromptModal({
  isOpen,
  onClose,
  initialTopic,
  hook,
  channelName,
}: ThumbnailPromptModalProps) {
  const [topic, setTopic] = useState(initialTopic);
  const [subject, setSubject] = useState<SubjectMode>("generic-character");
  const [channelFormula, setChannelFormula] = useState("");
  const [showFormulaInput, setShowFormulaInput] = useState(false);
  const [style, setStyle] = useState<
    "cinematic" | "hyper_realistic" | "illustrative_3d" | "minimalist_bold"
  >("cinematic");
  const [selectedOption, setSelectedOption] = useState<number>(1);
  const [conceptsByOption, setConceptsByOption] = useState<
    Record<number, ThumbnailPromptConcept>
  >({});
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const generateMutation = useGenerateThumbnailPrompt();

  useEffect(() => {
    if (isOpen) {
      setTopic(initialTopic);
      setErrorMessage(null);
      setIsEditingSettings(false);
      setConceptsByOption({});
      setSelectedOption(1);
    }
  }, [isOpen, initialTopic]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentOptionMeta =
    THUMBNAIL_CONCEPT_OPTIONS.find((opt) => opt.id === selectedOption) ||
    DEFAULT_THUMBNAIL_CONCEPT_OPTION;

  const activeConcept = conceptsByOption[selectedOption];
  const hasAnyConcept = Object.keys(conceptsByOption).length > 0;
  const isFormVisible = !hasAnyConcept || isEditingSettings;

  const handleGenerate = async (targetOptionId?: number) => {
    if (!topic.trim()) return;
    const optionToRun = targetOptionId ?? selectedOption;
    setErrorMessage(null);
    try {
      const result = await generateMutation.mutateAsync({
        topic: topic.trim(),
        hook: hook || undefined,
        channelName: channelName || undefined,
        subject,
        channelFormula: channelFormula.trim() || undefined,
        style,
        optionIndex: optionToRun,
      });

      const concept = result.concept || result.concepts?.[0];
      if (concept) {
        setConceptsByOption((prev) => ({
          ...prev,
          [optionToRun]: concept,
        }));
      }
      setSelectedOption(optionToRun);
      setIsEditingSettings(false);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to generate thumbnail concept";
      setErrorMessage(msg);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <dialog
      open
      aria-label="Thumbnail Prompt Generator"
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
              Thumbnail Prompt Generator
            </h2>
            <p className="text-xs text-[#8C8379] dark:text-[#A89F95] mt-0.5">
              Select an angle to generate a targeted concept.
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

        {/* Modal Body with Fixed Height Stability */}
        <div className="p-6 sm:p-7 space-y-5 overflow-y-auto flex-1 min-h-[440px]">
          {/* Segmented Pill Control (Options 1, 2, 3) */}
          <div className="flex items-center gap-1 p-1 bg-black/[0.04] dark:bg-white/[0.05] rounded-2xl">
            {THUMBNAIL_CONCEPT_OPTIONS.map((opt) => {
              const isSelected = selectedOption === opt.id;
              const isGenerated = Boolean(conceptsByOption[opt.id]);
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={generateMutation.isPending}
                  onClick={() => setSelectedOption(opt.id)}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 truncate ${
                    isSelected
                      ? "bg-white dark:bg-[#2A2420] text-[#1E1A17] dark:text-white shadow-xs"
                      : "text-[#8C8379] hover:text-[#1E1A17] dark:hover:text-white"
                  }`}
                >
                  <span className="opacity-60">{opt.id}.</span>
                  <span className="truncate">{opt.name}</span>
                  {isGenerated ? (
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"
                      title="Generated"
                    />
                  ) : (
                    <span
                      className="w-1.5 h-1.5 rounded-full border border-black/20 dark:border-white/20 shrink-0"
                      title="Not yet generated"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Collapsed Setup Summary (when concepts exist and not editing) */}
          {hasAnyConcept && !isEditingSettings && (
            <div className="flex items-center justify-between py-1 px-1 text-xs text-[#8C8379]">
              <div className="truncate flex-1 pr-3">
                <span className="font-medium text-[#1E1A17] dark:text-white">
                  {topic}
                </span>
                <span className="mx-1.5">•</span>
                <span>
                  {subject} · {style}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingSettings(true)}
                className="text-xs font-medium text-[#FF5338] hover:underline cursor-pointer shrink-0"
              >
                Edit Setup
              </button>
            </div>
          )}

          {/* Full Setup Form (when no concepts or user clicks Edit Setup) */}
          {isFormVisible && (
            <div className="space-y-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] p-5">
              <div className="space-y-1.5">
                <label
                  htmlFor="topic-prompt-input"
                  className="text-xs font-medium text-[#58524C] dark:text-[#A89F95]"
                >
                  Video Topic / Title Premise
                </label>
                <input
                  id="topic-prompt-input"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter your video topic premise..."
                  className="w-full h-10 px-3.5 rounded-xl bg-white dark:bg-[#201C18] border border-black/[0.08] dark:border-white/[0.08] focus:border-[#FF5338] text-xs text-[#1E1A17] dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="subject-prompt-select"
                    className="text-xs font-medium text-[#58524C] dark:text-[#A89F95]"
                  >
                    Subject Mode
                  </label>
                  <select
                    id="subject-prompt-select"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value as SubjectMode)}
                    className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#201C18] border border-black/[0.08] dark:border-white/[0.08] text-xs text-[#1E1A17] dark:text-white outline-none cursor-pointer"
                  >
                    <option value="generic-character">Generic Character</option>
                    <option value="reference-face">
                      Reference Face (Creator)
                    </option>
                    <option value="no-face">
                      No Face (Hero Object / Scene)
                    </option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="style-prompt-select"
                    className="text-xs font-medium text-[#58524C] dark:text-[#A89F95]"
                  >
                    Visual Style
                  </label>
                  <select
                    id="style-prompt-select"
                    value={style}
                    onChange={(e) =>
                      setStyle(
                        e.target.value as
                          | "cinematic"
                          | "hyper_realistic"
                          | "illustrative_3d"
                          | "minimalist_bold",
                      )
                    }
                    className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#201C18] border border-black/[0.08] dark:border-white/[0.08] text-xs text-[#1E1A17] dark:text-white outline-none cursor-pointer"
                  >
                    <option value="cinematic">Cinematic</option>
                    <option value="hyper_realistic">Macro Photography</option>
                    <option value="illustrative_3d">3D Render</option>
                    <option value="minimalist_bold">Minimalist Bold</option>
                  </select>
                </div>
              </div>

              {/* Optional Formula */}
              {!showFormulaInput && !channelFormula ? (
                <button
                  type="button"
                  onClick={() => setShowFormulaInput(true)}
                  className="text-xs font-medium text-[#FF5338] hover:underline cursor-pointer"
                >
                  + Add Channel Formula / Design Cues (Optional)
                </button>
              ) : (
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor="formula-prompt-input"
                      className="text-xs font-medium text-[#58524C] dark:text-[#A89F95]"
                    >
                      Channel Formula (Optional)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowFormulaInput(false);
                        setChannelFormula("");
                      }}
                      className="text-[11px] text-[#8C8379] hover:text-[#1E1A17] dark:hover:text-white"
                    >
                      Remove
                    </button>
                  </div>
                  <textarea
                    id="formula-prompt-input"
                    rows={2}
                    value={channelFormula}
                    onChange={(e) => setChannelFormula(e.target.value)}
                    placeholder="e.g., Ali Abdaal bright chiaroscuro..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#201C18] border border-black/[0.08] dark:border-white/[0.08] focus:border-[#FF5338] text-xs text-[#1E1A17] dark:text-white outline-none resize-none"
                  />
                </div>
              )}

              <div className="flex justify-end items-center gap-2 pt-1">
                {hasAnyConcept && (
                  <button
                    type="button"
                    onClick={() => setIsEditingSettings(false)}
                    className="h-9 px-4 rounded-full text-xs font-medium text-[#8C8379] hover:text-[#1E1A17] dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleGenerate(selectedOption)}
                  disabled={generateMutation.isPending || !topic.trim()}
                  className="h-9 px-5 rounded-full bg-[#FF5338] hover:bg-[#E0452C] disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  {generateMutation.isPending
                    ? "Generating..."
                    : `Generate Option ${selectedOption}`}
                </button>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5">
              <span className="font-semibold">Error:</span>
              <p className="flex-1 leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {/* Content Body: Loader vs Concept Card vs Empty Slot */}
          {generateMutation.isPending ? (
            <ConceptSkeletonLoader
              message={`Engineering Option ${selectedOption}: ${currentOptionMeta.name}...`}
              submessage="Calibrating chiaroscuro lighting and complementary overlay"
            />
          ) : activeConcept ? (
            <div className="space-y-4">
              <ThumbnailPromptConceptCard
                concept={activeConcept}
                copiedKey={copiedKey}
                onCopy={handleCopy}
              />
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => handleGenerate(selectedOption)}
                  className="text-xs font-medium text-[#8C8379] hover:text-[#FF5338] transition-colors cursor-pointer"
                >
                  Regenerate Option {selectedOption}
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] p-8 text-center space-y-4 flex flex-col items-center justify-center min-h-[300px]">
              <div className="max-w-md space-y-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#FF5338]/10 text-[#FF5338] text-[11px] font-medium tracking-wide">
                  Option {currentOptionMeta.id}: {currentOptionMeta.name}
                </span>
                <p className="text-sm font-medium text-[#1E1A17] dark:text-[#E8E2DC]">
                  {currentOptionMeta.description}
                </p>
                <p className="text-xs text-[#8C8379] leading-relaxed">
                  Angle Focus: {currentOptionMeta.exampleAngle}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleGenerate(selectedOption)}
                disabled={!topic.trim()}
                className="h-10 px-6 rounded-full bg-[#FF5338] hover:bg-[#E0452C] disabled:opacity-50 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
              >
                Generate {currentOptionMeta.name} Concept
              </button>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}

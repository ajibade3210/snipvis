"use client";

import { useGenerateThumbnailPrompt } from "@/hooks/use-thumbnail-prompt";
import type { ThumbnailPromptConcept } from "@/types/thumbnail-prompt";
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
  const [style, setStyle] = useState<
    "cinematic" | "hyper_realistic" | "illustrative_3d" | "minimalist_bold"
  >("cinematic");
  const [concepts, setConcepts] = useState<ThumbnailPromptConcept[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const generateMutation = useGenerateThumbnailPrompt();

  useEffect(() => {
    if (isOpen) {
      setTopic(initialTopic);
    }
  }, [isOpen, initialTopic]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    try {
      const result = await generateMutation.mutateAsync({
        topic: topic.trim(),
        hook: hook || undefined,
        channelName: channelName || undefined,
        style,
      });
      setConcepts(result.concepts);
    } catch (err) {
      console.error("Failed to generate prompt:", err);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs m-0 h-full w-full max-w-none border-0"
    >
      <div className="bg-[#FAF8F5] dark:bg-[#1A1613] border border-[#E3DCD3] dark:border-[#3C3530] text-[#1E1A17] dark:text-[#FAF8F5] rounded-2xl w-full max-w-3xl max-h-[88vh] flex flex-col shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E3DCD3] dark:border-[#2D2824] bg-white dark:bg-[#1E1A17]">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-[#1E1A17] dark:text-white">
              Thumbnail Prompt Generator
            </h2>
            <p className="text-xs text-[#58524C] dark:text-[#A89F95] mt-0.5">
              Generate image prompts with high contrast and empty duration
              corners.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-[#58524C] dark:text-[#A89F95] hover:text-[#1E1A17] dark:hover:text-white hover:bg-[#F1EDE6] dark:hover:bg-[#2A2521] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Controls */}
          <div className="space-y-3 bg-white dark:bg-[#201C18] p-4 rounded-xl border border-[#E3DCD3] dark:border-[#2D2824]">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8 space-y-1.5">
                <label
                  htmlFor="topic-prompt-input"
                  className="text-xs font-medium text-[#58524C] dark:text-[#A89F95]"
                >
                  Video Topic
                </label>
                <input
                  id="topic-prompt-input"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter your video topic or title premise..."
                  className="w-full h-9 px-3 rounded-lg bg-[#FAF8F5] dark:bg-[#1A1613] border border-[#E3DCD3] dark:border-[#3C3530] focus:border-[#FF5338] text-xs text-[#1E1A17] dark:text-white outline-none"
                />
              </div>

              <div className="sm:col-span-4 space-y-1.5">
                <label
                  htmlFor="style-prompt-select"
                  className="text-xs font-medium text-[#58524C] dark:text-[#A89F95]"
                >
                  Style
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
                  className="w-full h-9 px-3 rounded-lg bg-[#FAF8F5] dark:bg-[#1A1613] border border-[#E3DCD3] dark:border-[#3C3530] text-xs text-[#1E1A17] dark:text-white outline-none cursor-pointer"
                >
                  <option value="cinematic">Cinematic</option>
                  <option value="hyper_realistic">Macro Photography</option>
                  <option value="illustrative_3d">3D Render</option>
                  <option value="minimalist_bold">Minimalist Bold</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generateMutation.isPending || !topic.trim()}
                className="h-9 px-4 rounded-lg bg-[#FF5338] hover:bg-[#E0452C] disabled:opacity-50 text-white text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {generateMutation.isPending ? (
                  <>
                    <svg
                      className="animate-spin h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    <span>Generating...</span>
                  </>
                ) : (
                  <span>Generate Prompts</span>
                )}
              </button>
            </div>
          </div>

          {/* Generated Prompts List */}
          {concepts.length > 0 ? (
            <div className="space-y-4">
              {concepts.map((concept, index) => {
                const promptText = concept.prompt.includes("--ar 16:9")
                  ? concept.prompt
                  : `${concept.prompt} --ar 16:9`;
                const isCopied = copiedId === `concept-${concept.id || index}`;

                return (
                  <div
                    key={concept.id || `concept-${index}`}
                    className="p-4 rounded-xl bg-white dark:bg-[#201C18] border border-[#E3DCD3] dark:border-[#2D2824] space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#8C8379]">
                          {index + 1}.
                        </span>
                        <h4 className="text-sm font-semibold text-[#1E1A17] dark:text-white">
                          {concept.conceptName}
                        </h4>
                      </div>
                      {concept.psychologicalAngle && (
                        <span className="text-[11px] text-[#8C8379] dark:text-[#A89F95]">
                          {concept.psychologicalAngle}
                        </span>
                      )}
                    </div>

                    {/* Thumbnail Copy & Idea */}
                    <div className="text-xs space-y-1 text-[#58524C] dark:text-[#C5BCB2]">
                      {concept.thumbnailCopy && (
                        <p>
                          <span className="font-semibold text-[#1E1A17] dark:text-white">
                            Thumbnail Text:{" "}
                          </span>
                          <span className="font-bold text-[#FF5338]">
                            "{concept.thumbnailCopy}"
                          </span>
                        </p>
                      )}
                      {concept.visualAnalogy && (
                        <p>
                          <span className="font-semibold text-[#1E1A17] dark:text-white">
                            Concept:{" "}
                          </span>
                          <span>{concept.visualAnalogy}</span>
                        </p>
                      )}
                    </div>

                    {/* Prompt Box */}
                    <div className="p-3 rounded-lg bg-[#FAF8F5] dark:bg-[#14110F] border border-[#E3DCD3] dark:border-[#26211C] font-mono text-xs text-[#1E1A17] dark:text-[#E6E1DC] leading-relaxed select-all">
                      {promptText}
                    </div>

                    {/* Action Footer: Single Copy Button */}
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            promptText,
                            `concept-${concept.id || index}`,
                          )
                        }
                        className="h-8 px-3 rounded-lg bg-[#1E1A17] dark:bg-[#FAF8F5] hover:bg-[#332C26] dark:hover:bg-white text-white dark:text-[#1E1A17] text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <span>{isCopied ? "✓ Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-[#E3DCD3] dark:border-[#2D2824] rounded-xl p-6 text-[#8C8379]">
              <p className="text-xs font-medium text-[#1E1A17] dark:text-white">
                Ready to generate prompts
              </p>
              <p className="text-[11px] mt-1 text-[#58524C] dark:text-[#8C8379]">
                Enter a topic above and click "Generate Prompts".
              </p>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}

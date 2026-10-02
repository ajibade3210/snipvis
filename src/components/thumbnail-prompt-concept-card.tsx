"use client";

import type { ThumbnailPromptConcept } from "@/types/thumbnail-prompt";
import { useState } from "react";

interface ThumbnailPromptConceptCardProps {
  concept: ThumbnailPromptConcept;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
}

export function ThumbnailPromptConceptCard({
  concept,
  copiedKey,
  onCopy,
}: ThumbnailPromptConceptCardProps) {
  const [showStrategy, setShowStrategy] = useState(false);
  const copyKey = `concept-${concept.id}`;
  const isCopied = copiedKey === copyKey;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Hero Packaging Headline */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="font-semibold text-[#FF5338] bg-[#FF5338]/10 px-2 py-0.5 rounded-full text-[11px]">
            {concept.emotionalTrigger}
          </span>
          <span className="text-[#8C8379] dark:text-[#A89F95] font-medium text-[11px]">
            {concept.copyMechanism}
          </span>
          <span className="text-[#8C8379] dark:text-[#6E665E]">•</span>
          <span className="text-[#8C8379] dark:text-[#A89F95] text-[11px]">
            Angle: {concept.psychologicalAngle}
          </span>
        </div>

        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1E1A17] dark:text-[#FAF8F5] leading-snug">
          &ldquo;{concept.thumbnailCopy}&rdquo;
        </div>

        <p className="text-xs text-[#58524C] dark:text-[#B5ACA2] leading-relaxed max-w-2xl">
          <strong className="text-[#1E1A17] dark:text-white font-medium">
            Visual Analogy:{" "}
          </strong>
          {concept.visualAnalogy}
          <span className="text-[#8C8379] mx-1.5">•</span>
          <span className="text-[#8C8379] dark:text-[#A89F95]">
            {concept.colorScheme}
          </span>
        </p>
      </div>

      {/* Hero Image Generation Prompt Surface */}
      <div className="rounded-2xl bg-black/[0.025] dark:bg-white/[0.03] p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#1E1A17] dark:text-white">
              Image Generation Prompt
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-[#8C8379] dark:text-[#A89F95]">
              16:9
            </span>
          </div>

          <button
            type="button"
            onClick={() => onCopy(concept.prompt, copyKey)}
            className={`h-7 px-3 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              isCopied
                ? "bg-emerald-600 text-white"
                : "bg-[#1E1A17] dark:bg-white hover:bg-[#332C26] dark:hover:bg-white/90 text-white dark:text-[#1E1A17] shadow-xs"
            }`}
          >
            {isCopied ? "✓ Copied" : "Copy Prompt"}
          </button>
        </div>

        <p className="font-mono text-xs text-[#2A2420] dark:text-[#DCD5CE] leading-relaxed select-all">
          {concept.prompt}
        </p>
      </div>

      {/* Deferential Collapsible Strategy Section */}
      <div className="border-t border-black/[0.05] dark:border-white/[0.06] pt-3">
        <button
          type="button"
          onClick={() => setShowStrategy((prev) => !prev)}
          className="w-full flex items-center justify-between text-xs font-medium text-[#8C8379] hover:text-[#1E1A17] dark:hover:text-white transition-colors cursor-pointer py-1"
        >
          <span>Composition & Psychology Breakdown</span>
          <span className="text-[11px] opacity-75">
            {showStrategy ? "▲ Hide" : "▼ Show details"}
          </span>
        </button>

        {showStrategy && (
          <div className="pt-3 space-y-4 text-xs text-[#58524C] dark:text-[#B5ACA2] animate-in fade-in-50 duration-150">
            {/* Rule of Three Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02]">
              <div>
                <span className="font-medium text-[#1E1A17] dark:text-white block text-[11px] mb-0.5">
                  Anchor (Focal Point)
                </span>
                <span className="text-[11px] text-[#8C8379] dark:text-[#A89F95]">
                  {concept.ruleOfThreeBreakdown.anchor}
                </span>
              </div>
              <div>
                <span className="font-medium text-[#1E1A17] dark:text-white block text-[11px] mb-0.5">
                  Context (Setting)
                </span>
                <span className="text-[11px] text-[#8C8379] dark:text-[#A89F95]">
                  {concept.ruleOfThreeBreakdown.context}
                </span>
              </div>
              <div>
                <span className="font-medium text-[#1E1A17] dark:text-white block text-[11px] mb-0.5">
                  Accent (Contrast)
                </span>
                <span className="text-[11px] text-[#8C8379] dark:text-[#A89F95]">
                  {concept.ruleOfThreeBreakdown.accent}
                </span>
              </div>
            </div>

            {/* Psychological & Honesty Details */}
            <div className="space-y-1.5 text-xs px-1">
              <p>
                <strong className="text-[#1E1A17] dark:text-white font-medium">
                  Squint Test:{" "}
                </strong>
                {concept.squintTestFeature}
              </p>
              <p>
                <strong className="text-[#1E1A17] dark:text-white font-medium">
                  Honesty Check:{" "}
                </strong>
                {concept.honestyCheck}
              </p>
              <p>
                <strong className="text-[#1E1A17] dark:text-white font-medium">
                  Pitfall to Avoid:{" "}
                </strong>
                {concept.pitfallToAvoid}
              </p>
              {concept.sensitiveTopicNote && (
                <p className="text-amber-600 dark:text-amber-400 font-medium">
                  ⚠️ Sensitive Note: {concept.sensitiveTopicNote}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

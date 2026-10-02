"use client";

import { ScriptEditor } from "@/components/script-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProject, useUpdateProject } from "@/hooks/use-projects";
import { updateProjectSchema } from "@/lib/validations";
import { useEffect, useState } from "react";

interface BriefViewProps {
  projectId: string;
  onPreview?: () => void;
}

export function BriefView({ projectId, onPreview }: BriefViewProps) {
  const { data: project, isLoading } = useProject(projectId);
  const updateMutation = useUpdateProject();

  const [description, setDescription] = useState("");
  const [hook, setHook] = useState("");
  const [scriptLink, setScriptLink] = useState("");
  const [scriptContent, setScriptContent] = useState("");

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (project) {
      setDescription(project.description ?? "");
      setHook(project.hook ?? "");
      setScriptLink(project.scriptLink ?? "");
      setScriptContent(project.script ?? "");
    }
  }, [project]);

  const [currentId, setCurrentId] = useState(projectId);
  if (currentId !== projectId) {
    setCurrentId(projectId);
    setFeedback(null);
  }

  const handleScriptChange = (newScript: string) => {
    setScriptContent(newScript);
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Loading creative brief...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Project not found.
      </div>
    );
  }

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setFeedback(null);

    const payload = {
      description: description.trim() || null,
      hook: hook.trim() || null,
      scriptLink: scriptLink.trim() || null,
      script: scriptContent.trim() || null,
    };

    const result = updateProjectSchema.safeParse(payload);
    if (!result.success) {
      setFeedback({
        type: "error",
        text: result.error.errors[0]?.message || "Validation error",
      });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: projectId,
        data: result.data,
      });
      setFeedback({
        type: "success",
        text: "Creative brief saved!",
      });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        text:
          err instanceof Error ? err.message : "Failed to update project brief",
      });
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-5xl mx-auto">
      {/* Save Actions, Preview & Feedback */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-2">
          {feedback ? (
            <span
              className={`text-xs px-3 py-1 rounded-full font-medium ${
                feedback.type === "success"
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                  : "bg-destructive/10 text-destructive border border-destructive/20"
              }`}
            >
              {feedback.text}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2.5 ml-auto sm:ml-0">
          {onPreview && (
            <button
              type="button"
              onClick={onPreview}
              title="Preview script as a standalone clean view"
              className="flex items-center gap-1.5 h-9 px-3.5 sm:px-4 rounded-full text-xs font-semibold bg-black/[0.03] dark:bg-white/[0.04] text-[#1C1815] dark:text-[#FBF9F5] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-all cursor-pointer border border-black/[0.08] dark:border-white/[0.1] shadow-xs active:scale-[0.98]"
            >
              <svg
                className="w-3.5 h-3.5 text-[#8C827A] dark:text-[#A89F97]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.641 0-8.58-3.007-9.964-7.178z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>Preview</span>
            </button>
          )}

          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="h-9 px-4 sm:px-5 rounded-full text-xs font-semibold shadow-sm"
          >
            {updateMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Production Link & Project Summary */}
      <div className="rounded-2xl sm:rounded-3xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#1E1A17] p-4 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <label className="text-xs font-medium text-[#1C1815] dark:text-[#FBF9F5] flex items-center gap-1.5">
                <span>📝</span> Production Link
              </label>
              {scriptLink ? (
                <a
                  href={scriptLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-[#FF5338] hover:underline font-medium"
                >
                  Open external document ↗
                </a>
              ) : null}
            </div>
            <input
              type="url"
              placeholder="https://docs.google.com/document/d/..."
              value={scriptLink}
              onChange={(e) => setScriptLink(e.target.value)}
              className="w-full h-9 px-3.5 text-xs rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.025] dark:bg-white/[0.025] text-[#1C1815] dark:text-white placeholder:text-[#A89F97] focus:outline-none focus:border-[#FF5338] transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#1C1815] dark:text-[#FBF9F5] flex items-center gap-1.5">
              <span>📋</span> Project Summary
            </label>
            <input
              type="text"
              placeholder="Brief project goal or summary"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-9 px-3.5 text-xs rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.025] dark:bg-white/[0.025] text-[#1C1815] dark:text-white placeholder:text-[#A89F97] focus:outline-none focus:border-[#FF5338] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Retention Hook */}
      <div className="rounded-2xl sm:rounded-3xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#1E1A17] p-4 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
        {(() => {
          const words = hook.trim() ? hook.trim().split(/\s+/).length : 0;
          const spokenSeconds = Math.round((words / 145) * 60);
          const isOptimal = words > 0 && spokenSeconds <= 8;
          const isCaution = spokenSeconds > 8 && spokenSeconds <= 12;
          const isWarning = spokenSeconds > 12;

          return (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-medium text-[#1C1815] dark:text-[#FBF9F5] flex items-center gap-1.5">
                  <span>🎣</span> Opening Hook (0:00 - 0:10)
                </label>
                {words > 0 && (
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-mono font-medium border flex flex-wrap items-center gap-1.5 ${
                        isOptimal
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                          : isCaution
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
                            : "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20"
                      }`}
                    >
                      <span>⏱️ ~{spokenSeconds}s</span>
                      <span className="text-[10px] opacity-75">
                        ({words} words @ 145 WPM)
                      </span>
                      <span>•</span>
                      <span>
                        {isOptimal
                          ? "Optimal Retention"
                          : isCaution
                            ? "Borderline Pacing"
                            : "Drop-Off Risk (>12s)"}
                      </span>
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-1 text-xs text-[#8C827A] dark:text-[#A89F97]">
                <p className="hidden sm:block">
                  Word-for-word script of the opening delivery designed to stop
                  the scroll and validate the thumbnail promise.
                </p>
                <span className="text-[11px] text-[#FF5338] font-medium shrink-0">
                  ⚡ 60% of drop-off happens in the first 10s
                </span>
              </div>
            </>
          );
        })()}
        <textarea
          rows={3}
          placeholder="e.g. In the next 7 minutes, I'm going to prove that 99% of creators are using thumbnails that secretly destroy their click-through rate..."
          value={hook}
          onChange={(e) => setHook(e.target.value)}
          className="w-full p-3.5 text-xs rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.025] dark:bg-white/[0.025] text-[#1C1815] dark:text-white placeholder:text-[#A89F97] focus:outline-none focus:border-[#FF5338] resize-y leading-relaxed transition-colors font-sans"
        />
      </div>

      {/* Full Video Scripting / Content Section */}
      <ScriptEditor
        value={scriptContent}
        onChange={handleScriptChange}
        onSave={() => handleSave()}
        isSaving={updateMutation.isPending}
        placeholder="This is to inform you about ..."
      />
    </form>
  );
}

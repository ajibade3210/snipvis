"use client";

import { ScriptEditor } from "@/components/script-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProject, useUpdateProject } from "@/hooks/use-projects";
import { updateProjectSchema } from "@/lib/validations";
import { useEffect, useState } from "react";

interface BriefViewProps {
  projectId: string;
}

export function BriefView({ projectId }: BriefViewProps) {
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
      {/* Save Actions & Feedback */}
      <div className="flex items-center justify-end gap-3">
        {feedback ? (
          <span
            className={`text-xs px-2.5 py-1 rounded-md font-medium ${
              feedback.type === "success"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-destructive/10 text-destructive border border-destructive/20"
            }`}
          >
            {feedback.text}
          </span>
        ) : null}
        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Production Link & Project Summary */}
      <Card className="border border-border shadow-xs bg-card/60">
        <CardContent className="pt-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <span>📝</span> Production Link
                </label>
                {scriptLink ? (
                  <a
                    href={scriptLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
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
                className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span>📋</span> Project Summary
              </label>
              <input
                type="text"
                placeholder="Brief project goal or summary"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Retention Hook */}
      <Card>
        <CardContent className="pt-5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <span>🎣</span> Opening Hook (0:00 - 0:30)
            </label>
          </div>
          <p className="text-xs text-muted-foreground">
            Word-for-word script of the first 30 seconds designed to stop the
            scroll and set stakes.
          </p>
          <textarea
            rows={3}
            placeholder="e.g. In the next 7 minutes, I'm going to prove that 99% of creators are using thumbnails that secretly destroy their click-through rate..."
            value={hook}
            onChange={(e) => setHook(e.target.value)}
            className="w-full p-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-y leading-relaxed"
          />
        </CardContent>
      </Card>

      {/* Full Video Scripting / Content Section with Save Icon */}
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

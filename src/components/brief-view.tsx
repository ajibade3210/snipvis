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

  const [name, setName] = useState("");
  const [channel, setChannel] = useState("");
  const [description, setDescription] = useState("");
  const [angle, setAngle] = useState("");
  const [hook, setHook] = useState("");
  const [scriptLink, setScriptLink] = useState("");
  const [notes, setNotes] = useState("");
  const [scriptContent, setScriptContent] = useState("");

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (project) {
      setName(project.name ?? "");
      setChannel(project.channel ?? "");
      setDescription(project.description ?? "");
      setAngle(project.angle ?? "");
      setHook(project.hook ?? "");
      setScriptLink(project.scriptLink ?? "");
      setNotes(project.notes ?? "");
      setScriptContent(project.script ?? "");
      setFeedback(null);
    }
  }, [project]);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!name.trim()) {
      setFeedback({
        type: "error",
        text: "Project name is required",
      });
      return;
    }

    const payload = {
      name: name.trim(),
      channel: channel.trim() ? channel.trim().replace(/^@/, "") : undefined,
      description: description.trim() || undefined,
      angle: angle.trim() || undefined,
      hook: hook.trim() || undefined,
      scriptLink: scriptLink.trim() || undefined,
      notes: notes.trim() || undefined,
      script: scriptContent.trim() || undefined,
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
        text: "Project details, creative brief, and script saved!",
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
      {/* Top Header & Save Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight">
              {name || project.name}
            </h2>
            {channel ? (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-secondary text-foreground font-semibold">
                @{channel.replace(/^@/, "")}
              </span>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Creative Brief & Script Strategy • Edit metadata, core angle, hook,
            and full script.
          </p>
        </div>
        <div className="flex items-center gap-3">
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
            {updateMutation.isPending ? "Saving..." : "Save Brief"}
          </Button>
        </div>
      </div>

      {/* Project Identity: Name, Channel & Description */}
      <Card className="border border-border shadow-xs bg-card/60">
        <CardContent className="pt-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span>🏷️</span> Project Name{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Storytelling Formats"
                className="w-full h-9 px-3 text-sm font-semibold rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span>🎯</span> Target Channel
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                  @
                </span>
                <input
                  type="text"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value.replace(/^@/, ""))}
                  placeholder="e.g. DeepDiveDoc"
                  className="w-full h-9 pl-7 pr-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Angle */}
        <Card>
          <CardContent className="pt-5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <span>🎯</span> Unique Video Angle / Premise
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              What is the core contrarian, curiosity-driven, or high-stakes
              angle of this video?
            </p>
            <textarea
              rows={4}
              placeholder="e.g. Instead of explaining quantum computing, build a working 2-qubit simulator out of LEGO to test if normal people can understand it."
              value={angle}
              onChange={(e) => setAngle(e.target.value)}
              className="w-full p-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-y leading-relaxed"
            />
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
              rows={4}
              placeholder="e.g. In the next 7 minutes, I'm going to prove that 99% of creators are using thumbnails that secretly destroy their click-through rate..."
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              className="w-full p-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-y leading-relaxed"
            />
          </CardContent>
        </Card>
      </div>

      {/* Full Video Scripting / Content Section */}
      <ScriptEditor
        value={scriptContent}
        onChange={handleScriptChange}
        placeholder="This is to inform you about ..."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Script & Docs Link */}
        <Card className="md:col-span-1">
          <CardContent className="pt-5 space-y-3">
            <div>
              <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <span>📝</span> Production Link
              </label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Link to Google Docs, Notion, or Figma.
              </p>
            </div>
            <input
              type="url"
              placeholder="https://docs.google.com/document/d/..."
              value={scriptLink}
              onChange={(e) => setScriptLink(e.target.value)}
              className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {scriptLink ? (
              <a
                href={scriptLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
              >
                Open external document ↗
              </a>
            ) : null}

            <div className="pt-2 border-t border-border">
              <label className="text-xs font-semibold text-foreground block mb-1">
                Project Summary / Notes
              </label>
              <input
                type="text"
                placeholder="Brief project goal or summary"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-8 px-2.5 text-xs rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </CardContent>
        </Card>

        {/* Deep Research & Production Notes */}
        <Card className="md:col-span-2">
          <CardContent className="pt-5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <span>📋</span> Production, B-Roll & Research Notes
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              Pacing cues, visual reference links, sound effects, interview
              quotes, and editing style guide.
            </p>
            <textarea
              rows={6}
              placeholder="- Visual style: Fast-paced jump cuts with 3D camera tracker&#10;- B-roll needs: Macro shots of mechanical keyboard, drone shot over city&#10;- Target duration: 11-13 minutes&#10;- CTA: Free Notion template in description"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-y leading-relaxed font-mono text-xs"
            />
          </CardContent>
        </Card>
      </div>
    </form>
  );
}

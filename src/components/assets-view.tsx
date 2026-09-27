"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAssetsByProject } from "@/hooks/use-assets";
import { useState } from "react";
import { AssetModal } from "./asset-modal";

interface AssetsViewProps {
  projectId: string;
  projectName?: string;
  projects: Array<{ id: string; name: string }>;
}

export function AssetsView({
  projectId,
  projectName,
  projects,
}: AssetsViewProps) {
  const { data: assets = [], isLoading } = useAssetsByProject(projectId);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const getSourceBadgeColor = (source?: string) => {
    switch (source) {
      case "PEXELS":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "PIXABAY":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "MIXKIT":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case "YOUTUBE":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case "VIDEO":
        return "🎬 Video";
      case "AUDIO":
        return "🎵 Audio";
      case "IMAGE":
        return "🖼️ Image";
      case "FONT":
        return "🔤 Font";
      default:
        return "📎 Asset";
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Loading assets...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Project Assets</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Media b-roll, audio, fonts, and licensed resources for{" "}
            {projectName || "this project"}.
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>+ Add Asset</Button>
      </div>

      {assets.length === 0 ? (
        <Card className="text-center py-12 px-4 border-dashed">
          <CardContent className="pt-6">
            <span className="text-3xl block mb-2">📎</span>
            <h3 className="font-semibold text-base mb-1">No Assets Yet</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto mb-4">
              Add b-roll clips from Pexels, soundtrack cues from Mixkit, or font
              references to organize production.
            </p>
            <Button variant="outline" onClick={() => setIsAddOpen(true)}>
              + Add First Asset
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset) => {
            const isImage =
              asset.type === "IMAGE" ||
              /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(asset.url);

            return (
              <Card
                key={asset.id}
                className="overflow-hidden flex flex-col justify-between hover:border-foreground/30 transition-all"
              >
                <div>
                  {isImage ? (
                    <div className="aspect-video bg-muted border-b border-border overflow-hidden">
                      <img
                        src={asset.url}
                        alt="Asset media preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-muted/60 border-b border-border flex flex-col items-center justify-center p-4 text-center">
                      <span className="text-2xl mb-1">
                        {asset.type === "VIDEO"
                          ? "🎥"
                          : asset.type === "AUDIO"
                            ? "🎧"
                            : asset.type === "FONT"
                              ? "🔤"
                              : "📁"}
                      </span>
                      <span className="text-xs font-medium text-foreground truncate max-w-[200px]">
                        {getTypeIcon(asset.type)}
                      </span>
                    </div>
                  )}

                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border bg-secondary text-secondary-foreground">
                        {getTypeIcon(asset.type)}
                      </span>
                      {asset.source ? (
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getSourceBadgeColor(
                            asset.source,
                          )}`}
                        >
                          {asset.source}
                        </span>
                      ) : null}
                    </div>

                    {asset.note ? (
                      <p className="text-xs text-foreground/90 font-medium line-clamp-2">
                        {asset.note}
                      </p>
                    ) : null}

                    {asset.licenseText ? (
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <span>📜</span>
                        <span className="truncate">{asset.licenseText}</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-border/50 mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                    {new URL(asset.url).hostname.replace("www.", "")}
                  </span>
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
                  >
                    Open Media ↗
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <AssetModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        projects={projects}
        defaultProjectId={projectId}
      />
    </div>
  );
}

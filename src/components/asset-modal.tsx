"use client";

import { Button } from "@/components/ui/button";
import { useCreateAsset } from "@/hooks/use-assets";
import { createAssetSchema } from "@/lib/validations";

import { mediaService } from "@/services/api/media.service";
import type { AssetSource, AssetType } from "@/types";
import { useEffect, useRef, useState } from "react";

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Array<{ id: string; name: string }>;
  defaultProjectId?: string | null;
}

export function AssetModal({
  isOpen,
  onClose,
  projects,
  defaultProjectId,
}: AssetModalProps) {
  const [url, setUrl] = useState("");
  const [type, setType] = useState<AssetType>("VIDEO");
  const [source, setSource] = useState<AssetSource>("OTHER");
  const [licenseText, setLicenseText] = useState("");
  const [note, setNote] = useState("");
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>(
    defaultProjectId ? [defaultProjectId] : projects[0] ? [projects[0].id] : [],
  );
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createAsset = useCreateAsset();

  useEffect(() => {
    if (isOpen) {
      setSelectedProjectIds(
        defaultProjectId
          ? [defaultProjectId]
          : projects[0]
            ? [projects[0].id]
            : [],
      );
    }
  }, [isOpen, defaultProjectId, projects]);

  if (!isOpen) return null;

  const toggleProject = (id: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const result = await mediaService.uploadMediaFile(file, {
        projectId: selectedProjectIds[0],
      });
      setUrl(result.publicUrl);

      if (file.type.startsWith("video/")) {
        setType("VIDEO");
      } else if (file.type.startsWith("audio/")) {
        setType("AUDIO");
      } else if (file.type.startsWith("image/")) {
        setType("IMAGE");
      } else if (
        file.type.includes("font") ||
        /\.(otf|ttf|woff|woff2)$/i.test(file.name)
      ) {
        setType("FONT");
      } else {
        setType("OTHER");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selectedProjectIds.length === 0) {
      setError("Please select at least one project for this asset.");
      return;
    }

    const payload = {
      url: url.trim(),
      type,
      source,
      licenseText: licenseText.trim() || undefined,
      note: note.trim() || undefined,
      projects: selectedProjectIds.map((projectId) => ({
        projectId,
        note: note.trim() || undefined,
      })),
    };

    const result = createAssetSchema.safeParse(payload);
    if (!result.success) {
      setError(result.error.errors[0]?.message || "Validation failed");
      return;
    }

    try {
      await createAsset.mutateAsync(result.data);
      setUrl("");
      setLicenseText("");
      setNote("");
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create asset");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-card text-card-foreground border border-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in-0 zoom-in-95">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-base">Add Project Asset</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-sm font-semibold px-2 py-1 rounded"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error ? (
            <div className="p-3 text-xs rounded-md bg-destructive/10 text-destructive border border-destructive/20">
              {error}
            </div>
          ) : null}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-foreground">
                Asset Media URL <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="text-xs text-primary hover:underline flex items-center gap-1 font-medium disabled:opacity-50"
              >
                {isUploading ? (
                  <span>Uploading to R2...</span>
                ) : (
                  <span>Upload local file to R2</span>
                )}
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <input
              type="url"
              required
              placeholder="https://... (or click 'Upload local file to R2')"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5 text-foreground">
                Asset Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AssetType)}
                className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="VIDEO">Video Footage</option>
                <option value="AUDIO">Sound Effect / Music</option>
                <option value="IMAGE">Image / Graphic</option>
                <option value="FONT">Typography / Font</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-foreground">
                Source Provider
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as AssetSource)}
                className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="PEXELS">Pexels</option>
                <option value="PIXABAY">Pixabay</option>
                <option value="MIXKIT">Mixkit</option>
                <option value="YOUTUBE">YouTube</option>
                <option value="OTHER">Other / Custom</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5 text-foreground">
              License Info (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. CC0, Free for Commercial with Attribution, etc."
              value={licenseText}
              onChange={(e) => setLicenseText(e.target.value)}
              className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5 text-foreground">
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Use for b-roll at 01:23 hook transition"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Project Multi-select */}
          <div>
            <label className="block text-xs font-medium mb-1.5 text-foreground">
              Assign to Projects <span className="text-red-500">*</span>
            </label>
            {projects.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No projects available. Please create a project first.
              </p>
            ) : (
              <div className="max-h-32 overflow-y-auto p-2 rounded-md border border-input bg-background space-y-1">
                {projects.map((p) => (
                  <label
                    key={p.id}
                    className="flex items-center gap-2 text-xs px-2 py-1 rounded hover:bg-accent cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProjectIds.includes(p.id)}
                      onChange={() => toggleProject(p.id)}
                      className="rounded border-input text-primary"
                    />
                    <span className="truncate">{p.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createAsset.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createAsset.isPending || projects.length === 0}
            >
              {createAsset.isPending ? "Adding..." : "Add Asset"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

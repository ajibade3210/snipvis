"use client";

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
    <dialog
      open
      aria-label="Add Production Asset"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/35 m-0 h-full w-full max-w-none border-0"
    >
      <div className="bg-[#FCFAF7] dark:bg-[#1C1815] border border-black/[0.08] dark:border-white/[0.08] text-[#1E1A17] dark:text-[#FAF8F5] rounded-3xl w-full max-w-lg max-h-[88vh] flex flex-col shadow-2xl shadow-black/25 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Apple-Style Deferential Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-black/[0.04] dark:border-white/[0.05]">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-[#1E1A17] dark:text-white">
              Add Production Asset
            </h3>
            <p className="text-xs text-[#8C8379] dark:text-[#A89F95] mt-0.5">
              Link or upload b-roll, audio, fonts, or graphics to your projects.
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

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 overflow-y-auto flex-1"
        >
          {error && (
            <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
              <span className="font-semibold">Error:</span>
              <p className="flex-1 leading-relaxed">{error}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="asset-url-input"
                className="text-xs font-medium text-[#58524C] dark:text-[#A89F95]"
              >
                Asset Media URL <span className="text-[#FF5338]">*</span>
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="text-xs text-[#FF5338] hover:underline flex items-center gap-1 font-medium disabled:opacity-50 cursor-pointer"
              >
                {isUploading ? (
                  <span>Uploading to R2...</span>
                ) : (
                  <span>Upload local file</span>
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
              id="asset-url-input"
              type="url"
              required
              placeholder="https://... (or click 'Upload local file')"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full h-10 px-3.5 text-xs rounded-xl bg-white dark:bg-[#201C18] border border-black/[0.08] dark:border-white/[0.08] focus:border-[#FF5338] text-[#1E1A17] dark:text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="asset-type-select"
                className="block text-xs font-medium text-[#58524C] dark:text-[#A89F95]"
              >
                Asset Type
              </label>
              <select
                id="asset-type-select"
                value={type}
                onChange={(e) => setType(e.target.value as AssetType)}
                className="w-full h-10 px-3 text-xs rounded-xl bg-white dark:bg-[#201C18] border border-black/[0.08] dark:border-white/[0.08] text-[#1E1A17] dark:text-white outline-none cursor-pointer"
              >
                <option value="VIDEO">Video Footage</option>
                <option value="AUDIO">Sound Effect / Music</option>
                <option value="IMAGE">Image / Graphic</option>
                <option value="FONT">Typography / Font</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="asset-source-select"
                className="block text-xs font-medium text-[#58524C] dark:text-[#A89F95]"
              >
                Source Provider
              </label>
              <select
                id="asset-source-select"
                value={source}
                onChange={(e) => setSource(e.target.value as AssetSource)}
                className="w-full h-10 px-3 text-xs rounded-xl bg-white dark:bg-[#201C18] border border-black/[0.08] dark:border-white/[0.08] text-[#1E1A17] dark:text-white outline-none cursor-pointer"
              >
                <option value="PEXELS">Pexels</option>
                <option value="PIXABAY">Pixabay</option>
                <option value="MIXKIT">Mixkit</option>
                <option value="YOUTUBE">YouTube</option>
                <option value="OTHER">Other / Custom</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="asset-license-input"
              className="block text-xs font-medium text-[#58524C] dark:text-[#A89F95]"
            >
              License Info (Optional)
            </label>
            <input
              id="asset-license-input"
              type="text"
              placeholder="e.g. CC0, Free for Commercial with Attribution, etc."
              value={licenseText}
              onChange={(e) => setLicenseText(e.target.value)}
              className="w-full h-10 px-3.5 text-xs rounded-xl bg-white dark:bg-[#201C18] border border-black/[0.08] dark:border-white/[0.08] focus:border-[#FF5338] text-[#1E1A17] dark:text-white outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="asset-note-input"
              className="block text-xs font-medium text-[#58524C] dark:text-[#A89F95]"
            >
              Note (Optional)
            </label>
            <input
              id="asset-note-input"
              type="text"
              placeholder="e.g. Use for b-roll at 01:23 hook transition"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full h-10 px-3.5 text-xs rounded-xl bg-white dark:bg-[#201C18] border border-black/[0.08] dark:border-white/[0.08] focus:border-[#FF5338] text-[#1E1A17] dark:text-white outline-none"
            />
          </div>

          {/* Project Multi-select */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#58524C] dark:text-[#A89F95]">
              Assign to Projects <span className="text-[#FF5338]">*</span>
            </label>
            {projects.length === 0 ? (
              <p className="text-xs text-[#8C8379] italic">
                No projects available. Please create a project first.
              </p>
            ) : (
              <div className="max-h-32 overflow-y-auto p-2.5 rounded-2xl bg-black/[0.025] dark:bg-white/[0.03] space-y-1">
                {projects.map((p) => (
                  <label
                    key={p.id}
                    className="flex items-center gap-2.5 text-xs px-2.5 py-1.5 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.05] cursor-pointer text-[#1E1A17] dark:text-[#FAF8F5]"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProjectIds.includes(p.id)}
                      onChange={() => toggleProject(p.id)}
                      className="rounded border-black/20 text-[#FF5338] focus:ring-[#FF5338]"
                    />
                    <span className="truncate">{p.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 flex justify-end items-center gap-2 border-t border-black/[0.04] dark:border-white/[0.05]">
            <button
              type="button"
              onClick={onClose}
              disabled={createAsset.isPending}
              className="h-9 px-4 rounded-full text-xs font-medium text-[#8C8379] hover:text-[#1E1A17] dark:hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createAsset.isPending || projects.length === 0}
              className="h-9 px-5 rounded-full bg-[#FF5338] hover:bg-[#E0452C] disabled:opacity-50 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              {createAsset.isPending ? "Adding..." : "Add Asset"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

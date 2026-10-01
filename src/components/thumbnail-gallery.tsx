"use client";

import { PackagingSimulatorModal } from "@/components/packaging-simulator-modal";
import { ThumbnailPromptModal } from "@/components/thumbnail-prompt-modal";
import {
  useAddThumbnail,
  useDeleteThumbnail,
  useSetMainThumbnail,
} from "@/hooks/use-projects";
import { mediaService } from "@/services/api/media.service";
import type { ProjectThumbnailRecord } from "@/types";
import type { SimulatorReferenceItem } from "@/types/packaging-simulator";
import { useRef, useState } from "react";

interface ThumbnailGalleryProps {
  projectId: string;
  projectName: string;
  hook?: string | null;
  channelName?: string | null;
  channelAvatarUrl?: string | null;
  thumbnails?: ProjectThumbnailRecord[];
  referenceInspirations?: SimulatorReferenceItem[];
}

export function ThumbnailGallery({
  projectId,
  projectName,
  hook,
  channelName,
  channelAvatarUrl,
  thumbnails = [],
  referenceInspirations = [],
}: ThumbnailGalleryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const addThumbnailMutation = useAddThumbnail();
  const setMainMutation = useSetMainThumbnail();
  const deleteThumbnailMutation = useDeleteThumbnail();

  const mainThumbnail =
    thumbnails.find((t) => t.isMain) || thumbnails[0] || null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadFeedback(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) {
          throw new Error(`File "${file.name}" is not an image`);
        }

        const uploadResult = await mediaService.uploadMediaFile(file, {
          projectId,
          category: "thumbnails",
        });

        await addThumbnailMutation.mutateAsync({
          projectId,
          data: {
            url: uploadResult.publicUrl,
            label:
              files.length > 1
                ? `Variant ${thumbnails.length + i + 1}`
                : undefined,
          },
        });
      }

      setUploadFeedback({
        type: "success",
        text: `Successfully uploaded ${files.length} thumbnail${files.length > 1 ? "s" : ""}!`,
      });
      setTimeout(() => setUploadFeedback(null), 3500);
    } catch (err: unknown) {
      setUploadFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to upload thumbnail",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSetMain = async (thumbId: string) => {
    try {
      await setMainMutation.mutateAsync({ projectId, thumbId });
      setUploadFeedback({
        type: "success",
        text: "Main thumbnail updated for this project!",
      });
      setTimeout(() => setUploadFeedback(null), 3000);
    } catch (err: unknown) {
      setUploadFeedback({
        type: "error",
        text:
          err instanceof Error ? err.message : "Failed to set main thumbnail",
      });
    }
  };

  const handleDelete = async (thumbId: string) => {
    if (!confirm("Are you sure you want to remove this thumbnail variant?")) {
      return;
    }

    try {
      await deleteThumbnailMutation.mutateAsync({ projectId, thumbId });
      setUploadFeedback({
        type: "success",
        text: "Thumbnail variant removed.",
      });
      setTimeout(() => setUploadFeedback(null), 3000);
    } catch (err: unknown) {
      setUploadFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to delete thumbnail",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3DCD3] dark:border-[#3C3530] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold tracking-tight text-[#1E1A17] dark:text-[#FAF8F5]">
              🖼️ Thumbnail Lab
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-grotesk bg-[#FFEBE7] text-[#b51d07] dark:bg-red-950/40 dark:text-red-300">
              {thumbnails.length} Concept{thumbnails.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsPromptModalOpen(true)}
            className="h-10 px-3.5 rounded-full bg-[#FFD700]/10 hover:bg-[#FFD700]/20 text-[#B45309] dark:text-[#FFD700] text-xs font-bold flex items-center gap-1.5 border border-[#FFD700]/30 tactile-btn shadow-xs cursor-pointer"
          >
            <span>✨</span>
            <span>AI Prompt</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSimulatorOpen(true)}
            className="h-10 px-4 rounded-full bg-white dark:bg-[#25201C] hover:bg-[#F1EDE6] dark:hover:bg-[#322C28] text-[#1E1A17] dark:text-[#FAF8F5] text-xs font-bold flex items-center gap-1.5 border border-[#E3DCD3] dark:border-[#3C3530] tactile-btn shadow-xs cursor-pointer"
          >
            <span>⚡</span>
            <span>Simulate Feed</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="h-10 px-5 rounded-full bg-[#FF5338] text-white text-xs font-bold flex items-center gap-1.5 tactile-btn shadow-sm hover:bg-[#d93820] disabled:opacity-50 cursor-pointer"
          >
            {isUploading ? (
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
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <span className="text-sm leading-none font-black">+</span>
                <span>Upload Thumbnails</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status feedback */}
      {uploadFeedback && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            uploadFeedback.type === "success"
              ? "bg-[#D1FAE5] text-[#065F46] dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-500/20"
              : "bg-[#FEE2E2] text-[#991B1B] dark:bg-red-950/40 dark:text-red-300 border border-red-500/20"
          }`}
        >
          <span>{uploadFeedback.type === "success" ? "✓" : "⚠️"}</span>
          <span>{uploadFeedback.text}</span>
        </div>
      )}

      {/* Hero Main Thumbnail Display */}
      {mainThumbnail ? (
        <div className="bg-white dark:bg-[#1E1A17] rounded-3xl border border-[#E3DCD3] dark:border-[#3C3530] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5338] animate-pulse" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#1E1A17] dark:text-[#FAF8F5]">
                Primary Active Thumbnail
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSimulatorOpen(true)}
                className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#FF5338]/10 text-[#FF5338] hover:bg-[#FF5338] hover:text-white border border-[#FF5338]/30 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>⚡</span>
                <span>Test in Feed</span>
              </button>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#FFD700]/20 text-[#B45309] dark:text-[#FCD34D] border border-[#F59E0B]/30 flex items-center gap-1.5">
                <span>★</span>
                <span>Currently Featured on Video Card</span>
              </span>
            </div>
          </div>

          <div className="relative aspect-video max-w-3xl mx-auto rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 shadow-lg group">
            <img
              src={mainThumbnail.url}
              alt={mainThumbnail.label || projectName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <span className="text-xs text-white/90 font-medium">
                {mainThumbnail.label || "Default Hero Packaging"}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-[#E3DCD3] dark:border-[#3C3530] rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#FF5338] hover:bg-[#FFEBE7]/20 dark:hover:bg-red-950/10 transition-all group"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#F1EDE6] dark:bg-[#2A2521] text-[#FF5338] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform mb-3">
            🖼️
          </div>
          <h3 className="font-extrabold text-sm text-[#1E1A17] dark:text-[#FAF8F5]">
            No Thumbnails Uploaded Yet
          </h3>
          <p className="text-xs text-[#8C8379] mt-1 max-w-sm">
            Click here or use the button above to upload one or more 16:9
            thumbnail iterations for "{projectName}".
          </p>
        </button>
      )}

      {/* Variants Gallery Grid */}
      {thumbnails.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#1E1A17] dark:text-[#FAF8F5]">
              All Thumbnail Variations ({thumbnails.length})
            </h3>
            <span className="text-xs text-[#8C8379]">
              Click "Set as Main" on any concept to switch the project's hero
              cover
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {thumbnails.map((thumb, index) => {
              const isCurrentMain = thumb.isMain;
              return (
                <div
                  key={thumb.id}
                  className={`bg-white dark:bg-[#1E1A17] rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                    isCurrentMain
                      ? "border-[#FF5338] shadow-md ring-2 ring-[#FF5338]/20"
                      : "border-[#E3DCD3] dark:border-[#3C3530] hover:border-[#8C8379]"
                  }`}
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-black/5 dark:bg-white/5">
                    <img
                      src={thumb.url}
                      alt={thumb.label || `Variant ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {isCurrentMain && (
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FF5338] text-white shadow-xs">
                        ★ Main
                      </span>
                    )}
                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-black/80 text-white backdrop-blur-xs">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="p-3.5 flex items-center justify-between gap-2 border-t border-[#E3DCD3]/60 dark:border-[#3C3530]/60">
                    <span className="text-xs font-bold text-[#1E1A17] dark:text-[#FAF8F5] truncate">
                      {thumb.label || `Concept ${index + 1}`}
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {!isCurrentMain && (
                        <button
                          type="button"
                          onClick={() => handleSetMain(thumb.id)}
                          disabled={setMainMutation.isPending}
                          className="px-2.5 py-1 rounded-lg bg-[#F1EDE6] dark:bg-[#2A2521] hover:bg-[#FF5338] hover:text-white text-[11px] font-bold text-[#1E1A17] dark:text-white transition-colors cursor-pointer"
                        >
                          Set Main
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(thumb.id)}
                        disabled={deleteThumbnailMutation.isPending}
                        title="Delete Thumbnail"
                        className="p-1 rounded-lg text-[#8C8379] hover:text-[#DC2626] hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Packaging Simulator Modal */}
      <PackagingSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        projectId={projectId}
        projectName={projectName}
        channelName={channelName}
        channelAvatarUrl={channelAvatarUrl}
        thumbnails={thumbnails}
        referenceInspirations={referenceInspirations}
      />

      {/* Thumbnail AI Prompt Modal */}
      <ThumbnailPromptModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        initialTopic={projectName}
        hook={hook}
        channelName={channelName}
      />
    </div>
  );
}

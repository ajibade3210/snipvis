"use client";

import { useTagInspiration } from "@/hooks/use-inspirations";
import { tagInspirationSchema } from "@/lib/validations";
import { useEffect, useState } from "react";

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspirationId: string;
  projectId: string;
  initialNote?: string | null;
  favorite?: boolean;
}

export function NoteModal({
  isOpen,
  onClose,
  inspirationId,
  projectId,
  initialNote = "",
  favorite = false,
}: NoteModalProps) {
  const [note, setNote] = useState(initialNote || "");
  const [error, setError] = useState<string | null>(null);

  const tagMutation = useTagInspiration();

  useEffect(() => {
    if (isOpen) {
      setNote(initialNote || "");
      setError(null);
    }
  }, [initialNote, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = tagInspirationSchema.safeParse({
      inspirationId,
      projectId,
      note: note.trim() || undefined,
      favorite,
    });

    if (!result.success) {
      setError(result.error.errors[0]?.message || "Validation failed");
      return;
    }

    try {
      await tagMutation.mutateAsync(result.data);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update note");
    }
  };

  return (
    <dialog
      open
      aria-label="Project Research Note"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/35 m-0 h-full w-full max-w-none border-0"
    >
      <div className="bg-[#FCFAF7] dark:bg-[#1C1815] border border-black/[0.08] dark:border-white/[0.08] text-[#1E1A17] dark:text-[#FAF8F5] rounded-3xl w-full max-w-md flex flex-col shadow-2xl shadow-black/25 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Apple-Style Deferential Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-black/[0.04] dark:border-white/[0.05]">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-[#1E1A17] dark:text-white">
              Project Research Note
            </h3>
            <p className="text-xs text-[#8C8379] dark:text-[#A89F95] mt-0.5">
              Contextual note attached to this inspiration.
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
              <span className="font-semibold">Error:</span>
              <p className="flex-1 leading-relaxed">{error}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="project-note-textarea"
              className="block text-xs font-medium text-[#58524C] dark:text-[#A89F95]"
            >
              Note for this Project
            </label>
            <textarea
              id="project-note-textarea"
              rows={4}
              placeholder="e.g. Reference the pacing, chiaroscuro contrast, and split-screen composition from this video..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-3.5 text-xs rounded-xl bg-white dark:bg-[#201C18] border border-black/[0.08] dark:border-white/[0.08] focus:border-[#FF5338] text-[#1E1A17] dark:text-white outline-none resize-none leading-relaxed font-sans"
            />
          </div>

          <div className="pt-2 flex justify-end items-center gap-2 border-t border-black/[0.04] dark:border-white/[0.05]">
            <button
              type="button"
              onClick={onClose}
              disabled={tagMutation.isPending}
              className="h-9 px-4 rounded-full text-xs font-medium text-[#8C8379] hover:text-[#1E1A17] dark:hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={tagMutation.isPending}
              className="h-9 px-5 rounded-full bg-[#1E1A17] dark:bg-white hover:bg-[#332C26] dark:hover:bg-white/90 disabled:opacity-50 text-white dark:text-[#1E1A17] text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              {tagMutation.isPending ? "Saving..." : "Save Note"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

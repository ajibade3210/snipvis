"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { tagInspirationSchema } from "@/lib/validations";
import { useTagInspiration } from "@/hooks/use-inspirations";

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
    } catch (err: any) {
      setError(err?.message || "Failed to update note");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-card text-card-foreground border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in-0 zoom-in-95">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-base">Project Research Note</h3>
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
            <label className="block text-xs font-medium mb-1.5 text-foreground">
              Note for this Project
            </label>
            <textarea
              rows={4}
              placeholder="e.g. Reference the pacing and split-screen composition from this video..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-2.5 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={tagMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={tagMutation.isPending}>
              {tagMutation.isPending ? "Saving..." : "Save Note"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

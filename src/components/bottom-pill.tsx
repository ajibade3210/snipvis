"use client";

interface BottomPillProps {
  onAnalyze: () => void;
}

export function BottomPill({ onAnalyze }: BottomPillProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="bg-[#2D2824]/95 text-white backdrop-blur-md rounded-full px-5 py-2.5 shadow-2xl flex items-center gap-4 border border-white/10 animate-in fade-in-0 slide-in-from-bottom-4">
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="text-[#FF8A00]">✨</span>
          <span>Instant AI Hook Breakdown ready</span>
        </div>
        <button
          type="button"
          onClick={onAnalyze}
          className="px-4 py-1.5 rounded-full bg-[#FF5338] hover:bg-[#d93820] text-white text-xs font-bold tactile-btn shadow-sm transition-transform active:scale-95"
        >
          Analyze URL
        </button>
      </div>
    </div>
  );
}

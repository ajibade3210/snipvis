"use client";

interface ConceptSkeletonLoaderProps {
  message?: string;
  submessage?: string;
}

export function ConceptSkeletonLoader({
  message = "Synthesizing packaging angle...",
  submessage = "Calibrating contrast, composition, and psychological trigger",
}: ConceptSkeletonLoaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] p-6 sm:p-7 min-h-[360px] flex flex-col justify-between border border-black/[0.04] dark:border-white/[0.05]">
      {/* Ambient Breathing Glow Aura */}
      <div
        className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-[#FF5338]/[0.07] dark:bg-[#FF5338]/[0.10] blur-3xl animate-pulse"
        style={{ animationDuration: "3s" }}
        aria-hidden="true"
      />

      {/* Top Meta Skeleton */}
      <div className="space-y-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="h-5 w-20 rounded-full bg-black/[0.06] dark:bg-white/[0.08] animate-pulse" />
          <div className="h-5 w-28 rounded-full bg-black/[0.04] dark:bg-white/[0.05] animate-pulse" />
        </div>

        {/* Hero Quote Skeleton */}
        <div className="space-y-2 pt-2">
          <div className="h-8 w-4/5 rounded-xl bg-black/[0.06] dark:bg-white/[0.08] animate-pulse" />
          <div className="h-4 w-1/2 rounded-lg bg-black/[0.04] dark:bg-white/[0.05] animate-pulse" />
        </div>
      </div>

      {/* Middle Shimmer Box (Matches Prompt Container Footprint) */}
      <div className="my-6 p-4 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.03] dark:border-white/[0.04] space-y-2 relative z-10">
        <div className="flex items-center justify-between">
          <div className="h-3.5 w-32 rounded-md bg-black/[0.05] dark:bg-white/[0.06] animate-pulse" />
          <div className="h-6 w-20 rounded-full bg-black/[0.05] dark:bg-white/[0.06] animate-pulse" />
        </div>
        <div className="space-y-1.5 pt-1">
          <div className="h-3 w-full rounded-md bg-black/[0.04] dark:bg-white/[0.05] animate-pulse" />
          <div className="h-3 w-11/12 rounded-md bg-black/[0.04] dark:bg-white/[0.05] animate-pulse" />
          <div className="h-3 w-4/5 rounded-md bg-black/[0.04] dark:bg-white/[0.05] animate-pulse" />
        </div>
      </div>

      {/* Bottom Status Indicator */}
      <div className="flex items-center justify-between text-xs text-[#8C8379] relative z-10 pt-2 border-t border-black/[0.04] dark:border-white/[0.04]">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5338] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF5338]" />
          </span>
          <span className="font-medium text-[#1E1A17] dark:text-[#E8E2DC]">
            {message}
          </span>
        </div>
        <span className="text-[11px] opacity-70 hidden sm:inline">
          {submessage}
        </span>
      </div>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import type { CreateInspirationInput } from "@/types";
import { useState } from "react";

interface CompetitorSpyViewProps {
  onImportOutlier: (item: CreateInspirationInput) => void;
}

export function CompetitorSpyView({ onImportOutlier }: CompetitorSpyViewProps) {
  const [selectedChannel, setSelectedChannel] = useState<string>("ALL");
  const [importedIds, setImportedIds] = useState<string[]>([]);

  const channels = [
    { id: "ALL", name: "All Tracked Channels", count: 8 },
    { id: "MrBeast", name: "MrBeast", avatar: "🔥", count: 3 },
    { id: "Veritasium", name: "Veritasium", avatar: "🧠", count: 2 },
    { id: "TechCraft", name: "TechCraft", avatar: "⚡", count: 2 },
    { id: "AlexVlogs", name: "AlexVlogs", avatar: "🎬", count: 1 },
  ];

  const outliers = [
    {
      id: "outlier-1",
      channel: "TechCraft",
      title: "I Built a $100,000 Secret Gaming Bunker Under My Backyard",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
      multiplier: "12.4x Channel Avg",
      views: "5.8M views (vs 450k avg)",
      ctrScore: "14.2% Estimated CTR",
      strategy:
        "Extreme curiosity gap with physical construction stakes. Thumbnail uses high-contrast rim lighting.",
      hook: "In the next 7 minutes, I will test if anyone can survive 100 hours in an impenetrable vault...",
      sourceUrl: "https://youtube.com",
    },
    {
      id: "outlier-2",
      channel: "MrBeast",
      title: "Surviving 7 Days In An Abandoned High Security Prison",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
      multiplier: "8.6x Outlier Velocity",
      views: "9.4M views in 48h",
      ctrScore: "12.8% Estimated CTR",
      strategy:
        "Night-vision green tint creates high visual saturation against YouTube's dark UI mode.",
      hook: "I locked myself in cell block 4 with zero food, zero contact, and 3 motion sensors...",
      sourceUrl: "https://youtube.com",
    },
    {
      id: "outlier-3",
      channel: "Veritasium",
      title: "The Bizarre Physics of Why Bicycles Don't Fall Over",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80",
      multiplier: "14.1x Channel Avg",
      views: "18.2M views",
      ctrScore: "15.1% Estimated CTR",
      strategy:
        "Contrarian question challenging common sense assumptions. Zero visual clutter in thumbnail.",
      hook: "Everything you were taught in school about why bikes balance is mathematically incorrect.",
      sourceUrl: "https://youtube.com",
    },
    {
      id: "outlier-4",
      channel: "AlexVlogs",
      title: "Why Everyone Is Suddenly Quitting Their 9-to-5 In 2026",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
      multiplier: "6.2x Outlier",
      views: "2.1M views",
      ctrScore: "11.4% Estimated CTR",
      strategy:
        "Urgency + zeitgeist trend tapping into economic anxiety. Red coffee mug focal anchor.",
      hook: "Why 84% of high earners are secretly planning to quit before the end of the quarter...",
      sourceUrl: "https://youtube.com",
    },
  ];

  const filtered = outliers.filter(
    (o) => selectedChannel === "ALL" || o.channel === selectedChannel,
  );

  const handleImport = (item: (typeof outliers)[0]) => {
    onImportOutlier({
      title: item.title,
      thumbnailUrl: item.thumbnailUrl,
      channelName: item.channel,
      views: item.views,
      sourceUrl: item.sourceUrl,
      hook: item.hook,
      note: `Competitor Outlier (${item.multiplier}): ${item.strategy}`,
      type: "THUMBNAIL",
      projects: [],
    });
    setImportedIds((prev) => [...prev, item.id]);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E3DCD3] dark:border-[#3C3530] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-extrabold tracking-tight text-[#1E1A17] dark:text-[#FAF8F5]">
              🎯 Competitor Benchmark Radar
            </h2>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold font-grotesk bg-[#FFF0D6] text-[#914c00] dark:bg-amber-950/40 dark:text-amber-300">
              {outliers.length} Viral Outliers
            </span>
          </div>
        </div>
      </div>

      {/* Channel Strip */}
      <div className="flex flex-wrap items-center gap-2">
        {channels.map((ch) => (
          <button
            key={ch.id}
            type="button"
            onClick={() => setSelectedChannel(ch.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${
              selectedChannel === ch.id
                ? "bg-[#1E1A17] dark:bg-white text-white dark:text-[#1E1A17] shadow-xs"
                : "bg-[#F1EDE6] dark:bg-[#221E1A] text-[#1E1A17] dark:text-[#FAF8F5] hover:bg-[#EBE5DC] border border-[#E3DCD3]/60 dark:border-[#3C3530]/60"
            }`}
          >
            <span>{ch.avatar || "📊"}</span>
            <span>{ch.name}</span>
            <span className="opacity-70 font-grotesk font-normal text-[10px]">
              {ch.count}
            </span>
          </button>
        ))}
      </div>

      {/* Outliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((item) => {
          const isImported = importedIds.includes(item.id);

          return (
            <div
              key={item.id}
              className="bg-white dark:bg-[#1E1A17] rounded-2xl border border-[#E3DCD3] dark:border-[#3C3530] overflow-hidden card-lift p-5 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Outlier Stat Ribbon */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#FF5338] text-white">
                    🚀 {item.multiplier}
                  </span>
                  <span className="text-xs font-bold text-[#059669] font-grotesk">
                    {item.ctrScore}
                  </span>
                </div>

                {/* Media Row */}
                <div className="flex gap-4">
                  <div className="w-40 aspect-video rounded-xl overflow-hidden bg-[#F1EDE6] dark:bg-[#2A2521] shrink-0 border border-[#E3DCD3]/60 dark:border-[#3C3530]/60">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#8C8379]">
                      @{item.channel}
                    </span>
                    <h3 className="font-extrabold text-sm text-[#1E1A17] dark:text-[#FAF8F5] line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-[11px] font-grotesk font-semibold text-[#58524C] dark:text-[#A89F95]">
                      {item.views}
                    </p>
                  </div>
                </div>

                {/* Teardown Strategy */}
                <div className="p-3 rounded-xl bg-[#F7F4EF] dark:bg-[#221E1A] border border-[#E3DCD3]/70 dark:border-[#3C3530]/70 text-xs text-[#58524C] dark:text-[#A89F95] space-y-1">
                  <div className="font-bold text-[#1E1A17] dark:text-[#FAF8F5]">
                    💡 Reverse-Engineered Strategy:
                  </div>
                  <p className="leading-relaxed">{item.strategy}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#E3DCD3]/50 dark:border-[#3C3530]/50 flex items-center justify-between">
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-[#FF5338] hover:underline"
                >
                  Analyze on YouTube ↗
                </a>

                <button
                  type="button"
                  onClick={() => handleImport(item)}
                  disabled={isImported}
                  className={`h-8 px-4 rounded-full text-xs font-bold transition-all ${
                    isImported
                      ? "bg-[#059669] text-white cursor-default"
                      : "bg-[#FF5338] hover:bg-[#d93820] text-white shadow-xs tactile-btn"
                  }`}
                >
                  {isImported ? "✓ Saved to Vault" : "+ Save to Vault"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

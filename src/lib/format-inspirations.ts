export function formatInspirations(
  inspirations: any[],
  projectName: string = "Global Vault",
) {
  return inspirations.map((item, idx) => ({
    ...item,
    categoryTag:
      item.type === "HOOK"
        ? "Retention Hook Strategy"
        : item.type === "TITLE"
          ? "CTR Title Formula"
          : "High CTR Thumbnail",
    categoryColor:
      item.type === "HOOK"
        ? "bg-[#D1FAE5] text-[#006948] dark:bg-emerald-950/40 dark:text-emerald-300"
        : item.type === "TITLE"
          ? "bg-[#FFF0D6] text-[#914c00] dark:bg-amber-950/40 dark:text-amber-300"
          : "bg-[#FFEBE7] text-[#b51d07] dark:bg-red-950/40 dark:text-red-300",
    ctrBadge: idx % 2 === 0 ? "📈 13.5% CTR" : "⚡ 11.8% CTR",
    ctrColor: idx % 2 === 0 ? "bg-[#059669]" : "bg-[#FF8A00]",
    duration: "15:20",
    insightLeft: item.hook ? "Hook Teardown" : "Visual Contrast",
    insightRight: "Tested Win",
    insightRightColor: "text-[#059669]",
    projectName,
    projectDot: "bg-[#FF5338]",
  }));
}

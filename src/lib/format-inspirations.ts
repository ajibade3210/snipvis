import { HOOK_TYPE_LABELS } from "@/types/hook-analysis";
import type {
  FormattedInspiration,
  InspirationRecord,
} from "@/types/inspiration";

export function formatInspirations(
  inspirations: InspirationRecord[],
  defaultProjectName = "Global Vault",
): FormattedInspiration[] {
  return inspirations.map((item) => {
    const rawHookType = item.hook_type || item.hookType;
    const hookLabel =
      rawHookType &&
      (HOOK_TYPE_LABELS[rawHookType as keyof typeof HOOK_TYPE_LABELS] ||
        rawHookType);

    // 1. CTR Badge & Color from database
    const rawCtr = (item.estimated_ctr || item.estimatedCtr || "").trim();
    let ctrBadge = "";
    let ctrColor = "";

    if (rawCtr) {
      const match = rawCtr.match(/(\d+(?:\.\d+)?)/);
      const numValue = match ? Number.parseFloat(match[1]) : null;

      ctrBadge = rawCtr.toUpperCase().includes("CTR")
        ? rawCtr
        : rawCtr.includes("%")
          ? `${rawCtr} CTR`
          : `${rawCtr}% CTR`;

      if (numValue !== null) {
        ctrColor =
          numValue >= 12
            ? "bg-[#059669]"
            : numValue >= 8
              ? "bg-[#FF8A00]"
              : "bg-[#8C8379]";
      } else {
        ctrColor = "bg-[#059669]";
      }
    }

    // 2. Duration directly from database
    const duration = (item.duration || "").trim();

    // 3. Insights directly from database fields
    const insightLeft = (
      item.insight_left ||
      item.insightLeft ||
      item.hook_formula ||
      item.hookFormula ||
      (item.hook ? "Hook Teardown" : "")
    ).trim();

    const insightRight = (
      item.insight_right ||
      item.insightRight ||
      item.triggered_emotion ||
      item.triggeredEmotion ||
      item.score_reason ||
      item.scoreReason ||
      ""
    ).trim();

    // 4. Project Name resolved directly from DB relation
    const projectName =
      item.projectName ||
      item.projectContext?.projectName ||
      defaultProjectName ||
      "Global Vault";

    return {
      ...item,
      categoryTag:
        hookLabel ||
        (item.type === "HOOK"
          ? "Retention Hook Strategy"
          : item.type === "TITLE"
            ? "CTR Title Formula"
            : "High CTR Thumbnail"),
      categoryColor:
        item.type === "HOOK" || rawHookType
          ? "bg-[#D1FAE5] text-[#006948] dark:bg-emerald-950/40 dark:text-emerald-300"
          : item.type === "TITLE"
            ? "bg-[#FFF0D6] text-[#914c00] dark:bg-amber-950/40 dark:text-amber-300"
            : "bg-[#FFEBE7] text-[#b51d07] dark:bg-red-950/40 dark:text-red-300",
      ctrBadge,
      ctrColor,
      duration,
      insightLeft,
      insightRight,
      insightRightColor: "text-[#059669]",
      projectName,
      projectDot: "bg-[#FF5338]",
    };
  });
}

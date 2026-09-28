/**
 * Derives a human-readable upload frequency label from an array of recent
 * video publish dates (ISO strings), sorted newest-first.
 *
 * Examples: "5× daily", "twice weekly", "once monthly", "irregular"
 */
export function computeUploadFrequency(uploadDates: string[]): string {
  if (!uploadDates || uploadDates.length < 2) return "Not enough data";

  const sorted = uploadDates
    .map((d) => new Date(d).getTime())
    .filter((time) => !Number.isNaN(time))
    .sort((a, b) => b - a);

  if (sorted.length < 2) return "Not enough data";

  const gaps: number[] = [];
  const sample = sorted.slice(0, 11);
  for (let i = 0; i < sample.length - 1; i++) {
    const gap = sample[i] - sample[i + 1];
    if (gap > 0) {
      gaps.push(gap);
    }
  }

  if (gaps.length === 0) return "Not enough data";

  const avgGapMs = gaps.reduce((s, g) => s + g, 0) / gaps.length;
  const avgGapHours = avgGapMs / 3_600_000;
  const avgGapDays = avgGapHours / 24;

  if (avgGapHours < 18) {
    const timesDaily = Math.round(24 / Math.max(1, avgGapHours));
    if (timesDaily >= 3) return `${timesDaily} times daily`;
    if (timesDaily === 2) return "twice daily";
    return "once daily";
  }

  if (avgGapDays < 1.6) return "once daily";
  if (avgGapDays < 2.6) return "every 2 days";

  if (avgGapDays <= 9) {
    const perWeek = Math.round(7 / avgGapDays);
    if (perWeek >= 3) return `${perWeek} times weekly`;
    if (perWeek === 2) return "twice weekly";
    return "once weekly";
  }

  if (avgGapDays <= 18) return "every 2 weeks";
  if (avgGapDays <= 45) return "once monthly";
  return "irregular";
}

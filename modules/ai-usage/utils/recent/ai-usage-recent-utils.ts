import type { AiUsageRecentItem } from "@/modules/ai-usage/types/ai-usage.types";

/** Anexa `incoming` a `prev` sem duplicar (dedupe por id), preservando a ordem. */
export function mergeRecentById(
  prev: AiUsageRecentItem[],
  incoming: AiUsageRecentItem[]
): AiUsageRecentItem[] {
  const seen = new Set(prev.map((item) => item.id));
  const appended = incoming.filter((item) => !seen.has(item.id));
  return appended.length > 0 ? [...prev, ...appended] : prev;
}

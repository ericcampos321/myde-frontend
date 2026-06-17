export type AiUsagePeriodId = "24h" | "7d" | "30d";

export interface AiUsagePeriod {
  id: AiUsagePeriodId;
  label: string;
  days: number;
}

export const AI_USAGE_PERIODS: readonly AiUsagePeriod[] = [
  { id: "24h", label: "Últimas 24h", days: 1 },
  { id: "7d", label: "7 dias", days: 7 },
  { id: "30d", label: "30 dias", days: 30 },
] as const;

export const DEFAULT_AI_USAGE_PERIOD: AiUsagePeriodId = "7d";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Converte um preset de período em `{ from, to }` ISO (to = agora). */
export function resolvePeriodRange(
  periodId: AiUsagePeriodId,
  now: Date = new Date()
): { from: string; to: string } {
  const period =
    AI_USAGE_PERIODS.find((p) => p.id === periodId) ??
    AI_USAGE_PERIODS.find((p) => p.id === DEFAULT_AI_USAGE_PERIOD)!;

  return {
    from: new Date(now.getTime() - period.days * DAY_MS).toISOString(),
    to: now.toISOString(),
  };
}

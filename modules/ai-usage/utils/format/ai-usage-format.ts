import type { AiUsageRecentItem } from "@/modules/ai-usage/types/ai-usage.types";

const DASH = "—";

const integerFormatter = new Intl.NumberFormat("pt-BR");

/** Formata contagem de tokens; `null` → "—". */
export function formatTokens(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return DASH;
  return integerFormatter.format(Math.round(value));
}

/** Formata número inteiro genérico (chamadas, bloqueios). */
export function formatInteger(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return DASH;
  return integerFormatter.format(Math.round(value));
}

/**
 * Custo estimado em USD; `null` → "—" (modelo sem preço). Valores pequenos
 * precisam de casas suficientes para não parecerem zero.
 */
export function formatCostUsd(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return DASH;
  const decimals = Math.abs(value) < 0.01 ? 6 : 4;
  const fixed = value.toFixed(decimals).replace(/0+$/, "").replace(/\.$/, "");
  return `US$ ${fixed === "" ? "0" : fixed}`;
}

/** Duração média em ms → "950 ms" ou "1.2 s"; `null` → "—". */
export function formatDurationMs(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return DASH;
  if (value < 1000) return `${Math.round(value)} ms`;
  return `${(value / 1000).toFixed(1)} s`;
}

/** Data/hora curta a partir de ISO; `null`/inválido → "—". */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return DASH;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return DASH;
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Rótulo legível do estágio do fluxo de IA. */
export function formatStage(stage: AiUsageRecentItem["stage"]): string {
  const labels: Record<AiUsageRecentItem["stage"], string> = {
    input: "Entrada",
    output: "Saída",
    recurring: "Recorrência",
    auto_reply: "Auto-reply",
  };
  return labels[stage] ?? stage;
}

/** Origem legível (source/provider) de uma interação. */
export function formatOrigin(item: AiUsageRecentItem): string {
  if (item.provider && item.source && item.provider !== item.source) {
    return `${item.source}/${item.provider}`;
  }
  return item.source ?? item.provider ?? "—";
}

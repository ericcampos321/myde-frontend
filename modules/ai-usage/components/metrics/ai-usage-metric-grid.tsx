import { AiUsageMetricCard } from "@/modules/ai-usage/components/metrics/ai-usage-metric-card";
import {
  formatCostUsd,
  formatDurationMs,
  formatInteger,
  formatTokens,
} from "@/modules/ai-usage/utils/format/ai-usage-format";
import type { AiUsageSummary } from "@/modules/ai-usage/types/ai-usage.types";

export function AiUsageMetricGrid({ summary }: { summary: AiUsageSummary }) {
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <AiUsageMetricCard label="Chamadas IA" value={formatInteger(summary.totalInteractions)} />
      <AiUsageMetricCard label="Tokens totais" value={formatTokens(summary.totalTokens)} />
      <AiUsageMetricCard label="Tokens de entrada" value={formatTokens(summary.promptTokens)} />
      <AiUsageMetricCard label="Tokens de saída" value={formatTokens(summary.completionTokens)} />
      <AiUsageMetricCard label="Bloqueios guardrail" value={formatInteger(summary.blockedInteractions)} />
      <AiUsageMetricCard label="Custo estimado" value={formatCostUsd(summary.estimatedCost)} />
      <AiUsageMetricCard label="Duração média" value={formatDurationMs(summary.avgDurationMs)} />
      <AiUsageMetricCard label="Concluídas" value={formatInteger(summary.completedInteractions)} />
    </section>
  );
}

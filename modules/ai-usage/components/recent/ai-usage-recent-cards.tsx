import { Card } from "@/components/ui/card";
import { cn } from "@/utils/cn";
import { AiUsageRecentEmpty } from "@/modules/ai-usage/components/recent/ai-usage-recent-empty";
import { AiUsageRecentMetricRow } from "@/modules/ai-usage/components/recent/ai-usage-recent-metric-row";
import {
  BlockedPill,
  MetaPill,
  RiskPill,
} from "@/modules/ai-usage/components/recent/ai-usage-recent-pills";
import {
  formatCostUsd,
  formatDateTime,
  formatDurationMs,
  formatOrigin,
  formatStage,
  formatTokens,
} from "@/modules/ai-usage/utils/format/ai-usage-format";
import type { AiUsageRecentItem } from "@/modules/ai-usage/types/ai-usage.types";

export function AiUsageRecentCards({
  items,
  hasNextPage,
  isLoadingMore,
  onLoadMore,
}: {
  items: AiUsageRecentItem[];
  hasNextPage: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}) {
  if (items.length === 0) {
    return <AiUsageRecentEmpty />;
  }

  return (
    <div className="flex flex-col gap-3">
      <Card className="p-4">
        <div>
          <h2 className="text-[14px] font-semibold text-text">Interações recentes</h2>
          <p className="text-[12px] text-text-muted">{items.length} carregadas</p>
        </div>
      </Card>

      {items.map((item, index) => (
        <Card key={item.id || `${item.conversationId}-${item.createdAt ?? index}`} className="p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="text-[12px] text-text-muted">{formatDateTime(item.createdAt)}</div>
              <div className="shrink-0 text-[13px] font-semibold tabular-nums text-text">{formatCostUsd(item.estimatedCostUsd)}</div>
            </div>

            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-text-muted">
                Conversa {item.conversationId.slice(0, 8)} · {formatStage(item.stage)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <MetaPill>{formatOrigin(item)}</MetaPill>
              <MetaPill>{item.model ?? "—"}</MetaPill>
              <RiskPill level={item.riskLevel} />
              <BlockedPill blocked={item.blocked} />
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12px]">
              <AiUsageRecentMetricRow label="Entrada" value={formatTokens(item.promptTokens)} />
              <AiUsageRecentMetricRow label="Saída" value={formatTokens(item.completionTokens)} />
              <AiUsageRecentMetricRow label="Cache" value={formatTokens(item.cachedPromptTokens)} />
              <AiUsageRecentMetricRow label="Duração" value={formatDurationMs(item.durationMs)} />
            </div>
          </div>
        </Card>
      ))}

      {hasNextPage ? (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={isLoadingMore}
          aria-busy={isLoadingMore}
          className={cn(
            "flex h-11 w-full items-center justify-center rounded-xl border border-border bg-surface px-4 text-[14px] font-medium text-text-muted",
            "transition-colors hover:bg-surface-active hover:text-text active:scale-[0.99]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          {isLoadingMore ? "Carregando…" : "Carregar mais"}
        </button>
      ) : (
        <p className="py-2 text-center text-[12px] text-text-muted">Todos os registros carregados</p>
      )}
    </div>
  );
}

import { Card } from "@/components/ui/card";
import { AiUsageRecentEmpty } from "@/modules/ai-usage/components/recent/ai-usage-recent-empty";
import { RiskPill } from "@/modules/ai-usage/components/recent/ai-usage-recent-pills";
import {
  formatCostUsd,
  formatDateTime,
  formatDurationMs,
  formatOrigin,
  formatStage,
  formatTokens,
} from "@/modules/ai-usage/utils/format/ai-usage-format";
import type { AiUsageRecentItem } from "@/modules/ai-usage/types/ai-usage.types";

export function AiUsageRecentTable({
  items,
  hasNextPage,
  pageIndex,
  isFetching,
  onPrevious,
  onNext,
}: {
  items: AiUsageRecentItem[];
  hasNextPage: boolean;
  pageIndex: number;
  isFetching: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  if (items.length === 0) {
    return <AiUsageRecentEmpty />;
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h2 className="text-[14px] font-semibold text-text">Interações recentes</h2>
          <p className="text-[12px] text-text-muted">
            Página {pageIndex + 1} · {items.length} carregadas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={pageIndex === 0 || isFetching}
            onClick={onPrevious}
            className="cursor-pointer rounded-full border border-border px-3 py-1 text-[12px] text-text-muted transition-colors hover:bg-surface-active hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
          >
            Anterior
          </button>
          <button
            type="button"
            disabled={!hasNextPage || isFetching}
            onClick={onNext}
            className="cursor-pointer rounded-full border border-border px-3 py-1 text-[12px] text-text-muted transition-colors hover:bg-surface-active hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] text-left text-[13px]">
          <thead className="text-[12px] text-text-muted">
            <tr className="border-b border-border/60">
              <Th>Data</Th>
              <Th>Conversa</Th>
              <Th>Fluxo</Th>
              <Th>Modelo</Th>
              <Th>Origem</Th>
              <Th>Risco</Th>
              <Th>Bloqueado</Th>
              <Th className="text-right">Tokens entrada</Th>
              <Th className="text-right">Tokens saída</Th>
              <Th className="text-right">Cache</Th>
              <Th className="text-right">Custo</Th>
              <Th className="text-right">Duração</Th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id || `${item.conversationId}-${item.createdAt ?? index}`} className="border-b border-border/40 last:border-0">
                <Td>{formatDateTime(item.createdAt)}</Td>
                <Td className="font-mono text-[12px] text-text-muted">{item.conversationId.slice(0, 8)}</Td>
                <Td>{formatStage(item.stage)}</Td>
                <Td>{item.model ?? "—"}</Td>
                <Td>{formatOrigin(item)}</Td>
                <Td>
                  <RiskPill level={item.riskLevel} />
                </Td>
                <Td>{item.blocked ? "Sim" : "Não"}</Td>
                <Td className="text-right tabular-nums">{formatTokens(item.promptTokens)}</Td>
                <Td className="text-right tabular-nums">{formatTokens(item.completionTokens)}</Td>
                <Td className="text-right tabular-nums">{formatTokens(item.cachedPromptTokens)}</Td>
                <Td className="text-right tabular-nums">{formatCostUsd(item.estimatedCostUsd)}</Td>
                <Td className="text-right tabular-nums">{formatDurationMs(item.durationMs)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-2 font-medium ${className}`}>{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-2.5 text-text ${className}`}>{children}</td>;
}

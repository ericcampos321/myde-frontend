"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppRail, AiUsageIcon, ChatIcon, ContactsIcon } from "@/components/shared/app-rail";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { useAiUsageQuery } from "@/modules/ai-usage/hooks/use-ai-usage-query";
import {
  AI_USAGE_PERIODS,
  DEFAULT_AI_USAGE_PERIOD,
  resolvePeriodRange,
  type AiUsagePeriodId,
} from "@/modules/ai-usage/utils/ai-usage-period";
import {
  EMPTY_AI_USAGE_FILTERS,
  hasActiveAiUsageFilters,
  type AiUsageFilters,
} from "@/modules/ai-usage/utils/ai-usage-filters";
import { formatCostUsd, formatDateTime, formatDurationMs, formatInteger, formatTokens } from "@/modules/ai-usage/utils/ai-usage-format";
import type { AiUsageRecentItem } from "@/modules/inbox/types/inbox.types";

const PAGE_LIMIT = "20";

export function AiUsagePage() {
  const [period, setPeriod] = useState<AiUsagePeriodId>(DEFAULT_AI_USAGE_PERIOD);
  const [filters, setFilters] = useState<AiUsageFilters>(EMPTY_AI_USAGE_FILTERS);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  // Recalcula o range só quando o período muda (evita refetch a cada render).
  const range = useMemo(() => resolvePeriodRange(period), [period]);
  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);
  const currentCursor = cursorStack.at(-1) ?? null;

  useEffect(() => {
    setCursorStack([]);
  }, [period, filterKey]);

  const { data, isLoading, isError, refetch, isFetching } = useAiUsageQuery({
    from: range.from,
    to: range.to,
    limit: PAGE_LIMIT,
    cursor: currentCursor,
    ...filters,
  });

  const summary = data?.summary;
  const hasActiveFilters = hasActiveAiUsageFilters(filters);
  const isEmpty = !!summary && summary.totalInteractions === 0;
  const isFilteredEmpty = isEmpty && hasActiveFilters;

  const handleFilterChange = (key: keyof AiUsageFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setCursorStack([]);
  };

  const handleClearFilters = () => {
    setFilters(EMPTY_AI_USAGE_FILTERS);
    setCursorStack([]);
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-bg">
      <AppRail
        ariaLabel="Navegação principal"
        items={[
          { id: "conversations", label: "Conversas", icon: <ChatIcon />, href: "/" },
          { id: "contacts", label: "Contatos", icon: <ContactsIcon />, href: "/" },
          {
            id: "ai-usage",
            label: "Uso da IA",
            icon: <AiUsageIcon />,
            href: "/ai-usage",
            active: true,
          },
        ]}
      />

      <div className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6">
          <header className="flex flex-col gap-2">
            <Link href="/" className="w-fit text-[13px] text-text-muted hover:text-text">
              ← Voltar para o inbox
            </Link>
            <h1 className="text-[22px] font-semibold text-text">Uso da IA</h1>
            <p className="text-[13px] text-text-muted">
              Acompanhamento de chamadas, tokens, bloqueios de guardrail e custo estimado da LLM. Somente leitura — não há prompt, mensagem
              ou token de API. O custo é aproximado, baseado no preço configurado por modelo.
            </p>
          </header>

          <div className="flex flex-wrap items-center gap-2">
            {AI_USAGE_PERIODS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                aria-pressed={period === p.id}
                className={[
                  "cursor-pointer rounded-full border px-3 py-1 text-[13px] transition-colors",
                  period === p.id
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-border text-text-muted hover:bg-surface-active hover:text-text",
                ].join(" ")}
              >
                {p.label}
              </button>
            ))}
            {isFetching && !isLoading && <span className="text-[12px] text-text-muted">atualizando…</span>}
          </div>

          {isLoading ? (
            <UsageSkeleton />
          ) : isError ? (
            <Card className="p-6">
              <ErrorState message="Não foi possível carregar o uso da IA." retry={() => refetch()} />
            </Card>
          ) : isEmpty && !isFilteredEmpty ? (
            <Card className="p-8">
              <EmptyState title="Sem uso de IA no período" description="Gere sugestões de resposta no inbox para ver as métricas aqui." />
            </Card>
          ) : (
            summary &&
            data && (
              <>
                {!isFilteredEmpty && (
                  <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    <MetricCard label="Chamadas IA" value={formatInteger(summary.totalInteractions)} />
                    <MetricCard label="Tokens totais" value={formatTokens(summary.totalTokens)} />
                    <MetricCard label="Tokens de entrada" value={formatTokens(summary.promptTokens)} />
                    <MetricCard label="Tokens de saída" value={formatTokens(summary.completionTokens)} />
                    <MetricCard label="Bloqueios guardrail" value={formatInteger(summary.blockedInteractions)} />
                    <MetricCard label="Custo estimado" value={formatCostUsd(summary.estimatedCost)} />
                    <MetricCard label="Duração média" value={formatDurationMs(summary.avgDurationMs)} />
                    <MetricCard label="Concluídas" value={formatInteger(summary.completedInteractions)} />
                  </section>
                )}

                <UsageFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={handleClearFilters}
                />

                {isFilteredEmpty ? (
                  <Card className="p-8">
                    <EmptyState
                      title="Nenhum resultado encontrado"
                      description="Ajuste ou limpe os filtros para consultar novamente o uso da IA."
                      action={
                        <button
                          type="button"
                          onClick={handleClearFilters}
                          className="cursor-pointer rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                          Limpar filtros
                        </button>
                      }
                    />
                  </Card>
                ) : (
                  <RecentTable
                    items={data.recent.items}
                    hasNextPage={data.recent.hasNextPage}
                    pageIndex={cursorStack.length}
                    isFetching={isFetching}
                    onPrevious={() => setCursorStack((stack) => stack.slice(0, -1))}
                    onNext={() => {
                      if (data.recent.nextCursor) {
                        setCursorStack((stack) => [...stack, data.recent.nextCursor!]);
                      }
                    }}
                  />
                )}
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function UsageFilters({
  filters,
  onFilterChange,
  onClearFilters,
}: {
  filters: AiUsageFilters;
  onFilterChange: (key: keyof AiUsageFilters, value: string) => void;
  onClearFilters: () => void;
}) {
  const update = (key: keyof AiUsageFilters, value: string) => {
    onFilterChange(key, value);
  };

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-[14px] font-semibold text-text">Filtros</h2>
        <button
          type="button"
          onClick={onClearFilters}
          className="cursor-pointer text-[12px] font-medium text-accent hover:text-accent/80"
        >
          Limpar filtros
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <FilterInput label="Modelo" value={filters.model} placeholder="gpt-5.4" onChange={(value) => update("model", value)} />
        <FilterInput
          label="Conversa"
          value={filters.conversationId}
          placeholder="ID da conversa"
          onChange={(value) => update("conversationId", value)}
        />
        <FilterSelect
          label="Origem"
          value={filters.source}
          onChange={(value) => update("source", value)}
          options={[
            { value: "", label: "Todas" },
            { value: "openai", label: "OpenAI" },
            { value: "stub", label: "Stub" },
          ]}
        />
        <FilterSelect
          label="Risco"
          value={filters.riskLevel}
          onChange={(value) => update("riskLevel", value)}
          options={[
            { value: "", label: "Todos" },
            { value: "low", label: "Baixo" },
            { value: "medium", label: "Médio" },
            { value: "high", label: "Alto" },
          ]}
        />
        <FilterSelect
          label="Bloqueado"
          value={filters.blocked}
          onChange={(value) => update("blocked", value)}
          options={[
            { value: "", label: "Todos" },
            { value: "true", label: "Sim" },
            { value: "false", label: "Não" },
          ]}
        />
        <FilterSelect
          label="Fluxo"
          value={filters.stage}
          onChange={(value) => update("stage", value)}
          options={[
            { value: "", label: "Todos" },
            { value: "input", label: "Entrada" },
            { value: "output", label: "Saída" },
            { value: "recurring", label: "Recorrência" },
            { value: "auto_reply", label: "Auto-reply" },
          ]}
        />
      </div>
    </Card>
  );
}

function FilterInput({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-[12px] text-text-muted">
      {label}
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-border bg-surface px-3 py-2 text-[13px] text-text outline-none transition-colors placeholder:text-text-muted/70 focus:border-accent"
      />
    </label>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <Select
      label={label}
      value={value}
      onValueChange={onChange}
      options={options}
    />
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="flex flex-col gap-1 p-4">
      <span className="text-[12px] text-text-muted">{label}</span>
      <span className="text-[20px] font-semibold tabular-nums text-text">{value}</span>
    </Card>
  );
}

function RecentTable({
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
    return (
      <Card className="p-6">
        <EmptyState title="Sem interações recentes" description="As últimas interações de IA aparecem aqui." />
      </Card>
    );
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

function formatStage(stage: AiUsageRecentItem["stage"]): string {
  const labels: Record<AiUsageRecentItem["stage"], string> = {
    input: "Entrada",
    output: "Saída",
    recurring: "Recorrência",
    auto_reply: "Auto-reply",
  };
  return labels[stage] ?? stage;
}

function formatOrigin(item: AiUsageRecentItem): string {
  if (item.provider && item.source && item.provider !== item.source) {
    return `${item.source}/${item.provider}`;
  }
  return item.source ?? item.provider ?? "—";
}

function RiskPill({ level }: { level: AiUsageRecentItem["riskLevel"] }) {
  const styles: Record<AiUsageRecentItem["riskLevel"], string> = {
    low: "bg-accent/15 text-accent",
    medium: "bg-yellow-500/15 text-yellow-400",
    high: "bg-danger/15 text-danger",
  };
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${styles[level]}`}>{level}</span>;
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-2 font-medium ${className}`}>{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-2.5 text-text ${className}`}>{children}</td>;
}

function UsageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="flex flex-col gap-2 p-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-16" />
          </Card>
        ))}
      </div>
      <Card className="p-4">
        <Skeleton className="h-5 w-40" />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </Card>
    </div>
  );
}

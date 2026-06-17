"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useIsMobileViewport } from "@/modules/inbox/hooks/use-is-mobile-viewport";
import { AppRail, AiUsageIcon, ChatIcon, ContactsIcon } from "@/components/shared/app-rail";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/utils/cn";
import { useAiUsageQuery } from "@/modules/ai-usage/hooks/use-ai-usage-query";
import {
  AI_USAGE_PERIODS,
  DEFAULT_AI_USAGE_PERIOD,
  resolvePeriodRange,
  type AiUsagePeriodId,
} from "@/modules/ai-usage/utils/ai-usage-period";
import {
  countActiveAiUsageFilters,
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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileDraftFilters, setMobileDraftFilters] = useState<AiUsageFilters>(EMPTY_AI_USAGE_FILTERS);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const isMobile = useIsMobileViewport();
  // Mobile: lista acumulada (append em "Carregar mais") + cursor da página atual.
  const [mobileItems, setMobileItems] = useState<AiUsageRecentItem[]>([]);
  const [mobileCursor, setMobileCursor] = useState<string | null>(null);
  // Recalcula o range só quando o período muda (evita refetch a cada render).
  const range = useMemo(() => resolvePeriodRange(period), [period]);
  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);
  // Mobile usa limite menor (10) e cursor próprio (avança ao "Carregar mais");
  // desktop mantém a paginação por cursorStack (Anterior/Próxima) com PAGE_LIMIT.
  const limit = isMobile ? "10" : PAGE_LIMIT;
  const currentCursor = isMobile ? mobileCursor : cursorStack.at(-1) ?? null;
  // Identidade da consulta mobile: qualquer mudança (período/filtro/viewport)
  // reinicia a lista acumulada e o cursor.
  const mobileResetKey = `${range.from}|${range.to}|${filterKey}|${isMobile}`;
  const mobileResetKeyRef = useRef<string>("");

  useEffect(() => {
    setCursorStack([]);
  }, [period, filterKey]);

  // Reinicia o cursor mobile ao trocar período/filtro/viewport (volta à 1ª página).
  useEffect(() => {
    setMobileCursor(null);
  }, [mobileResetKey]);

  const { data, isLoading, isError, refetch, isFetching, isPlaceholderData } =
    useAiUsageQuery({
      from: range.from,
      to: range.to,
      limit,
      cursor: currentCursor,
      ...filters,
    });

  // Acumula as páginas mobile (append). Em troca de período/filtro (resetKey novo)
  // substitui pela 1ª página; nas demais, anexa sem duplicar (dedupe por id).
  // Ignora dados placeholder (keepPreviousData) para não misturar itens stale.
  useEffect(() => {
    if (!isMobile || isPlaceholderData) {
      return;
    }
    const items = data?.recent.items;
    if (!items) {
      return;
    }

    setMobileItems((prev) => {
      if (mobileResetKeyRef.current !== mobileResetKey) {
        mobileResetKeyRef.current = mobileResetKey;
        return items;
      }
      return mergeRecentById(prev, items);
    });
  }, [isMobile, isPlaceholderData, data, mobileResetKey]);

  // Itens exibidos no mobile: a lista acumulada. Fallback para a página atual no
  // 1º frame (antes do efeito rodar), exceto quando os dados são placeholder.
  const mobileDisplayItems =
    mobileItems.length > 0 || isPlaceholderData
      ? mobileItems
      : data?.recent.items ?? [];

  const summary = data?.summary;
  const hasActiveFilters = hasActiveAiUsageFilters(filters);
  const activeFilterCount = countActiveAiUsageFilters(filters);
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

  useEffect(() => {
    if (!mobileFiltersOpen) {
      return;
    }

    setMobileDraftFilters(filters);
  }, [filters, mobileFiltersOpen]);

  useEffect(() => {
    if (!mobileFiltersOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileFiltersOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileFiltersOpen]);

  const handleOpenMobileFilters = () => {
    setMobileDraftFilters(filters);
    setMobileFiltersOpen(true);
  };

  const handleApplyMobileFilters = () => {
    setFilters(mobileDraftFilters);
    setCursorStack([]);
    setMobileFiltersOpen(false);
  };

  const handleClearMobileFilters = () => {
    setMobileDraftFilters(EMPTY_AI_USAGE_FILTERS);
    setFilters(EMPTY_AI_USAGE_FILTERS);
    setCursorStack([]);
    setMobileFiltersOpen(false);
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
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:gap-6 sm:px-6 sm:py-6">
          <header className="flex flex-col gap-2">
            <Link
              href="/"
              aria-label="Voltar para o inbox"
              className={cn(
                "inline-flex h-10 w-fit items-center gap-2 rounded-full border border-border bg-surface-raised/60 px-3.5 text-[13px] font-medium text-text-muted",
                "transition hover:bg-surface-active hover:text-text active:scale-[0.98]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              )}
            >
              <BackArrowIcon />
              <span className="sm:hidden">Inbox</span>
              <span className="hidden sm:inline">Voltar para o inbox</span>
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

                <div className="sm:hidden">
                  <button
                    type="button"
                    onClick={handleOpenMobileFilters}
                    className="flex h-11 w-full cursor-pointer items-center justify-between rounded-xl border border-border bg-surface px-4 text-[14px] font-medium text-text transition-colors hover:bg-surface-active"
                  >
                    <span className="flex items-center gap-2">
                      <FilterIcon />
                      Filtros
                    </span>
                    {activeFilterCount > 0 ? (
                      <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent">
                        {activeFilterCount}
                      </span>
                    ) : null}
                  </button>
                </div>

                <div className="hidden sm:block">
                  <UsageFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFilters}
                  />
                </div>

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
                ) : isMobile ? (
                  <RecentCards
                    items={mobileDisplayItems}
                    hasNextPage={data.recent.hasNextPage}
                    isLoadingMore={isFetching}
                    onLoadMore={() => {
                      if (data.recent.nextCursor) {
                        setMobileCursor(data.recent.nextCursor);
                      }
                    }}
                  />
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

      <MobileFilterSheet
        open={mobileFiltersOpen}
        filters={mobileDraftFilters}
        onClose={() => setMobileFiltersOpen(false)}
        onChange={(key, value) =>
          setMobileDraftFilters((current) => ({ ...current, [key]: value }))
        }
        onApply={handleApplyMobileFilters}
        onClear={handleClearMobileFilters}
      />
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
      <AiUsageFilterFields filters={filters} onChange={update} className="grid gap-3 md:grid-cols-2 lg:grid-cols-3" />
    </Card>
  );
}

function AiUsageFilterFields({
  filters,
  onChange,
  className,
}: {
  filters: AiUsageFilters;
  onChange: (key: keyof AiUsageFilters, value: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <FilterInput label="Modelo" value={filters.model} placeholder="gpt-5.4" onChange={(value) => onChange("model", value)} />
      <FilterInput
        label="Conversa"
        value={filters.conversationId}
        placeholder="ID da conversa"
        onChange={(value) => onChange("conversationId", value)}
      />
      <FilterSelect
        label="Origem"
        value={filters.source}
        onChange={(value) => onChange("source", value)}
        options={[
          { value: "", label: "Todas" },
          { value: "openai", label: "OpenAI" },
          { value: "stub", label: "Stub" },
        ]}
      />
      <FilterSelect
        label="Risco"
        value={filters.riskLevel}
        onChange={(value) => onChange("riskLevel", value)}
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
        onChange={(value) => onChange("blocked", value)}
        options={[
          { value: "", label: "Todos" },
          { value: "true", label: "Sim" },
          { value: "false", label: "Não" },
        ]}
      />
      <FilterSelect
        label="Fluxo"
        value={filters.stage}
        onChange={(value) => onChange("stage", value)}
        options={[
          { value: "", label: "Todos" },
          { value: "input", label: "Entrada" },
          { value: "output", label: "Saída" },
          { value: "recurring", label: "Recorrência" },
          { value: "auto_reply", label: "Auto-reply" },
        ]}
      />
    </div>
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
    <Card className="flex min-w-0 flex-col gap-1 p-3 sm:p-4">
      <span className="text-[11px] text-text-muted sm:text-[12px]">{label}</span>
      <span className="truncate text-[17px] font-semibold tabular-nums text-text sm:text-[20px]">{value}</span>
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

/** Anexa `incoming` a `prev` sem duplicar (dedupe por id), preservando a ordem. */
function mergeRecentById(
  prev: AiUsageRecentItem[],
  incoming: AiUsageRecentItem[]
): AiUsageRecentItem[] {
  const seen = new Set(prev.map((item) => item.id));
  const appended = incoming.filter((item) => !seen.has(item.id));
  return appended.length > 0 ? [...prev, ...appended] : prev;
}

function RecentCards({
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
    return (
      <Card className="p-6">
        <EmptyState title="Sem interações recentes" description="As últimas interações de IA aparecem aqui." />
      </Card>
    );
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
              <div className="shrink-0 text-[13px] font-semibold tabular-nums text-text">
                {formatCostUsd(item.estimatedCostUsd)}
              </div>
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
              <MetricRow label="Entrada" value={formatTokens(item.promptTokens)} />
              <MetricRow label="Saída" value={formatTokens(item.completionTokens)} />
              <MetricRow label="Cache" value={formatTokens(item.cachedPromptTokens)} />
              <MetricRow label="Duração" value={formatDurationMs(item.durationMs)} />
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
        <p className="py-2 text-center text-[12px] text-text-muted">
          Todos os registros carregados
        </p>
      )}
    </div>
  );
}

function MobileFilterSheet({
  open,
  filters,
  onClose,
  onChange,
  onApply,
  onClear,
}: {
  open: boolean;
  filters: AiUsageFilters;
  onClose: () => void;
  onChange: (key: keyof AiUsageFilters, value: string) => void;
  onApply: () => void;
  onClear: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        aria-label="Fechar filtros"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/55 sm:hidden"
      />
      <div className="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] rounded-t-2xl border-t border-border bg-surface px-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] pt-4 shadow-[0_-18px_48px_rgba(0,0,0,0.45)] sm:hidden">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border" />
        <div className="flex max-h-[calc(85dvh-14px)] flex-col">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[16px] font-semibold text-text">Filtros</h2>
              <p className="text-[12px] text-text-muted">Ajuste os filtros e aplique para atualizar a lista.</p>
            </div>
            <button
              type="button"
              aria-label="Fechar filtros"
              onClick={onClose}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-active hover:text-text"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-1">
            <AiUsageFilterFields
              filters={filters}
              onChange={onChange}
              className="grid gap-3"
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onClear}
              className="cursor-pointer rounded-xl border border-border px-4 py-3 text-[13px] font-medium text-text-muted transition-colors hover:bg-surface-active hover:text-text"
            >
              Limpar filtros
            </button>
            <button
              type="button"
              onClick={onApply}
              className="cursor-pointer rounded-xl bg-accent px-4 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              Aplicar filtros
            </button>
          </div>
        </div>
      </div>
    </>
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

function BlockedPill({ blocked }: { blocked: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[11px] font-medium",
        blocked ? "bg-danger/15 text-danger" : "bg-surface-active text-text-muted"
      )}
    >
      {blocked ? "bloqueado" : "não bloqueado"}
    </span>
  );
}

function MetaPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-surface-active px-2 py-0.5 text-[11px] font-medium text-text-muted">
      {children}
    </span>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-surface-active/45 px-2.5 py-2">
      <span className="text-text-muted">{label}</span>
      <span className="font-medium tabular-nums text-text">{value}</span>
    </div>
  );
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

function FilterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6h16M7 12h10M10 18h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function BackArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M12 19l-7-7 7-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

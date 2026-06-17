"use client";

import { useEffect } from "react";
import { AppRail, AiUsageIcon, ChatIcon, ContactsIcon } from "@/components/shared/app-rail";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { useIsMobileViewport } from "@/modules/inbox/hooks/use-is-mobile-viewport";
import { useAiUsageQuery } from "@/modules/ai-usage/hooks/usage/use-ai-usage-query";
import { useAiUsageFilters } from "@/modules/ai-usage/hooks/filters/use-ai-usage-filters";
import { useAiUsageDesktopPagination } from "@/modules/ai-usage/hooks/pagination/use-ai-usage-desktop-pagination";
import { useAiUsageMobilePagination } from "@/modules/ai-usage/hooks/pagination/use-ai-usage-mobile-pagination";
import { AiUsagePageHeader } from "@/modules/ai-usage/components/page/ai-usage-page-header";
import { AiUsagePeriodTabs } from "@/modules/ai-usage/components/page/ai-usage-period-tabs";
import { AiUsageSkeleton } from "@/modules/ai-usage/components/page/ai-usage-skeleton";
import { AiUsageMetricGrid } from "@/modules/ai-usage/components/metrics/ai-usage-metric-grid";
import { AiUsageFiltersPanel } from "@/modules/ai-usage/components/filters/ai-usage-filters-panel";
import { AiUsageMobileFilterSheet } from "@/modules/ai-usage/components/filters/ai-usage-mobile-filter-sheet";
import { AiUsageRecentTable } from "@/modules/ai-usage/components/recent/ai-usage-recent-table";
import { AiUsageRecentCards } from "@/modules/ai-usage/components/recent/ai-usage-recent-cards";
import { FilterIcon } from "@/modules/ai-usage/components/shared/ai-usage-icons";

const DESKTOP_PAGE_LIMIT = "20";
const MOBILE_PAGE_LIMIT = "10";

export function AiUsagePage() {
  const isMobile = useIsMobileViewport();
  const {
    period,
    setPeriod,
    filters,
    handleFilterChange,
    handleClearFilters,
    hasActiveFilters,
    activeFilterCount,
    range,
    filterKey,
    mobileFiltersOpen,
    openMobileFilters,
    closeMobileFilters,
    mobileDraftFilters,
    setMobileDraftFilter,
    applyMobileFilters,
    clearMobileFilters,
  } = useAiUsageFilters();

  const desktopResetKey = `${range.from}|${range.to}|${filterKey}`;
  const mobileResetKey = `${desktopResetKey}|${isMobile}`;

  const desktopPagination = useAiUsageDesktopPagination(desktopResetKey);
  const {
    cursor: mobileCursor,
    ingest: ingestMobile,
    loadMore: loadMoreMobile,
    getDisplayItems: getMobileDisplayItems,
  } = useAiUsageMobilePagination({ resetKey: mobileResetKey, isMobile });

  const limit = isMobile ? MOBILE_PAGE_LIMIT : DESKTOP_PAGE_LIMIT;
  const currentCursor = isMobile ? mobileCursor : desktopPagination.cursor;

  const { data, isLoading, isError, refetch, isFetching, isPlaceholderData } = useAiUsageQuery({
    from: range.from,
    to: range.to,
    limit,
    cursor: currentCursor,
    ...filters,
  });

  // Acumula as páginas mobile a partir do resultado da query (o hook ignora dados
  // placeholder e reinicia quando o resetKey — período/filtro/viewport — muda).
  useEffect(() => {
    ingestMobile(data?.recent, isPlaceholderData);
  }, [ingestMobile, data, isPlaceholderData]);

  const mobileDisplayItems = getMobileDisplayItems(data?.recent, isPlaceholderData);

  const summary = data?.summary;
  const isEmpty = !!summary && summary.totalInteractions === 0;
  const isFilteredEmpty = isEmpty && hasActiveFilters;

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
          <AiUsagePageHeader />

          <AiUsagePeriodTabs period={period} onChange={setPeriod} isRefreshing={isFetching && !isLoading} />

          {isLoading ? (
            <AiUsageSkeleton />
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
                {!isFilteredEmpty && <AiUsageMetricGrid summary={summary} />}

                <div className="sm:hidden">
                  <button
                    type="button"
                    onClick={openMobileFilters}
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
                  <AiUsageFiltersPanel filters={filters} onFilterChange={handleFilterChange} onClearFilters={handleClearFilters} />
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
                  <AiUsageRecentCards
                    items={mobileDisplayItems}
                    hasNextPage={data.recent.hasNextPage}
                    isLoadingMore={isFetching}
                    onLoadMore={() => loadMoreMobile(data.recent.nextCursor)}
                  />
                ) : (
                  <AiUsageRecentTable
                    items={data.recent.items}
                    hasNextPage={data.recent.hasNextPage}
                    pageIndex={desktopPagination.pageIndex}
                    isFetching={isFetching}
                    onPrevious={desktopPagination.goPrevious}
                    onNext={() => desktopPagination.goNext(data.recent.nextCursor)}
                  />
                )}
              </>
            )
          )}
        </div>
      </div>

      <AiUsageMobileFilterSheet
        open={mobileFiltersOpen}
        filters={mobileDraftFilters}
        onClose={closeMobileFilters}
        onChange={setMobileDraftFilter}
        onApply={applyMobileFilters}
        onClear={clearMobileFilters}
      />
    </div>
  );
}

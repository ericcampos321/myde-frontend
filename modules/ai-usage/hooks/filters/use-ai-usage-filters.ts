import { useCallback, useEffect, useMemo, useState } from "react";
import {
  countActiveAiUsageFilters,
  EMPTY_AI_USAGE_FILTERS,
  hasActiveAiUsageFilters,
  type AiUsageFilters,
} from "@/modules/ai-usage/utils/filters/ai-usage-filter-utils";
import {
  DEFAULT_AI_USAGE_PERIOD,
  resolvePeriodRange,
  type AiUsagePeriodId,
} from "@/modules/ai-usage/utils/period/ai-usage-period";

/**
 * Estado de período + filtros (desktop e bottom sheet mobile) do painel /ai-usage.
 * A reinicialização da paginação NÃO é feita aqui: ela é derivada de `range` +
 * `filterKey` pelos hooks de paginação (via resetKey), mantendo este hook focado
 * só no estado de filtros.
 */
export function useAiUsageFilters() {
  const [period, setPeriod] = useState<AiUsagePeriodId>(DEFAULT_AI_USAGE_PERIOD);
  const [filters, setFilters] = useState<AiUsageFilters>(EMPTY_AI_USAGE_FILTERS);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileDraftFilters, setMobileDraftFilters] =
    useState<AiUsageFilters>(EMPTY_AI_USAGE_FILTERS);

  const range = useMemo(() => resolvePeriodRange(period), [period]);
  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);

  const hasActiveFilters = hasActiveAiUsageFilters(filters);
  const activeFilterCount = countActiveAiUsageFilters(filters);

  const handleFilterChange = useCallback(
    (key: keyof AiUsageFilters, value: string) => {
      setFilters((current) => ({ ...current, [key]: value }));
    },
    []
  );

  const handleClearFilters = useCallback(() => {
    setFilters(EMPTY_AI_USAGE_FILTERS);
  }, []);

  // Mantém o rascunho do bottom sheet em sincronia com os filtros aplicados.
  useEffect(() => {
    if (!mobileFiltersOpen) {
      return;
    }
    setMobileDraftFilters(filters);
  }, [filters, mobileFiltersOpen]);

  // Bottom sheet aberto: trava o scroll do body e fecha no Escape.
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

  const openMobileFilters = useCallback(() => {
    setMobileDraftFilters(filters);
    setMobileFiltersOpen(true);
  }, [filters]);

  const closeMobileFilters = useCallback(() => {
    setMobileFiltersOpen(false);
  }, []);

  const setMobileDraftFilter = useCallback(
    (key: keyof AiUsageFilters, value: string) => {
      setMobileDraftFilters((current) => ({ ...current, [key]: value }));
    },
    []
  );

  const applyMobileFilters = useCallback(() => {
    setFilters(mobileDraftFilters);
    setMobileFiltersOpen(false);
  }, [mobileDraftFilters]);

  const clearMobileFilters = useCallback(() => {
    setMobileDraftFilters(EMPTY_AI_USAGE_FILTERS);
    setFilters(EMPTY_AI_USAGE_FILTERS);
    setMobileFiltersOpen(false);
  }, []);

  return {
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
  };
}

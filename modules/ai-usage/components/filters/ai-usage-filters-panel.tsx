import { Card } from "@/components/ui/card";
import { AiUsageFilterFields } from "@/modules/ai-usage/components/filters/ai-usage-filter-fields";
import type { AiUsageFilters } from "@/modules/ai-usage/types/ai-usage.types";

export function AiUsageFiltersPanel({
  filters,
  onFilterChange,
  onClearFilters,
}: {
  filters: AiUsageFilters;
  onFilterChange: (key: keyof AiUsageFilters, value: string) => void;
  onClearFilters: () => void;
}) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-[14px] font-semibold text-text">Filtros</h2>
        <button type="button" onClick={onClearFilters} className="cursor-pointer text-[12px] font-medium text-accent hover:text-accent/80">
          Limpar filtros
        </button>
      </div>
      <AiUsageFilterFields filters={filters} onChange={onFilterChange} className="grid gap-3 md:grid-cols-2 lg:grid-cols-3" />
    </Card>
  );
}

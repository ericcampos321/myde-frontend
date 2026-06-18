import { AiUsageFilterFields } from "@/modules/ai-usage/components/filters/ai-usage-filter-fields";
import { CloseIcon } from "@/modules/ai-usage/components/shared/ai-usage-icons";
import type { AiUsageFilters } from "@/modules/ai-usage/types/ai-usage.types";

export function AiUsageMobileFilterSheet({
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
      <button type="button" aria-label="Fechar filtros" onClick={onClose} className="fixed inset-0 z-40 bg-black/55 sm:hidden" />
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
            <AiUsageFilterFields filters={filters} onChange={onChange} className="grid gap-3" />
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

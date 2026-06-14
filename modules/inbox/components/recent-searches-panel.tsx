"use client";

import { Avatar } from "@/components/ui/avatar";
import type { RecentSearch } from "@/modules/inbox/types/inbox.types";

interface RecentSearchesPanelProps {
  items: RecentSearch[];
  onOpen: (item: RecentSearch) => void;
  onClear: () => void;
  isClearing: boolean;
}

export function RecentSearchesPanel({ items, onOpen, onClear, isClearing }: RecentSearchesPanelProps) {
  if (items.length === 0) return null;

  return (
    <section className="border-b border-border/35 px-4 pb-4 pt-2" onMouseDown={(event) => event.preventDefault()}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-text">Pesquisas recentes</h3>
        <button
          type="button"
          aria-label="Limpar todas as pesquisas recentes"
          onClick={onClear}
          disabled={isClearing}
          className="rounded-full px-3 py-1.5 text-[11px] font-medium text-accent transition-colors hover:bg-accent/10 disabled:cursor-default disabled:opacity-50"
        >
          Limpar tudo
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={!item.canOpen || !item.conversationId}
            onClick={() => onOpen(item)}
            title={item.canOpen ? item.label : `${item.label} sem conversa disponível`}
            className="flex min-w-0 flex-col items-center rounded-xl px-1 py-2 text-center transition-colors enabled:hover:bg-surface-raised/70 disabled:cursor-default disabled:opacity-55"
          >
            <Avatar name={item.label} size="md" className="h-11 w-11 ring-1 ring-white/5" />
            <span className="mt-1.5 w-full truncate text-[11px] font-medium text-text">{item.label}</span>
            <span className="w-full truncate text-[9.5px] text-text-muted/75">{item.subtitle}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

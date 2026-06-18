"use client";

import { Input } from "@/components/ui/input";

interface ConversationSearchProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onEscape?: () => void;
}

export function ConversationSearch({
  value,
  onChange,
  placeholder = "Pesquisar conversa",
  onFocus,
  onEscape,
}: ConversationSearchProps) {
  return (
    <div className="relative">
      <SearchIcon />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            event.currentTarget.blur();
            onEscape?.();
          }
        }}
        className="h-[35px] rounded-[14px] border border-transparent bg-surface-raised pl-11 pr-4 text-[14px] placeholder:text-text-muted focus:border-transparent focus:bg-surface-raised focus:ring-0"
        aria-label="Buscar conversa"
      />
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

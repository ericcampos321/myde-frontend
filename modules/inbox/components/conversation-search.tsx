"use client";

import { Input } from "@/components/ui/input";

interface ConversationSearchProps {
  value: string;
  onChange: (v: string) => void;
}

export function ConversationSearch({ value, onChange }: ConversationSearchProps) {
  return (
    <div className="relative">
      <SearchIcon />
      <Input
        type="search"
        placeholder="Pesquisar conversa"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[42px] rounded-full border-transparent bg-surface-raised/90 pl-10 pr-4 text-[13px] shadow-inner shadow-black/10 placeholder:text-text-muted/80 focus:border-accent/80 focus:bg-surface-raised focus:ring-accent/50"
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

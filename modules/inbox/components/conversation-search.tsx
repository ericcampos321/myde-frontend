"use client";

import { Input } from "@/components/ui/input";

interface ConversationSearchProps {
  value: string;
  onChange: (v: string) => void;
}

export function ConversationSearch({ value, onChange }: ConversationSearchProps) {
  return (
    <div className="px-3 py-2">
      <div className="relative">
        <SearchIcon />
        <Input
          type="search"
          placeholder="Buscar conversa..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-8 h-8 text-xs"
          aria-label="Buscar conversa"
        />
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

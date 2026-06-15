"use client";

import { useMemo, useState } from "react";
import { useDebouncedValue } from "@/modules/inbox/hooks/use-debounced-value";
import { useMessageSearchQuery } from "@/modules/inbox/hooks/use-message-search-query";
import { highlightSearchTerm } from "@/modules/inbox/utils/highlight-search-term";
import { shouldSearchMessages } from "@/modules/inbox/utils/should-search-messages";
import { formatMessageTime } from "@/modules/inbox/utils/format-message-time";
import { MessageSearchCalendar } from "./message-search-calendar";
import type { MessageSearchResult } from "@/modules/inbox/types/inbox.types";

interface MessageSearchPanelProps {
  conversationId: string;
  contactName: string;
  onClose: () => void;
}

export function MessageSearchPanel({
  conversationId,
  contactName,
  onClose,
}: MessageSearchPanelProps) {
  const [term, setTerm] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const debouncedTerm = useDebouncedValue(term, 300);

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessageSearchQuery(conversationId, debouncedTerm, selectedDate);

  const results = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data]
  );

  const hasValidTerm = shouldSearchMessages(debouncedTerm);
  const hasTypedTerm = term.trim().length > 0;
  const active = hasValidTerm || !!selectedDate;

  function handleSelect(result: MessageSearchResult) {
    setNotice(null);
    const node = document.querySelector(
      `[data-message-id="${CSS.escape(result.messageId)}"]`
    );
    if (node) {
      node.scrollIntoView({ block: "center", behavior: "smooth" });
      node.classList.add("message-search-highlight");
      window.setTimeout(() => {
        node.classList.remove("message-search-highlight");
      }, 1600);
      onClose();
    } else {
      setNotice("Carregue mensagens anteriores para ver este ponto na conversa.");
    }
  }

  return (
    <aside className="message-search-panel absolute inset-0 z-20 flex h-full w-full flex-col bg-chat-header sm:static sm:inset-auto sm:w-[420px] sm:max-w-[42vw] sm:shrink-0">
      <div className="shrink-0 bg-chat-header px-4 pb-4 pt-3">
        <div className="flex h-10 items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar busca"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-text transition-colors hover:bg-surface-active focus:outline-none"
          >
            <CloseIcon />
          </button>
          <h2 className="text-[15px] font-semibold text-text">
            Pesquisar mensagens
          </h2>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              aria-label="Filtrar mensagens por data"
              title="Filtrar por data"
              onClick={() => setCalendarOpen((open) => !open)}
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-text transition-colors hover:bg-surface-active"
            >
              <MessageSearchIcon />
            </button>
            {calendarOpen && (
              <MessageSearchCalendar
                selectedDate={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  setCalendarOpen(false);
                }}
              />
            )}
          </div>
          <div className="flex h-10 min-w-0 flex-1 items-center gap-3 rounded-full bg-surface-raised px-4">
            <SearchIcon />
            <input
              autoFocus
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Pesquisar"
              aria-label="Pesquisar mensagens na conversa"
              className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[15px] text-text outline-none placeholder:text-text-muted focus:border-0 focus:outline-none focus:ring-0"
            />
          </div>
        </div>

        {selectedDate && (
          <div className="ml-[52px] mt-2 flex">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-raised px-3 py-1 text-[12px] text-text">
              {formatSelectedDate(selectedDate)}
              <button
                type="button"
                aria-label="Limpar filtro de data"
                onClick={() => setSelectedDate(null)}
                className="cursor-pointer rounded-full text-text-muted hover:text-text"
              >
                <SmallCloseIcon />
              </button>
            </span>
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {!active ? (
          <PanelHint>
            {hasTypedTerm
              ? "Digite pelo menos 2 caracteres para pesquisar."
              : `Pesquisar mensagens com ${contactName}.`}
          </PanelHint>
        ) : isLoading ? (
          <PanelHint>Pesquisando…</PanelHint>
        ) : isError ? (
          <PanelHint>
            Não foi possível pesquisar.{" "}
            <button
              type="button"
              onClick={() => refetch()}
              className="cursor-pointer text-accent hover:underline"
            >
              Tentar novamente
            </button>
          </PanelHint>
        ) : results.length === 0 ? (
          <PanelHint>
            {selectedDate
              ? hasValidTerm
                ? "Nenhuma mensagem encontrada para essa busca nesta data."
                : "Nenhuma mensagem encontrada nesta data."
              : "Nenhuma mensagem encontrada."}
          </PanelHint>
        ) : (
          <ul className="divide-y divide-border/60">
            {results.map((result) => (
              <li key={result.messageId}>
                <button
                  type="button"
                  onClick={() => handleSelect(result)}
                  className="flex w-full cursor-pointer flex-col gap-0.5 px-4 py-2.5 text-left transition-colors hover:bg-surface-active"
                >
                  <span className="text-[11px] text-text-muted">
                    {formatMessageTime(result.createdAt)}
                    {result.direction === "outbound" ? " · você" : ""}
                  </span>
                  <span className="line-clamp-2 text-[14px] text-text">
                    {highlightSearchTerm(
                      result.bodyPreview,
                      hasValidTerm ? debouncedTerm : ""
                    ).map(
                      (part, index) =>
                        part.match ? (
                          <span key={index} className="font-semibold text-accent">
                            {part.text}
                          </span>
                        ) : (
                          <span key={index}>{part.text}</span>
                        )
                    )}
                  </span>
                </button>
              </li>
            ))}

            {hasNextPage && (
              <li className="flex justify-center py-3">
                <button
                  type="button"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="cursor-pointer rounded-full bg-black/30 px-3 py-1 text-[12px] text-text-muted hover:bg-black/40 hover:text-text disabled:cursor-default"
                >
                  {isFetchingNextPage ? "Carregando…" : "Carregar mais resultados"}
                </button>
              </li>
            )}
          </ul>
        )}

        {notice && (
          <p className="px-4 py-2 text-[12px] text-text-muted" role="status">
            {notice}
          </p>
        )}
      </div>
    </aside>
  );
}

function PanelHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 py-6 text-center text-[13px] text-text-muted">{children}</p>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M18 6 6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-text-muted">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function MessageSearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="5" width="13" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7 3v4M14 3v4M4 9h13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="17.5" cy="16.5" r="3.5" fill="var(--chat-header)" stroke="currentColor" strokeWidth="1.8" />
      <path d="m20 19 2 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SmallCloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function formatSelectedDate(value: string): string {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

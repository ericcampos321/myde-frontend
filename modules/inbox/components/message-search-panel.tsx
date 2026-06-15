"use client";

import { useMemo, useState } from "react";
import { useDebouncedValue } from "@/modules/inbox/hooks/use-debounced-value";
import { useMessageSearchQuery } from "@/modules/inbox/hooks/use-message-search-query";
import { highlightSearchTerm } from "@/modules/inbox/utils/highlight-search-term";
import { shouldSearchMessages } from "@/modules/inbox/utils/should-search-messages";
import { formatMessageTime } from "@/modules/inbox/utils/format-message-time";
import type { MessageSearchResult } from "@/modules/inbox/types/inbox.types";

interface MessageSearchPanelProps {
  conversationId: string;
  onClose: () => void;
}

export function MessageSearchPanel({
  conversationId,
  onClose,
}: MessageSearchPanelProps) {
  const [term, setTerm] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const debouncedTerm = useDebouncedValue(term, 300);

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessageSearchQuery(conversationId, debouncedTerm);

  const results = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data]
  );

  const active = shouldSearchMessages(debouncedTerm);

  function handleSelect(result: MessageSearchResult) {
    setNotice(null);
    const node = document.querySelector(
      `[data-message-id="${CSS.escape(result.messageId)}"]`
    );
    if (node) {
      node.scrollIntoView({ block: "center", behavior: "smooth" });
      node.classList.add("ring-2", "ring-accent", "rounded-lg");
      window.setTimeout(() => {
        node.classList.remove("ring-2", "ring-accent", "rounded-lg");
      }, 1600);
      onClose();
    } else {
      setNotice("Carregue mensagens anteriores para ver este ponto na conversa.");
    }
  }

  return (
    <aside className="absolute inset-y-0 right-0 z-20 flex w-full flex-col border-l border-border bg-bg sm:w-[400px]">
      <div className="flex h-[60px] shrink-0 items-center gap-2 border-b border-border bg-chat-header px-3">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar busca"
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted hover:bg-surface-active hover:text-text"
        >
          <CloseIcon />
        </button>
        <input
          autoFocus
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Pesquisar mensagens"
          aria-label="Pesquisar mensagens na conversa"
          className="min-w-0 flex-1 bg-transparent text-[15px] text-text placeholder:text-text-muted focus:outline-none"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {!active ? (
          <PanelHint>Digite pelo menos 2 caracteres para pesquisar.</PanelHint>
        ) : isLoading ? (
          <PanelHint>Pesquisando…</PanelHint>
        ) : isError ? (
          <PanelHint>
            Não foi possível pesquisar.{" "}
            <button
              type="button"
              onClick={() => refetch()}
              className="text-accent hover:underline"
            >
              Tentar novamente
            </button>
          </PanelHint>
        ) : results.length === 0 ? (
          <PanelHint>Nenhuma mensagem encontrada.</PanelHint>
        ) : (
          <ul className="divide-y divide-border/60">
            {results.map((result) => (
              <li key={result.messageId}>
                <button
                  type="button"
                  onClick={() => handleSelect(result)}
                  className="flex w-full flex-col gap-0.5 px-4 py-2.5 text-left transition-colors hover:bg-surface-active"
                >
                  <span className="text-[11px] text-text-muted">
                    {formatMessageTime(result.createdAt)}
                    {result.direction === "outbound" ? " · você" : ""}
                  </span>
                  <span className="line-clamp-2 text-[14px] text-text">
                    {highlightSearchTerm(result.bodyPreview, debouncedTerm).map(
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
                  className="rounded-full bg-black/30 px-3 py-1 text-[12px] text-text-muted hover:bg-black/40 hover:text-text disabled:cursor-default"
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

"use client";

import { useCallback, useLayoutEffect, useRef, type RefObject } from "react";

/**
 * Preserva a posição visual do scroll ao PREPENDER mensagens antigas.
 *
 * Uso: chame `capture()` imediatamente antes de disparar o `fetchNextPage`.
 * Quando `itemCount` aumenta (mensagens antigas inseridas no topo), o efeito de
 * layout reposiciona o scroll mantendo o conteúdo visível no mesmo lugar:
 *   `scrollTop = novoScrollHeight - antigoScrollHeight + antigoScrollTop`.
 *
 * Para appends no fim (mensagem nova) não há `capture()` pendente → não mexe no scroll.
 */
export function useScrollPreservation(
  scrollRef: RefObject<HTMLElement | null>,
  itemCount: number
): () => void {
  const pending = useRef<{ height: number; top: number } | null>(null);

  const capture = useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      pending.current = { height: el.scrollHeight, top: el.scrollTop };
    }
  }, [scrollRef]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    const snapshot = pending.current;
    if (!el || !snapshot) return;

    el.scrollTop = el.scrollHeight - snapshot.height + snapshot.top;
    pending.current = null;
  }, [itemCount, scrollRef]);

  return capture;
}
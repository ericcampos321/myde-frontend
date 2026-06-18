import { useCallback, useEffect, useState } from "react";

/**
 * Paginação desktop por cursor stack (Anterior/Próxima). Reinicia ao mudar
 * período/filtro (via `resetKey`), voltando à primeira página.
 */
export function useAiUsageDesktopPagination(resetKey: string) {
  const [cursorStack, setCursorStack] = useState<string[]>([]);

  useEffect(() => {
    setCursorStack([]);
  }, [resetKey]);

  const cursor = cursorStack.at(-1) ?? null;
  const pageIndex = cursorStack.length;

  const goNext = useCallback((nextCursor: string | null) => {
    if (nextCursor) {
      setCursorStack((stack) => [...stack, nextCursor]);
    }
  }, []);

  const goPrevious = useCallback(() => {
    setCursorStack((stack) => stack.slice(0, -1));
  }, []);

  return { cursor, pageIndex, goNext, goPrevious };
}

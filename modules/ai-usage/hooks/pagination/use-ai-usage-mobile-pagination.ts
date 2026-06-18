import { useCallback, useEffect, useRef, useState } from "react";
import { mergeRecentById } from "@/modules/ai-usage/utils/recent/ai-usage-recent-utils";
import type {
  AiUsageRecentItem,
  AiUsageRecentPage,
} from "@/modules/ai-usage/types/ai-usage.types";

/**
 * Paginação mobile por "Carregar mais" (append). Mantém o cursor da página atual
 * e a lista acumulada; reinicia ao mudar período/filtro/viewport (via `resetKey`).
 *
 * Como o cursor alimenta a query (antes) e a acumulação depende do resultado da
 * query (depois), o orquestrador chama `ingest(page, isPlaceholderData)` em um
 * efeito após a query. `getDisplayItems` devolve a lista a exibir (fallback para a
 * página atual no 1º frame, exceto em dados placeholder).
 */
export function useAiUsageMobilePagination(params: {
  resetKey: string;
  isMobile: boolean;
}) {
  const { resetKey, isMobile } = params;
  const [cursor, setCursor] = useState<string | null>(null);
  const [items, setItems] = useState<AiUsageRecentItem[]>([]);
  const lastResetKeyRef = useRef<string>("");

  // Volta à 1ª página ao trocar período/filtro/viewport.
  useEffect(() => {
    setCursor(null);
  }, [resetKey]);

  const ingest = useCallback(
    (page: AiUsageRecentPage | undefined, isPlaceholderData: boolean) => {
      if (!isMobile || isPlaceholderData || !page) {
        return;
      }
      setItems((prev) => {
        // resetKey novo (período/filtro): substitui pela 1ª página; senão anexa.
        if (lastResetKeyRef.current !== resetKey) {
          lastResetKeyRef.current = resetKey;
          return page.items;
        }
        return mergeRecentById(prev, page.items);
      });
    },
    [isMobile, resetKey]
  );

  const loadMore = useCallback((nextCursor: string | null) => {
    if (nextCursor) {
      setCursor(nextCursor);
    }
  }, []);

  const getDisplayItems = useCallback(
    (page: AiUsageRecentPage | undefined, isPlaceholderData: boolean) =>
      items.length > 0 || isPlaceholderData ? items : page?.items ?? [],
    [items]
  );

  return { cursor, items, ingest, loadMore, getDisplayItems };
}

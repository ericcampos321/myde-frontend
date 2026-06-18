import { useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/http/api-client";
import type { MessageSearchPage } from "@/modules/inbox/types/inbox.types";
import { shouldSearchMessages } from "@/modules/inbox/utils/should-search-messages";

const SEARCH_LIMIT = "20";

/**
 * Busca paginada de mensagens dentro da conversa.
 *
 * `term` deve vir já com debounce. A busca habilita com termo válido ou data
 * selecionada. Resultados em DESC; `fetchNextPage` traz resultados mais antigos.
 */
export function useMessageSearchQuery(
  conversationId: string | null,
  term: string,
  selectedDate: string | null
) {
  const normalizedTerm = term.trim();

  return useInfiniteQuery({
    queryKey: [
      "conversation-message-search",
      conversationId,
      normalizedTerm.toLowerCase(),
      selectedDate,
    ],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      apiClient.get<MessageSearchPage>(
        `/conversations/${conversationId!}/messages/search`,
        {
          query: {
            q: normalizedTerm,
            date: selectedDate ?? undefined,
            limit: SEARCH_LIMIT,
            cursor: pageParam ?? undefined,
          },
        }
      ),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: !!conversationId && (shouldSearchMessages(term) || !!selectedDate),
    staleTime: 10_000,
  });
}

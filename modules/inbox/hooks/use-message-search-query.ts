import { useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/http/api-client";
import type { MessageSearchPage } from "@/modules/inbox/types/inbox.types";
import { shouldSearchMessages } from "@/modules/inbox/utils/should-search-messages";

const SEARCH_LIMIT = "20";

/**
 * Busca paginada de mensagens dentro da conversa.
 *
 * `term` deve vir já com debounce. `enabled` só quando há conversa e o termo tem
 * ao menos 2 caracteres (`shouldSearchMessages`). Resultados em DESC (match mais
 * recente primeiro); `fetchNextPage` traz resultados mais antigos.
 */
export function useMessageSearchQuery(
  conversationId: string | null,
  term: string
) {
  const normalizedTerm = term.trim();

  return useInfiniteQuery({
    queryKey: [
      "conversation-message-search",
      conversationId,
      normalizedTerm.toLowerCase(),
    ],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      apiClient.get<MessageSearchPage>(
        `/conversations/${conversationId!}/messages/search`,
        {
          query: {
            q: normalizedTerm,
            limit: SEARCH_LIMIT,
            cursor: pageParam ?? undefined,
          },
        }
      ),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: !!conversationId && shouldSearchMessages(term),
    staleTime: 10_000,
  });
}

import { useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/http/api-client";
import type { MessagePage } from "@/modules/inbox/types/inbox.types";
import { inboxQueryKeys } from "./inbox-query-keys";

const PAGE_LIMIT = "30";

/**
 * Histórico paginado por cursor da conversa.
 *
 * - `pages[0]` = página mais recente (abre no fim); páginas seguintes = mais antigas.
 * - Só a página inicial é carregada; `fetchNextPage` traz as anteriores sob demanda.
 * - Use `flattenMessagePages(data?.pages)` para a lista renderizável (ASC).
 */
export function useConversationMessagesQuery(conversationId: string | null) {
  return useInfiniteQuery({
    queryKey: inboxQueryKeys.conversationMessages(conversationId),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      apiClient.get<MessagePage>(
        `/conversations/${conversationId!}/messages`,
        {
          query: { limit: PAGE_LIMIT, before: pageParam ?? undefined },
        }
      ),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: !!conversationId,
    refetchInterval: 5_000,
    staleTime: 2_000,
  });
}

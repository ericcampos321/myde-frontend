import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/http/api-client";
import type { Message } from "@/modules/inbox/types/inbox.types";
import { inboxQueryKeys } from "./inbox-query-keys";

export function useConversationMessagesQuery(conversationId: string | null) {
  return useQuery({
    queryKey: inboxQueryKeys.conversationMessages(conversationId),
    queryFn: () =>
      apiClient.get<Message[]>(`/conversations/${conversationId!}/messages`),
    enabled: !!conversationId,
    refetchInterval: 5_000,
    staleTime: 2_000,
  });
}

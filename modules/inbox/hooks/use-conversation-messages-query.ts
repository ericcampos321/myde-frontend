import { useQuery } from "@tanstack/react-query";
import { getMessages } from "@/modules/inbox/services/inbox.service";
import { inboxQueryKeys } from "./inbox-query-keys";

export function useConversationMessagesQuery(conversationId: string | null) {
  return useQuery({
    queryKey: inboxQueryKeys.conversationMessages(conversationId),
    queryFn: () => getMessages(conversationId!),
    enabled: !!conversationId,
    refetchInterval: 5_000,
    staleTime: 2_000,
  });
}

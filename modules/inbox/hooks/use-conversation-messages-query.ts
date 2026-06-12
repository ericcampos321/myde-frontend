import { useQuery } from "@tanstack/react-query";
import { getMessages } from "@/modules/inbox/services/inbox.service";

export function useConversationMessagesQuery(conversationId: string | null) {
  return useQuery({
    queryKey: ["conversation-messages", conversationId],
    queryFn: () => getMessages(conversationId!),
    enabled: !!conversationId,
    refetchInterval: 5_000,
    staleTime: 2_000,
  });
}

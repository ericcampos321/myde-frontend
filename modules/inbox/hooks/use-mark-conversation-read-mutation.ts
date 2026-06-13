import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markConversationAsRead } from "@/modules/inbox/services/inbox.service";
import { inboxQueryKeys } from "./inbox-query-keys";
import type { Conversation } from "@/modules/inbox/types/inbox.types";

export function useMarkConversationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      marker,
    }: {
      conversationId: string;
      marker: string;
    }) => markConversationAsRead(conversationId),
    onSuccess: (_data, variables) => {
      queryClient.setQueryData<Conversation[] | undefined>(
        inboxQueryKeys.conversations,
        (current) =>
          current?.map((conversation) =>
            conversation.id === variables.conversationId
              ? { ...conversation, unread: 0 }
              : conversation
          )
      );
    },
  });
}

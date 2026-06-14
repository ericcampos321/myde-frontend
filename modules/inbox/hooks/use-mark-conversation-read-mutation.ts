import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/http/api-client";
import { inboxQueryKeys } from "./inbox-query-keys";
import type { Conversation } from "@/modules/inbox/types/inbox.types";

export function useMarkConversationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
    }: {
      conversationId: string;
      marker: string;
    }) => apiClient.post<void>(`/conversations/${conversationId}/read`),
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

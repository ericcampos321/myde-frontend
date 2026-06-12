import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessage } from "@/modules/inbox/services/inbox.service";
import type { Message } from "@/modules/inbox/types/inbox.types";

export function useSendMessageMutation(conversationId: string) {
  const queryClient = useQueryClient();
  const messagesKey = ["conversation-messages", conversationId];

  return useMutation({
    mutationFn: (text: string) => sendMessage(conversationId, { text }),

    onMutate: async (text: string) => {
      await queryClient.cancelQueries({ queryKey: messagesKey });

      const snapshot = queryClient.getQueryData<Message[]>(messagesKey);

      const optimistic: Message = {
        id: `optimistic-${Date.now()}`,
        direction: "out",
        body: text,
        status: "sent",
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Message[]>(messagesKey, (prev) => [
        ...(prev ?? []),
        optimistic,
      ]);

      return { snapshot };
    },

    onError: (_err, _text, context) => {
      if (context?.snapshot !== undefined) {
        queryClient.setQueryData<Message[]>(messagesKey, context.snapshot);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: messagesKey });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

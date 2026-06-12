import { useMutation } from "@tanstack/react-query";
import { suggestReply } from "@/modules/inbox/services/inbox.service";

export function useAiSuggestionMutation() {
  return useMutation({
    mutationFn: (conversationId: string) => suggestReply(conversationId),
  });
}

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/services/http/api-client";
import type { AiSuggestion } from "@/modules/inbox/types/inbox.types";

export function useAiSuggestionMutation() {
  return useMutation({
    mutationFn: (conversationId: string) =>
      apiClient.post<AiSuggestion>("/ai/suggest", { conversationId }),
  });
}

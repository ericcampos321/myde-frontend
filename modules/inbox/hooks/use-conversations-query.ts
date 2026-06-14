import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/http/api-client";
import type { Conversation } from "@/modules/inbox/types/inbox.types";
import { inboxQueryKeys } from "./inbox-query-keys";

export function useConversationsQuery() {
  return useQuery({
    queryKey: inboxQueryKeys.conversations,
    queryFn: () => apiClient.get<Conversation[]>("/conversations"),
    refetchInterval: 12_000,
    staleTime: 5_000,
  });
}
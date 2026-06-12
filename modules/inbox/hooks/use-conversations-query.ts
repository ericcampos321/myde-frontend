import { useQuery } from "@tanstack/react-query";
import { getConversations } from "@/modules/inbox/services/inbox.service";
import { inboxQueryKeys } from "./inbox-query-keys";

export function useConversationsQuery() {
  return useQuery({
    queryKey: inboxQueryKeys.conversations,
    queryFn: getConversations,
    refetchInterval: 12_000,
    staleTime: 5_000,
  });
}

import { useQuery } from "@tanstack/react-query";
import { getConversations } from "@/modules/inbox/services/inbox.service";

export function useConversationsQuery() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: getConversations,
    refetchInterval: 12_000,
    staleTime: 5_000,
  });
}

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/http/api-client";
import type { RecentSearch } from "@/modules/inbox/types/inbox.types";
import { inboxQueryKeys } from "./inbox-query-keys";

export function useRecentSearchesQuery() {
  return useQuery({
    queryKey: inboxQueryKeys.recentSearches,
    queryFn: () => apiClient.get<RecentSearch[]>("/recent-searches"),
    staleTime: 10_000,
  });
}

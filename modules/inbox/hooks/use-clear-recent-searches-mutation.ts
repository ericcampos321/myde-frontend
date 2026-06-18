import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/http/api-client";
import type { RecentSearch } from "@/modules/inbox/types/inbox.types";
import { inboxQueryKeys } from "./inbox-query-keys";

export function useClearRecentSearchesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.delete<void>("/recent-searches"),
    onSuccess: () => {
      queryClient.setQueryData<RecentSearch[]>(inboxQueryKeys.recentSearches, []);
    },
  });
}

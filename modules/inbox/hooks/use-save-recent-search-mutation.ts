import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/http/api-client";
import type { SaveRecentSearchPayload } from "@/modules/inbox/types/inbox.types";
import { inboxQueryKeys } from "./inbox-query-keys";

export function useSaveRecentSearchMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SaveRecentSearchPayload) =>
      apiClient.post<void>("/recent-searches", payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: inboxQueryKeys.recentSearches,
      });
    },
  });
}

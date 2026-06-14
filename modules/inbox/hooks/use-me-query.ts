import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/http/api-client";
import type { Agent } from "@/modules/inbox/types/inbox.types";
import { inboxQueryKeys } from "./inbox-query-keys";

export function useMeQuery() {
  return useQuery({
    queryKey: inboxQueryKeys.me,
    queryFn: () => apiClient.get<Agent>("/me"),
    staleTime: 60_000,
  });
}
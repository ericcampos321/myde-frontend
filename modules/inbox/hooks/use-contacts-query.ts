"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/http/api-client";
import type { Contact } from "@/modules/inbox/types/inbox.types";
import { inboxQueryKeys } from "./inbox-query-keys";

export function useContactsQuery(searchTerm: string) {
  return useQuery({
    queryKey: inboxQueryKeys.contacts(searchTerm),
    queryFn: () =>
      apiClient.get<Contact[]>("/contacts", {
        query: { q: searchTerm.trim() || undefined },
      }),
    refetchInterval: 20_000,
    staleTime: 5_000,
  });
}

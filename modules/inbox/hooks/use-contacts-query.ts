"use client";

import { useQuery } from "@tanstack/react-query";
import { getContacts } from "@/modules/inbox/services/inbox.service";
import { inboxQueryKeys } from "./inbox-query-keys";

export function useContactsQuery(searchTerm: string) {
  return useQuery({
    queryKey: inboxQueryKeys.contacts(searchTerm),
    queryFn: () => getContacts(searchTerm),
    refetchInterval: 20_000,
    staleTime: 5_000,
  });
}

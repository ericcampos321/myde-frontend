import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/modules/inbox/services/inbox.service";
import { inboxQueryKeys } from "./inbox-query-keys";

export function useMeQuery() {
  return useQuery({
    queryKey: inboxQueryKeys.me,
    queryFn: getMe,
    staleTime: 60_000,
  });
}

import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/modules/inbox/services/inbox.service";

export function useMeQuery() {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: 60_000,
  });
}

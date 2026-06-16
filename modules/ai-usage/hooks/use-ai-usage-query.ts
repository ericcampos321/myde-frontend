import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/http/api-client";
import { buildAiUsageQueryParams } from "@/modules/ai-usage/utils/ai-usage-query-params";
import type { AiUsagePage } from "@/modules/inbox/types/inbox.types";

/** Busca o painel de uso da IA (read-only) via BFF `/api/ai-usage`. */
export function useAiUsageQuery(params: {
  from: string;
  to: string;
  limit?: string;
  cursor?: string | null;
  model?: string;
  source?: string;
  provider?: string;
  riskLevel?: string;
  blocked?: string;
  conversationId?: string;
  stage?: string;
}) {
  const query = buildAiUsageQueryParams(params);
  return useQuery({
    queryKey: ["ai-usage", query],
    queryFn: () =>
      apiClient.get<AiUsagePage>("/ai-usage", {
        query,
      }),
    staleTime: 15_000,
  });
}

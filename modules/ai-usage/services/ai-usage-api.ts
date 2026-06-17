import { apiClient } from "@/services/http/api-client";
import {
  buildAiUsageQueryParams,
  type AiUsageQueryParamsInput,
} from "@/modules/ai-usage/utils/filters/ai-usage-query-params";
import type { AiUsagePage } from "@/modules/ai-usage/types/ai-usage.types";

/**
 * Acesso HTTP ao painel de uso da IA (read-only) via BFF `/api/ai-usage`. Só
 * trafega filtros seguros (sem prompt/mensagem/token) montados por
 * `buildAiUsageQueryParams`.
 */
export function fetchAiUsage(input: AiUsageQueryParamsInput): Promise<AiUsagePage> {
  return apiClient.get<AiUsagePage>("/ai-usage", {
    query: buildAiUsageQueryParams(input),
  });
}

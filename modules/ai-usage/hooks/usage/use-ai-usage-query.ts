import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchAiUsage } from "@/modules/ai-usage/services/ai-usage-api";
import {
  buildAiUsageQueryParams,
  type AiUsageQueryParamsInput,
} from "@/modules/ai-usage/utils/filters/ai-usage-query-params";

/** Busca o painel de uso da IA (read-only) via BFF `/api/ai-usage`. */
export function useAiUsageQuery(params: AiUsageQueryParamsInput) {
  const query = buildAiUsageQueryParams(params);
  return useQuery({
    queryKey: ["ai-usage", query],
    queryFn: () => fetchAiUsage(params),
    staleTime: 15_000,
    // Mantém a página anterior visível enquanto busca a próxima (paginação desktop
    // e "Carregar mais" no mobile): evita o skeleton de página inteira a cada troca
    // de cursor e permite acumular itens no mobile sem perder a lista.
    placeholderData: keepPreviousData,
  });
}

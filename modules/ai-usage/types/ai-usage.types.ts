/**
 * Ponto de entrada de tipos do módulo /ai-usage. Reexporta os contratos da API
 * (vindos de inbox.types, que o BFF já entrega de forma segura — sem prompt,
 * mensagem ou token) e os tipos de view do módulo (filtros e período).
 */
export type {
  AiUsageSummary,
  AiUsageByModel,
  AiUsageRecentItem,
  AiUsageRecentPage,
  AiUsagePage,
} from "@/modules/inbox/types/inbox.types";

export type { AiUsageFilters } from "@/modules/ai-usage/utils/filters/ai-usage-filter-utils";
export type {
  AiUsagePeriod,
  AiUsagePeriodId,
} from "@/modules/ai-usage/utils/period/ai-usage-period";

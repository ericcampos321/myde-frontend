export interface AiUsageFilters {
  model: string;
  source: string;
  riskLevel: string;
  blocked: string;
  conversationId: string;
  stage: string;
}

export const EMPTY_AI_USAGE_FILTERS: AiUsageFilters = {
  model: "",
  source: "",
  riskLevel: "",
  blocked: "",
  conversationId: "",
  stage: "",
};

export function hasActiveAiUsageFilters(filters: AiUsageFilters): boolean {
  return (
    filters.model.trim().length > 0 ||
    filters.conversationId.trim().length > 0 ||
    filters.source.trim().length > 0 ||
    filters.riskLevel.trim().length > 0 ||
    filters.blocked.trim().length > 0 ||
    filters.stage.trim().length > 0
  );
}

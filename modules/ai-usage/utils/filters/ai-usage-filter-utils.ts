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
  return countActiveAiUsageFilters(filters) > 0;
}

export function countActiveAiUsageFilters(filters: AiUsageFilters): number {
  let count = 0;

  if (filters.model.trim().length > 0) count += 1;
  if (filters.conversationId.trim().length > 0) count += 1;
  if (filters.source.trim().length > 0) count += 1;
  if (filters.riskLevel.trim().length > 0) count += 1;
  if (filters.blocked.trim().length > 0) count += 1;
  if (filters.stage.trim().length > 0) count += 1;

  return count;
}

export interface AiUsageQueryParamsInput {
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
}

export function buildAiUsageQueryParams(
  input: AiUsageQueryParamsInput
): Record<string, string> {
  const params: Record<string, string> = {
    from: input.from,
    to: input.to,
    limit: input.limit ?? "20",
  };

  for (const key of [
    "cursor",
    "model",
    "source",
    "provider",
    "riskLevel",
    "blocked",
    "conversationId",
    "stage",
  ] as const) {
    const value = input[key];
    if (typeof value === "string" && value.trim().length > 0) {
      params[key] = value.trim();
    }
  }

  return params;
}

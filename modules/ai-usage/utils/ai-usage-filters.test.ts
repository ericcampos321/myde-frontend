import { describe, expect, it } from "vitest";
import {
  EMPTY_AI_USAGE_FILTERS,
  hasActiveAiUsageFilters,
} from "@/modules/ai-usage/utils/ai-usage-filters";

describe("ai usage filters", () => {
  it("não considera filtros vazios como ativos", () => {
    expect(hasActiveAiUsageFilters(EMPTY_AI_USAGE_FILTERS)).toBe(false);
  });

  it("considera texto preenchido como filtro ativo", () => {
    expect(
      hasActiveAiUsageFilters({
        ...EMPTY_AI_USAGE_FILTERS,
        model: "gpt-5.4",
      })
    ).toBe(true);

    expect(
      hasActiveAiUsageFilters({
        ...EMPTY_AI_USAGE_FILTERS,
        conversationId: "conv-1",
      })
    ).toBe(true);
  });

  it("considera selects preenchidos como filtros ativos", () => {
    expect(
      hasActiveAiUsageFilters({
        ...EMPTY_AI_USAGE_FILTERS,
        blocked: "false",
      })
    ).toBe(true);
    expect(
      hasActiveAiUsageFilters({
        ...EMPTY_AI_USAGE_FILTERS,
        stage: "auto_reply",
      })
    ).toBe(true);
  });
});

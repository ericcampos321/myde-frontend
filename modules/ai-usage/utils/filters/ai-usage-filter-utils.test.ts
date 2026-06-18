import { describe, expect, it } from "vitest";
import {
  countActiveAiUsageFilters,
  EMPTY_AI_USAGE_FILTERS,
  hasActiveAiUsageFilters,
} from "@/modules/ai-usage/utils/filters/ai-usage-filter-utils";

describe("ai usage filters", () => {
  it("não considera filtros vazios como ativos", () => {
    expect(hasActiveAiUsageFilters(EMPTY_AI_USAGE_FILTERS)).toBe(false);
    expect(countActiveAiUsageFilters(EMPTY_AI_USAGE_FILTERS)).toBe(0);
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

  it("conta quantos filtros estão ativos", () => {
    expect(
      countActiveAiUsageFilters({
        ...EMPTY_AI_USAGE_FILTERS,
        model: "gpt-5.4",
        blocked: "false",
        stage: "auto_reply",
      })
    ).toBe(3);
  });
});

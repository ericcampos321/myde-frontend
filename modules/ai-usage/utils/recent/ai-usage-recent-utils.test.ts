import { describe, expect, it } from "vitest";
import { mergeRecentById } from "@/modules/ai-usage/utils/recent/ai-usage-recent-utils";
import type { AiUsageRecentItem } from "@/modules/ai-usage/types/ai-usage.types";

function item(id: string): AiUsageRecentItem {
  return {
    id,
    createdAt: "2026-06-14T10:00:00.000Z",
    conversationId: "conv-1",
    stage: "auto_reply",
    model: "gpt-5.4",
    source: "openai",
    provider: "openai",
    riskLevel: "low",
    blocked: false,
    promptTokens: 1,
    cachedPromptTokens: 0,
    completionTokens: 1,
    totalTokens: 2,
    estimatedCost: 0,
    estimatedCostUsd: 0,
    durationMs: 10,
  } as AiUsageRecentItem;
}

describe("mergeRecentById", () => {
  it("anexa novos itens preservando a ordem", () => {
    const merged = mergeRecentById([item("a"), item("b")], [item("c"), item("d")]);
    expect(merged.map((i) => i.id)).toEqual(["a", "b", "c", "d"]);
  });

  it("não duplica itens já presentes (dedupe por id)", () => {
    const merged = mergeRecentById([item("a"), item("b")], [item("b"), item("c")]);
    expect(merged.map((i) => i.id)).toEqual(["a", "b", "c"]);
  });

  it("retorna a mesma referência quando não há itens novos", () => {
    const prev = [item("a")];
    expect(mergeRecentById(prev, [item("a")])).toBe(prev);
  });
});

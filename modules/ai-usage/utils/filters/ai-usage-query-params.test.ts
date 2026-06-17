import { describe, expect, it } from "vitest";
import { buildAiUsageQueryParams } from "@/modules/ai-usage/utils/filters/ai-usage-query-params";

describe("buildAiUsageQueryParams", () => {
  it("inclui filtros seguros e cursor", () => {
    expect(
      buildAiUsageQueryParams({
        from: "2026-06-09T00:00:00.000Z",
        to: "2026-06-16T00:00:00.000Z",
        limit: "50",
        cursor: "abc",
        model: "gpt-5.4",
        source: "openai",
        provider: "openai",
        riskLevel: "low",
        blocked: "false",
        conversationId: "conv-1",
        stage: "auto_reply",
      })
    ).toEqual({
      from: "2026-06-09T00:00:00.000Z",
      to: "2026-06-16T00:00:00.000Z",
      limit: "50",
      cursor: "abc",
      model: "gpt-5.4",
      source: "openai",
      provider: "openai",
      riskLevel: "low",
      blocked: "false",
      conversationId: "conv-1",
      stage: "auto_reply",
    });
  });

  it("não inclui filtros vazios nem filtros textuais sensíveis", () => {
    const input = {
      from: "2026-06-09T00:00:00.000Z",
      to: "2026-06-16T00:00:00.000Z",
      model: " ",
      prompt: "não deve ir para query",
    } as Parameters<typeof buildAiUsageQueryParams>[0] & { prompt: string };
    const result = buildAiUsageQueryParams(input);

    expect(result).toEqual({
      from: "2026-06-09T00:00:00.000Z",
      to: "2026-06-16T00:00:00.000Z",
      limit: "20",
    });
    expect(result).not.toHaveProperty("prompt");
  });
});

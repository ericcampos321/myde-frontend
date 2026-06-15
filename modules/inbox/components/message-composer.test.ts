import { describe, expect, it } from "vitest";
import {
  insertEmojiAtSelection,
  resolveAiSuggestionComposerState,
} from "@/modules/inbox/components/message-composer";
import type { AiSuggestion } from "@/modules/inbox/types/inbox.types";

describe("insertEmojiAtSelection", () => {
  it("insere na posição do cursor (seleção colapsada)", () => {
    // "abcd" cursor entre b e c (2)
    expect(insertEmojiAtSelection("abcd", 2, 2, "😊")).toEqual({
      value: "ab😊cd",
      cursor: 2 + "😊".length,
    });
  });

  it("substitui o intervalo selecionado", () => {
    // seleciona "bc" (1..3)
    expect(insertEmojiAtSelection("abcd", 1, 3, "🔥")).toEqual({
      value: "a🔥d",
      cursor: 1 + "🔥".length,
    });
  });

  it("seleção invertida (start > end) é normalizada", () => {
    expect(insertEmojiAtSelection("abcd", 3, 1, "🔥")).toEqual({
      value: "a🔥d",
      cursor: 1 + "🔥".length,
    });
  });

  it("sem seleção (null/undefined) insere no fim", () => {
    expect(insertEmojiAtSelection("oi", null, null, "👍")).toEqual({
      value: "oi👍",
      cursor: "oi".length + "👍".length,
    });
    expect(insertEmojiAtSelection("oi", undefined, undefined, "👍")).toEqual({
      value: "oi👍",
      cursor: 4,
    });
  });

  it("índices fora do range são clampados ao tamanho", () => {
    expect(insertEmojiAtSelection("oi", 99, 99, "🎉")).toEqual({
      value: "oi🎉",
      cursor: "oi".length + "🎉".length,
    });
  });

  it("emoji é apenas a string (texto puro, sem HTML)", () => {
    const { value } = insertEmojiAtSelection("", 0, 0, "😊");
    expect(value).toBe("😊");
    expect(/[<>]/.test(value)).toBe(false);
  });
});

describe("resolveAiSuggestionComposerState", () => {
  it("não preenche o input quando blocked=true", () => {
    const suggestion: AiSuggestion = {
      suggestion: null,
      source: null,
      blocked: true,
      riskLevel: "high",
      riskReasons: ["prompt_injection"],
      userMessage:
        "Não consegui gerar uma sugestão segura para essa mensagem. Revise manualmente antes de responder.",
    };

    expect(resolveAiSuggestionComposerState("texto atual", suggestion)).toEqual({
      nextText: "texto atual",
      feedbackMessage:
        "Não consegui gerar uma sugestão segura para essa mensagem. Revise manualmente antes de responder.",
    });
  });

  it("usa fallback amigável quando blocked=true e userMessage não vier", () => {
    const suggestion: AiSuggestion = {
      suggestion: null,
      source: null,
      blocked: true,
      riskLevel: "high",
      riskReasons: ["policy_bypass"],
      userMessage: null,
    };

    expect(resolveAiSuggestionComposerState("manual", suggestion)).toEqual({
      nextText: "manual",
      feedbackMessage:
        "Não consegui gerar uma sugestão segura para essa mensagem. Revise manualmente antes de responder.",
    });
  });

  it("preenche o input quando suggestion válida vier liberada", () => {
    const suggestion: AiSuggestion = {
      suggestion: "Temos planos residenciais.",
      source: "openai",
      blocked: false,
      riskLevel: "low",
      riskReasons: [],
      userMessage: null,
    };

    expect(resolveAiSuggestionComposerState("manual", suggestion)).toEqual({
      nextText: "Temos planos residenciais.",
      feedbackMessage: null,
    });
  });

  it("mostra fallback amigável quando não bloqueou mas suggestion veio vazia", () => {
    const suggestion: AiSuggestion = {
      suggestion: "   ",
      source: "stub",
      blocked: false,
      riskLevel: "low",
      riskReasons: [],
      userMessage: null,
    };

    expect(resolveAiSuggestionComposerState("texto manual", suggestion)).toEqual({
      nextText: "texto manual",
      feedbackMessage: "Não foi possível gerar uma sugestão para essa conversa.",
    });
  });
});

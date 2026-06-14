import { describe, expect, it } from "vitest";
import {
  resolveAiSuggestionComposerState,
} from "@/modules/inbox/components/message-composer";
import type { AiSuggestion } from "@/modules/inbox/types/inbox.types";

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

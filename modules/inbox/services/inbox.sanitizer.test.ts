import { describe, expect, it } from "vitest";
import {
  sanitizeAgent,
  sanitizeAiSuggestion,
  sanitizeContact,
  sanitizeConversation,
  sanitizeAiUsagePage,
  sanitizeMessage,
  sanitizeMessagePage,
  sanitizeMessageSearchPage,
  sanitizeRecentSearch,
  sanitizeUrl,
} from "@/modules/inbox/services/inbox.sanitizer";
import type {
  RawAgent,
  RawAiSuggestion,
  RawAiUsagePage,
  RawContact,
  RawConversation,
  RawMessage,
  RawMessagePage,
  RawMessageSearchPage,
  RawRecentSearch,
} from "@/modules/inbox/services/inbox.raw.types";

// Helpers: partem de um raw válido e permitem sobrescrever campos (inclusive
// com valores inválidos, via cast) para exercitar os fallbacks.
function makeMessage(overrides: Record<string, unknown> = {}): RawMessage {
  return {
    id: "m1",
    direction: "in",
    body: "ola",
    status: "sent",
    createdAt: "2026-06-14T01:02:23.000Z",
    ...overrides,
  } as unknown as RawMessage;
}

describe("sanitizeText (via sanitizeMessage.body)", () => {
  it('remove <script> e mantém o texto: "<script>alert(1)</script>Olá" -> "Olá"', () => {
    const result = sanitizeMessage(
      makeMessage({ body: "<script>alert(1)</script>Olá" })
    );
    expect(result.body).toBe("alert(1)Olá");
  });

  it('remove tag com handler: "<img src=x onerror=alert(1)>Oi" -> "Oi"', () => {
    const result = sanitizeMessage(
      makeMessage({ body: "<img src=x onerror=alert(1)>Oi" })
    );
    expect(result.body).toBe("Oi");
  });

  it('mantém pontuação/legibilidade: "O\'Brien / teste" permanece igual', () => {
    const result = sanitizeMessage(makeMessage({ body: "O'Brien / teste" }));
    expect(result.body).toBe("O'Brien / teste");
  });

  it("preserva quebras de linha no body", () => {
    const result = sanitizeMessage(makeMessage({ body: "linha1\nlinha2\ncol" }));
    expect(result.body).toBe("linha1\nlinha2\ncol");
  });

  it("remove caracteres de controle, preservando \\t e \\n", () => {
    const result = sanitizeMessage(
      makeMessage({ body: "a" + String.fromCharCode(7) + "b\tc\nd" })
    );
    expect(result.body).toBe("ab\tc\nd");
  });
});

describe("enums por whitelist", () => {
  it("direction inválido vira fallback 'in'", () => {
    expect(sanitizeMessage(makeMessage({ direction: "sideways" })).direction).toBe(
      "in"
    );
  });

  it("status inválido vira fallback 'sent'", () => {
    expect(sanitizeMessage(makeMessage({ status: "exploded" })).status).toBe(
      "sent"
    );
  });

  it("targetType inválido vira fallback 'contact'", () => {
    const raw = {
      id: "r1",
      targetType: "hacker",
      targetId: "t1",
      conversationId: null,
      label: "x",
      subtitle: "y",
      avatarInitials: "XY",
      updatedAt: "2026-06-14T00:00:00.000Z",
      canOpen: true,
    } as unknown as RawRecentSearch;
    expect(sanitizeRecentSearch(raw).targetType).toBe("contact");
  });

  it("source de IA inválido vira fallback 'stub'", () => {
    const raw = {
      suggestion: "oi",
      source: "skynet",
      blocked: false,
      riskLevel: "low",
      riskReasons: [],
      userMessage: null,
    } as unknown as RawAiSuggestion;
    expect(sanitizeAiSuggestion(raw).source).toBe(null);
  });
});

describe("sanitizeAiSuggestion", () => {
  it("preserva blocked true e suggestion null", () => {
    const raw = {
      suggestion: null,
      source: null,
      blocked: true,
      riskLevel: "high",
      riskReasons: ["prompt_injection", "secret_extraction"],
      userMessage:
        "Não consegui gerar uma sugestão segura para essa mensagem. Revise manualmente antes de responder.",
    } as RawAiSuggestion;

    expect(sanitizeAiSuggestion(raw)).toEqual({
      suggestion: null,
      source: null,
      blocked: true,
      riskLevel: "high",
      riskReasons: ["prompt_injection", "secret_extraction"],
      userMessage:
        "Não consegui gerar uma sugestão segura para essa mensagem. Revise manualmente antes de responder.",
    });
  });

  it("aceita resposta normal com suggestion string", () => {
    const raw = {
      suggestion: "Temos planos residenciais.",
      source: "openai",
      blocked: false,
      riskLevel: "low",
      riskReasons: [],
      userMessage: null,
    } as RawAiSuggestion;

    expect(sanitizeAiSuggestion(raw)).toEqual({
      suggestion: "Temos planos residenciais.",
      source: "openai",
      blocked: false,
      riskLevel: "low",
      riskReasons: [],
      userMessage: null,
    });
  });

  it("normaliza riskLevel inválido para low", () => {
    const raw = {
      suggestion: "ok",
      source: "stub",
      blocked: false,
      riskLevel: "extreme",
      riskReasons: [],
      userMessage: null,
    } as unknown as RawAiSuggestion;

    expect(sanitizeAiSuggestion(raw).riskLevel).toBe("low");
  });

  it("deduplica e sanitiza riskReasons", () => {
    const raw = {
      suggestion: null,
      source: null,
      blocked: true,
      riskLevel: "high",
      riskReasons: [
        " prompt_injection ",
        "prompt_injection",
        "policy_bypass",
        "<b>policy_bypass</b>",
        "nao-existe",
      ],
      userMessage: "<b>Revise</b> manualmente",
    } as unknown as RawAiSuggestion;

    expect(sanitizeAiSuggestion(raw)).toEqual({
      suggestion: null,
      source: null,
      blocked: true,
      riskLevel: "high",
      riskReasons: ["prompt_injection", "policy_bypass"],
      userMessage: "Revise manualmente",
    });
  });
});

describe("datas normalizadas para ISO ou null", () => {
  it("data inválida vira null", () => {
    expect(sanitizeMessage(makeMessage({ createdAt: "not-a-date" })).createdAt).toBe(
      null
    );
  });

  it("data ausente (undefined) vira null", () => {
    expect(sanitizeMessage(makeMessage({ createdAt: undefined })).createdAt).toBe(
      null
    );
  });

  it("data válida é normalizada para ISO", () => {
    expect(
      sanitizeMessage(makeMessage({ createdAt: "2026-06-14T01:02:23.000Z" }))
        .createdAt
    ).toBe("2026-06-14T01:02:23.000Z");
  });
});

describe("campos estruturais", () => {
  it("avatarColor inválido vira fallback; hex válido é mantido", () => {
    const base = {
      id: "c1",
      contactName: "Bruna",
      contactPhone: "5514988350035",
      avatarColor: "#2F855A",
      unread: 2,
      lastMessage: "oi",
      lastMessageAt: "2026-06-14T01:02:23.000Z",
      lastInboundMessageId: "msg-in-1",
      lastInboundMessageAt: "2026-06-14T01:02:20.000Z",
    } as unknown as RawConversation;

    expect(sanitizeConversation(base).avatarColor).toBe("#2F855A");
    expect(sanitizeConversation(base).lastInboundMessageId).toBe("msg-in-1");
    expect(sanitizeConversation(base).lastInboundMessageAt).toBe(
      "2026-06-14T01:02:20.000Z"
    );
    expect(
      sanitizeConversation({
        ...base,
        avatarColor: "javascript:alert(1)",
      } as unknown as RawConversation).avatarColor
    ).toBe("#6a7175");
  });

  it("unread coage para número não-negativo (inválido -> 0)", () => {
    const base = {
      id: "c1",
      contactName: "Bruna",
      contactPhone: "55",
      avatarColor: "#2F855A",
      unread: -5,
      lastMessage: "oi",
      lastMessageAt: null,
    } as unknown as RawConversation;
    expect(sanitizeConversation(base).unread).toBe(0);
  });

  it("id numérico é coagido para string", () => {
    expect(sanitizeMessage(makeMessage({ id: 123 })).id).toBe("123");
  });

  it("descarta campos extras do DTO cru (sanitização de shape)", () => {
    const result = sanitizeMessage(
      makeMessage({ secret: "nao-deve-vazar", body: "ok" })
    );
    expect(result).not.toHaveProperty("secret");
    expect(Object.keys(result).sort()).toEqual(
      ["body", "createdAt", "direction", "id", "status"].sort()
    );
  });

  it("agent: capabilities coage para boolean estrito", () => {
    const raw = {
      id: "a1",
      name: "NeoFibra",
      role: "Inbox",
      capabilities: { sendMessage: 1, aiSuggestion: true },
    } as unknown as RawAgent;
    const agent = sanitizeAgent(raw);
    expect(agent.capabilities.sendMessage).toBe(false);
    expect(agent.capabilities.aiSuggestion).toBe(true);
  });

  it("contact: profileName preserva null; datas viram null se inválidas", () => {
    const raw = {
      id: "ct1",
      name: "X",
      phone: "55",
      profileName: null,
      createdAt: "lixo",
      updatedAt: "2026-06-14T00:00:00.000Z",
    } as unknown as RawContact;
    const c = sanitizeContact(raw);
    expect(c.profileName).toBe(null);
    expect(c.createdAt).toBe(null);
    expect(c.updatedAt).toBe("2026-06-14T00:00:00.000Z");
  });
});

describe("sanitizeUrl", () => {
  it("aceita http e https", () => {
    expect(sanitizeUrl("https://exemplo.com/x")).toBe("https://exemplo.com/x");
    expect(sanitizeUrl("http://exemplo.com/")).toBe("http://exemplo.com/");
  });

  it("rejeita javascript: e outros protocolos -> null", () => {
    expect(sanitizeUrl("javascript:alert(1)")).toBe(null);
    expect(sanitizeUrl("ftp://x/y")).toBe(null);
    expect(sanitizeUrl("not a url")).toBe(null);
    expect(sanitizeUrl(123)).toBe(null);
  });
});

describe("sanitizeMessagePage", () => {
  it("sanitiza items e preserva nextCursor/hasMore", () => {
    const raw = {
      items: [
        {
          id: "m1",
          direction: "in",
          body: "<script>x</script>Oi",
          status: "sent",
          createdAt: "2026-06-14T01:02:23.000Z",
          secret: "nao-vaza",
        },
      ],
      nextCursor: "Y3Vyc29y",
      hasMore: true,
      extra: "descartar",
    } as unknown as RawMessagePage;

    const page = sanitizeMessagePage(raw);

    expect(page).toEqual({
      items: [
        {
          id: "m1",
          direction: "in",
          body: "xOi",
          status: "sent",
          createdAt: "2026-06-14T01:02:23.000Z",
        },
      ],
      nextCursor: "Y3Vyc29y",
      hasMore: true,
    });
    expect(page.items[0]).not.toHaveProperty("secret");
  });

  it("nextCursor não-string vira null; hasMore coage para boolean; items ausente vira []", () => {
    const page = sanitizeMessagePage({
      nextCursor: 123,
      hasMore: "yes",
    } as unknown as RawMessagePage);

    expect(page.items).toEqual([]);
    expect(page.nextCursor).toBe(null);
    expect(page.hasMore).toBe(true);

    expect(
      sanitizeMessagePage({
        items: [],
        nextCursor: null,
        hasMore: false,
      } as RawMessagePage).hasMore
    ).toBe(false);
  });
});

describe("sanitizeMessageSearchPage", () => {
  it("sanitiza items (whitelists, ids, datas, texto) e descarta extras", () => {
    const raw = {
      items: [
        {
          messageId: "m1",
          conversationId: "c1",
          bodyPreview: "<b>Suave</b> Eric",
          direction: "outbound",
          status: "read",
          createdAt: "2026-06-14T01:02:23.000Z",
          matchedText: "Er",
          secret: "nao-vaza",
        },
      ],
      nextCursor: "Y3Vyc29y",
      hasMore: true,
      extra: "x",
    } as unknown as RawMessageSearchPage;

    const page = sanitizeMessageSearchPage(raw);

    expect(page).toEqual({
      items: [
        {
          messageId: "m1",
          conversationId: "c1",
          bodyPreview: "Suave Eric",
          direction: "outbound",
          status: "read",
          createdAt: "2026-06-14T01:02:23.000Z",
          matchedText: "Er",
        },
      ],
      nextCursor: "Y3Vyc29y",
      hasMore: true,
    });
    expect(page.items[0]).not.toHaveProperty("secret");
  });

  it("direction/status inválidos caem no fallback; items ausente → []", () => {
    const page = sanitizeMessageSearchPage({
      items: [
        {
          messageId: "m1",
          conversationId: "c1",
          bodyPreview: "x",
          direction: "sideways",
          status: "exploded",
          createdAt: "lixo",
          matchedText: null,
        },
      ],
      nextCursor: 5,
      hasMore: "yes",
    } as unknown as RawMessageSearchPage);

    expect(page.items[0]!.direction).toBe("inbound");
    expect(page.items[0]!.status).toBe("sent");
    expect(page.items[0]!.createdAt).toBe(null);
    expect(page.nextCursor).toBe(null);
    expect(page.hasMore).toBe(true);

    expect(
      sanitizeMessageSearchPage({ nextCursor: null, hasMore: false } as unknown as RawMessageSearchPage)
        .items
    ).toEqual([]);
  });
});

describe("sanitizeAiUsagePage", () => {
  it("sanitiza summary/byModel/recent e descarta campos extras/sensíveis", () => {
    const raw = {
      summary: {
        totalInteractions: 5,
        completedInteractions: 4,
        blockedInteractions: 1,
        promptTokens: 1200,
        completionTokens: 800,
        totalTokens: 2000,
        estimatedCostUsd: 0.0008,
        avgDurationMs: 950,
      },
      byModel: [
        { model: "gpt-4o-mini", interactions: 4, totalTokens: 2000, estimatedCostUsd: 0.0008 },
        { model: null, interactions: 1, totalTokens: 0, estimatedCost: null },
      ],
      recent: {
        items: [
          {
            id: "log-1",
            createdAt: "2026-06-13T10:00:00.000Z",
            conversationId: "conv-1",
            stage: "auto_reply",
            model: "gpt-4o-mini",
            source: "openai",
            provider: "openai",
            riskLevel: "low",
            blocked: false,
            promptTokens: 300,
            cachedPromptTokens: 0,
            completionTokens: 200,
            totalTokens: 500,
            estimatedCostUsd: 0.000225,
            durationMs: 900,
            // campos que NÃO devem passar:
            prompt: "system prompt secreto",
            userMessage: "mensagem crua do cliente",
            apiKey: "sk-123",
          },
        ],
        nextCursor: "cursor-2",
        hasNextPage: true,
      },
      extra: "x",
    } as unknown as RawAiUsagePage;

    const page = sanitizeAiUsagePage(raw);

    expect(page.summary.totalTokens).toBe(2000);
    expect(page.summary.estimatedCost).toBe(0.0008);
    expect(page.summary.estimatedCostUsd).toBe(0.0008);
    expect(page.byModel).toHaveLength(2);
    expect(page.byModel[0]!.estimatedCostUsd).toBe(0.0008);
    expect(page.byModel[1]!.estimatedCost).toBe(null);

    expect(page.recent.nextCursor).toBe("cursor-2");
    expect(page.recent.hasNextPage).toBe(true);

    const item = page.recent.items[0]!;
    expect(Object.keys(item).sort()).toEqual(
      [
        "blocked",
        "cachedPromptTokens",
        "completionTokens",
        "conversationId",
        "createdAt",
        "durationMs",
        "estimatedCost",
        "estimatedCostUsd",
        "id",
        "model",
        "promptTokens",
        "provider",
        "riskLevel",
        "source",
        "stage",
        "totalTokens",
      ].sort()
    );
    expect(item.estimatedCostUsd).toBe(0.000225);
    // nada sensível vaza
    expect(item).not.toHaveProperty("prompt");
    expect(item).not.toHaveProperty("userMessage");
    expect(item).not.toHaveProperty("apiKey");
  });

  it("valores inválidos viram seguros (cost/avg null; risk/source fallback; arrays ausentes → [])", () => {
    const page = sanitizeAiUsagePage({
      summary: {
        totalInteractions: -3,
        completedInteractions: "x",
        blockedInteractions: 2,
        promptTokens: "abc",
        completionTokens: 10,
        totalTokens: 10,
        estimatedCost: "nope",
        avgDurationMs: null,
      },
      recent: [
          {
            createdAt: "lixo",
            conversationId: "c1",
            model: null,
            source: "skynet",
            riskLevel: "extreme",
            blocked: "yes",
            totalTokens: null,
            durationMs: null,
          },
        ],
    } as unknown as RawAiUsagePage);

    expect(page.summary.totalInteractions).toBe(0);
    expect(page.summary.promptTokens).toBe(0);
    expect(page.summary.estimatedCost).toBe(null);
    expect(page.summary.avgDurationMs).toBe(null);
    expect(page.byModel).toEqual([]);
    expect(page.recent.items[0]!.createdAt).toBe(null);
    expect(page.recent.items[0]!.source).toBe("stub");
    expect(page.recent.items[0]!.riskLevel).toBe("low");
    // sanitizeBoolean é estrita: só `true` vira true; "yes" → false (seguro).
    expect(page.recent.items[0]!.blocked).toBe(false);
    expect(page.recent.hasNextPage).toBe(false);
  });
});

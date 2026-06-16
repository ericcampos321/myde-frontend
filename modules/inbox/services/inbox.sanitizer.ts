/**
 * Sanitizacao das respostas do backend Inbox.
 *
 * Faz DUAS coisas, ambas centralizadas aqui:
 *
 * 1. Sanitizacao de SHAPE - converte DTOs crus (`Raw*`) nos tipos limpos do front
 *    (`inbox.types.ts`), escolhendo explicitamente os campos conhecidos. Qualquer
 *    campo extra do backend e descartado e nunca chega ao browser.
 *
 * 2. Sanitizacao de CONTEUDO - todo texto externo (backend/usuario/WhatsApp/IA) passa
 *    por `sanitizeText`, que remove markup HTML (`<...>`) e caracteres de controle.
 *    O texto e tratado como texto puro; nenhum HTML do backend e interpretado.
 *    (A exibicao usa renderizacao de texto do React, que ja escapa - aqui e a
 *    barreira na camada de dados, sem entity-encode para nao causar duplo-escape.)
 */
import type {
  RawAgent,
  RawAiSuggestion,
  RawContact,
  RawConversation,
  RawAiUsagePage,
  RawAiUsageRecentItem,
  RawMessage,
  RawMessagePage,
  RawMessageSearchPage,
  RawMessageSearchResult,
  RawRecentSearch,
  RawSentMessage,
} from "@/modules/inbox/services/inbox.raw.types";
import type {
  Agent,
  AiSuggestion,
  AiSuggestionRiskLevel,
  AiSuggestionRiskReason,
  AiUsagePage,
  AiUsageRecentItem,
  Contact,
  Conversation,
  Message,
  MessagePage,
  MessageSearchPage,
  MessageSearchResult,
  RecentSearch,
  SentMessage,
} from "@/modules/inbox/types/inbox.types";

// Qualquer markup do tipo <...> (tags HTML, <script>, <img onerror>, etc.).
const HTML_TAGS = /<[^>]*>/g;

const TAB = 0x09;
const LINE_FEED = 0x0a;
const CARRIAGE_RETURN = 0x0d;
const UNIT_SEPARATOR = 0x1f;
const DELETE = 0x7f;

/**
 * Remove caracteres de controle (C0 ate U+001F e DEL U+007F), preservando
 * tab/newline/carriage return - necessarios para mensagens multi-linha
 * (renderizadas com whitespace-pre-wrap).
 */
function stripControlChars(value: string): string {
  let out = "";
  for (const ch of value) {
    const code = ch.codePointAt(0) ?? 0;
    const isControl = (code <= UNIT_SEPARATOR && code !== TAB && code !== LINE_FEED && code !== CARRIAGE_RETURN) || code === DELETE;
    if (!isControl) out += ch;
  }
  return out;
}

/**
 * Neutraliza conteudo textual externo:
 * - garante string (senao usa `fallback`);
 * - remove tags/markup HTML (`<...>`);
 * - remove caracteres de controle preservando tab, newline e carriage return;
 * - NAO faz entity-encode (o React escapa na renderizacao; encode aqui causaria
 *   duplo-escape visivel).
 */
function sanitizeText(value: unknown, fallback = ""): string {
  if (typeof value !== "string") return fallback;
  return stripControlChars(value.replace(HTML_TAGS, "")).trim();
}

/** Igual a `sanitizeText`, mas preserva `null` (para campos opcionais). */
function sanitizeTextOrNull(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return sanitizeText(value);
}

// ---------------------------------------------------------------------------
// Sanitizacao estrutural (ids, datas, enums, numeros, booleans, cor, url)
// ---------------------------------------------------------------------------

/** Garante string para ids (coerca numero; demais tipos viram ""). */
function sanitizeId(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

/** Id opcional: string nao-vazia ou null. */
function sanitizeIdOrNull(value: unknown): string | null {
  return sanitizeId(value) || null;
}

/** Normaliza data para ISO 8601; entrada invalida vira null. */
function sanitizeIsoDate(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** Coercao segura para boolean (sempre retorna boolean, nunca lanca). */
function sanitizeBoolean(value: unknown): boolean {
  return value === true;
}

/** Contador nao-negativo; entrada invalida vira 0. */
function sanitizeCount(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

const HEX_COLOR = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

/** Cor usada em `style`: aceita hex (#rgb/#rgba/#rrggbb/#rrggbbaa); senao fallback. */
function sanitizeColor(value: unknown, fallback = "#6a7175"): string {
  if (typeof value === "string" && HEX_COLOR.test(value.trim())) {
    return value.trim();
  }
  return fallback;
}

/** Valida valor contra whitelist de enum; fora dela usa `fallback`. */
function sanitizeEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

/**
 * Sanitiza URL externa: aceita apenas http/https, senao null.
 * (Sem campo de URL nos DTOs atuais; disponivel para quando existirem.)
 */
export function sanitizeUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

const MESSAGE_DIRECTIONS = ["in", "out"] as const;
const MESSAGE_STATUSES = ["sent", "delivered", "read", "failed"] as const;
const CONVERSATION_PREVIEW_DIRECTIONS = ["inbound", "outbound"] as const;
const CONVERSATION_PREVIEW_STATUSES = ["pending", "sent", "delivered", "read", "failed"] as const;
const RECENT_TARGET_TYPES = ["conversation", "contact"] as const;
const AI_SOURCES = ["openai", "stub"] as const;
const AI_RISK_LEVELS = ["low", "medium", "high"] as const;
const AI_USAGE_STAGES = ["input", "output", "recurring", "auto_reply"] as const;
const AI_RISK_REASONS = [
  "prompt_injection",
  "secret_extraction",
  "business_scope_bypass",
  "policy_bypass",
  "tool_abuse",
  "cost_abuse",
  "recurring_abuse",
] as const;

export function sanitizeAgent(raw: RawAgent): Agent {
  return {
    id: sanitizeId(raw.id),
    name: sanitizeText(raw.name),
    role: sanitizeText(raw.role),
    capabilities: {
      sendMessage: sanitizeBoolean(raw.capabilities?.sendMessage),
      aiSuggestion: sanitizeBoolean(raw.capabilities?.aiSuggestion),
    },
  };
}

export function sanitizeConversation(raw: RawConversation): Conversation {
  return {
    id: sanitizeId(raw.id),
    contactName: sanitizeText(raw.contactName),
    contactPhone: sanitizeText(raw.contactPhone),
    avatarColor: sanitizeColor(raw.avatarColor),
    unread: sanitizeCount(raw.unread),
    lastMessage: sanitizeText(raw.lastMessage),
    lastMessageDirection:
      raw.lastMessageDirection == null
        ? null
        : sanitizeEnum(raw.lastMessageDirection, CONVERSATION_PREVIEW_DIRECTIONS, "inbound"),
    lastMessageStatus:
      raw.lastMessageStatus == null
        ? null
        : sanitizeEnum(raw.lastMessageStatus, CONVERSATION_PREVIEW_STATUSES, "sent"),
    lastMessageAt: sanitizeIsoDate(raw.lastMessageAt),
    lastInboundMessageId: sanitizeIdOrNull(raw.lastInboundMessageId),
    lastInboundMessageAt: sanitizeIsoDate(raw.lastInboundMessageAt),
  };
}

export function sanitizeConversations(raw: RawConversation[]): Conversation[] {
  return raw.map(sanitizeConversation);
}

export function sanitizeContact(raw: RawContact): Contact {
  return {
    id: sanitizeId(raw.id),
    name: sanitizeText(raw.name),
    phone: sanitizeText(raw.phone),
    profileName: sanitizeTextOrNull(raw.profileName),
    createdAt: sanitizeIsoDate(raw.createdAt),
    updatedAt: sanitizeIsoDate(raw.updatedAt),
  };
}

export function sanitizeContacts(raw: RawContact[]): Contact[] {
  return raw.map(sanitizeContact);
}

export function sanitizeRecentSearch(raw: RawRecentSearch): RecentSearch {
  return {
    id: sanitizeId(raw.id),
    targetType: sanitizeEnum(raw.targetType, RECENT_TARGET_TYPES, "contact"),
    targetId: sanitizeId(raw.targetId),
    conversationId: sanitizeIdOrNull(raw.conversationId),
    label: sanitizeText(raw.label),
    subtitle: sanitizeText(raw.subtitle),
    avatarInitials: sanitizeText(raw.avatarInitials),
    updatedAt: sanitizeIsoDate(raw.updatedAt),
    canOpen: sanitizeBoolean(raw.canOpen),
  };
}

export function sanitizeRecentSearches(raw: RawRecentSearch[]): RecentSearch[] {
  return raw.map(sanitizeRecentSearch);
}

export function sanitizeMessage(raw: RawMessage): Message {
  return {
    id: sanitizeId(raw.id),
    direction: sanitizeEnum(raw.direction, MESSAGE_DIRECTIONS, "in"),
    body: sanitizeText(raw.body),
    status: sanitizeEnum(raw.status, MESSAGE_STATUSES, "sent"),
    createdAt: sanitizeIsoDate(raw.createdAt),
  };
}

export function sanitizeMessages(raw: RawMessage[]): Message[] {
  return raw.map(sanitizeMessage);
}

export function sanitizeMessagePage(raw: RawMessagePage): MessagePage {
  return {
    items: sanitizeMessages(Array.isArray(raw.items) ? raw.items : []),
    nextCursor: typeof raw.nextCursor === "string" ? raw.nextCursor : null,
    hasMore: Boolean(raw.hasMore),
  };
}

const SEARCH_DIRECTIONS = ["inbound", "outbound"] as const;
const SEARCH_STATUSES = [
  "pending",
  "sent",
  "delivered",
  "read",
  "failed",
] as const;

export function sanitizeMessageSearchResult(
  raw: RawMessageSearchResult
): MessageSearchResult {
  return {
    messageId: sanitizeId(raw.messageId),
    conversationId: sanitizeId(raw.conversationId),
    bodyPreview: sanitizeText(raw.bodyPreview),
    direction: sanitizeEnum(raw.direction, SEARCH_DIRECTIONS, "inbound"),
    status: sanitizeEnum(raw.status, SEARCH_STATUSES, "sent"),
    createdAt: sanitizeIsoDate(raw.createdAt),
    matchedText: sanitizeTextOrNull(raw.matchedText),
  };
}

export function sanitizeMessageSearchPage(
  raw: RawMessageSearchPage
): MessageSearchPage {
  return {
    items: (Array.isArray(raw.items) ? raw.items : []).map(
      sanitizeMessageSearchResult
    ),
    nextCursor: typeof raw.nextCursor === "string" ? raw.nextCursor : null,
    hasMore: Boolean(raw.hasMore),
  };
}

export function sanitizeSentMessage(raw: RawSentMessage): SentMessage {
  return {
    id: sanitizeId(raw.id),
    conversationId: sanitizeId(raw.conversationId),
    direction: sanitizeEnum(raw.direction, ["outbound"] as const, "outbound"),
    body: sanitizeText(raw.body),
    status: sanitizeText(raw.status),
    externalMessageId: sanitizeIdOrNull(raw.externalMessageId),
    createdAt: sanitizeIsoDate(raw.createdAt),
  };
}

export function sanitizeAiSuggestion(raw: RawAiSuggestion): AiSuggestion {
  const source =
    typeof raw.source === "string" &&
    (AI_SOURCES as readonly string[]).includes(raw.source)
      ? raw.source
      : null;

  return {
    suggestion: sanitizeTextOrNull(raw.suggestion),
    source,
    blocked: sanitizeBoolean(raw.blocked),
    riskLevel: sanitizeEnum<AiSuggestionRiskLevel>(
      raw.riskLevel,
      AI_RISK_LEVELS,
      "low"
    ),
    riskReasons: sanitizeRiskReasons(raw.riskReasons),
    userMessage: sanitizeTextOrNull(raw.userMessage),
  };
}

function sanitizeRiskReasons(value: unknown): AiSuggestionRiskReason[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalized = value
    .map((item) => sanitizeText(item))
    .filter((item): item is AiSuggestionRiskReason =>
      (AI_RISK_REASONS as readonly string[]).includes(item)
    );

  return [...new Set(normalized)];
}

/** Número finito ou null (coage; null/undefined/inválido viram null). */
function sanitizeNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function sanitizeAiUsageRecentItem(
  raw: RawAiUsageRecentItem
): AiUsageRecentItem {
  const estimatedCost = sanitizeNumberOrNull(
    raw.estimatedCostUsd ?? raw.estimatedCost
  );
  return {
    id: sanitizeId(raw.id),
    createdAt: sanitizeIsoDate(raw.createdAt),
    conversationId: sanitizeId(raw.conversationId),
    stage: sanitizeEnum<
      "input" | "output" | "recurring" | "auto_reply"
    >(raw.stage, AI_USAGE_STAGES, "input"),
    model: sanitizeTextOrNull(raw.model),
    source:
      raw.source == null
        ? null
        : sanitizeEnum<"openai" | "stub">(raw.source, AI_SOURCES, "stub"),
    provider: sanitizeTextOrNull(raw.provider),
    riskLevel: sanitizeEnum<AiSuggestionRiskLevel>(
      raw.riskLevel,
      AI_RISK_LEVELS,
      "low"
    ),
    blocked: sanitizeBoolean(raw.blocked),
    promptTokens: sanitizeNumberOrNull(raw.promptTokens),
    cachedPromptTokens: sanitizeNumberOrNull(raw.cachedPromptTokens),
    completionTokens: sanitizeNumberOrNull(raw.completionTokens),
    totalTokens: sanitizeNumberOrNull(raw.totalTokens),
    estimatedCost,
    estimatedCostUsd: estimatedCost,
    durationMs: sanitizeNumberOrNull(raw.durationMs),
  };
}

/**
 * Sanitiza o painel de uso da IA. Só métricas/metadados seguros — nunca há
 * prompt/mensagem/token de API no contrato; campos extras do backend são descartados.
 */
export function sanitizeAiUsagePage(raw: RawAiUsagePage): AiUsagePage {
  const summary = raw.summary ?? ({} as RawAiUsagePage["summary"]);
  const recentRaw = Array.isArray(raw.recent)
    ? {
        items: raw.recent,
        nextCursor: null,
        hasNextPage: false,
      }
    : raw.recent ?? { items: [], nextCursor: null, hasNextPage: false };
  const summaryEstimatedCost = sanitizeNumberOrNull(
    summary.estimatedCostUsd ?? summary.estimatedCost
  );
  return {
    summary: {
      totalInteractions: sanitizeCount(summary.totalInteractions),
      completedInteractions: sanitizeCount(summary.completedInteractions),
      blockedInteractions: sanitizeCount(summary.blockedInteractions),
      promptTokens: sanitizeCount(summary.promptTokens),
      completionTokens: sanitizeCount(summary.completionTokens),
      totalTokens: sanitizeCount(summary.totalTokens),
      estimatedCost: summaryEstimatedCost,
      estimatedCostUsd: summaryEstimatedCost,
      avgDurationMs: sanitizeNumberOrNull(summary.avgDurationMs),
    },
    byModel: (Array.isArray(raw.byModel) ? raw.byModel : []).map((m) => {
      const estimatedCost = sanitizeNumberOrNull(
        m.estimatedCostUsd ?? m.estimatedCost
      );
      return {
        model: sanitizeTextOrNull(m.model),
        interactions: sanitizeCount(m.interactions),
        totalTokens: sanitizeCount(m.totalTokens),
        estimatedCost,
        estimatedCostUsd: estimatedCost,
      };
    }),
    recent: {
      items: (Array.isArray(recentRaw.items) ? recentRaw.items : []).map(
        sanitizeAiUsageRecentItem
      ),
      nextCursor: sanitizeTextOrNull(recentRaw.nextCursor),
      hasNextPage: sanitizeBoolean(recentRaw.hasNextPage),
    },
  };
}

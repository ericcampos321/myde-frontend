export interface Conversation {
  id: string;
  contactName: string;
  contactPhone: string;
  avatarColor: string;
  unread: number;
  lastMessage: string;
  lastMessageDirection: "inbound" | "outbound" | null;
  lastMessageStatus: "pending" | "sent" | "delivered" | "read" | "failed" | null;
  lastMessageAt: string | null;
  lastInboundMessageId: string | null;
  lastInboundMessageAt: string | null;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  profileName: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface RecentSearch {
  id: string;
  targetType: "conversation" | "contact";
  targetId: string;
  conversationId: string | null;
  label: string;
  subtitle: string;
  avatarInitials: string;
  updatedAt: string | null;
  canOpen: boolean;
}

export interface SaveRecentSearchPayload {
  targetType: RecentSearch["targetType"];
  targetId: string;
}

export type MessageStatus = "sent" | "delivered" | "read" | "failed";

export interface Message {
  id: string;
  direction: "in" | "out";
  body: string;
  status: MessageStatus;
  createdAt: string | null;
}

/** Página de mensagens (cursor). `items` em ordem cronológica ASC. */
export interface MessagePage {
  items: Message[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface MessageSearchResult {
  messageId: string;
  conversationId: string;
  bodyPreview: string;
  direction: "inbound" | "outbound";
  status: "pending" | MessageStatus;
  createdAt: string | null;
  matchedText: string | null;
}

/** Página de resultados da busca. `items` em DESC (match mais recente primeiro). */
export interface MessageSearchPage {
  items: MessageSearchResult[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface SentMessage {
  id: string;
  conversationId: string;
  direction: "outbound";
  body: string;
  status: string;
  externalMessageId: string | null;
  createdAt: string | null;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  capabilities: {
    sendMessage: boolean;
    aiSuggestion: boolean;
  };
}

export type AiSuggestionSource = "openai" | "stub";

export type AiSuggestionRiskLevel = "low" | "medium" | "high";

export type AiSuggestionRiskReason =
  | "prompt_injection"
  | "secret_extraction"
  | "business_scope_bypass"
  | "policy_bypass"
  | "tool_abuse"
  | "cost_abuse"
  | "recurring_abuse";

export interface AiSuggestion {
  suggestion: string | null;
  source: AiSuggestionSource | null;
  blocked: boolean;
  riskLevel: AiSuggestionRiskLevel;
  riskReasons: AiSuggestionRiskReason[];
  userMessage: string | null;
}

export interface AiSuggestPayload {
  conversationId: string;
}

// ---------------------------------------------------------------------------
// Painel de Uso da IA (read-only) — métricas seguras (sem prompt/mensagem/token)
// ---------------------------------------------------------------------------

export interface AiUsageSummary {
  totalInteractions: number;
  completedInteractions: number;
  blockedInteractions: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number | null;
  estimatedCostUsd: number | null;
  avgDurationMs: number | null;
}

export interface AiUsageByModel {
  model: string | null;
  interactions: number;
  totalTokens: number;
  estimatedCost: number | null;
  estimatedCostUsd: number | null;
}

export interface AiUsageRecentItem {
  id: string;
  createdAt: string | null;
  conversationId: string;
  stage: "input" | "output" | "recurring" | "auto_reply";
  model: string | null;
  source: AiSuggestionSource | null;
  provider: string | null;
  riskLevel: AiSuggestionRiskLevel;
  blocked: boolean;
  promptTokens: number | null;
  cachedPromptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
  estimatedCost: number | null;
  estimatedCostUsd: number | null;
  durationMs: number | null;
}

export interface AiUsageRecentPage {
  items: AiUsageRecentItem[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface AiUsagePage {
  summary: AiUsageSummary;
  byModel: AiUsageByModel[];
  recent: AiUsageRecentPage;
}

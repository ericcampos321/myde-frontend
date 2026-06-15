/**
 * Contratos CRUS (raw) retornados pelo backend Myde real.
 *
 * Vivem apenas na camada server (service + sanitizer) e NUNCA cruzam para o browser:
 * o sanitizer (`inbox.sanitizer.ts`) converte cada `Raw*` no tipo limpo de
 * `inbox.types.ts`, descartando qualquer campo extra. A index signature documenta
 * que o backend pode enviar mais campos do que o front consome.
 */

type WithExtra = Record<string, unknown>;

export interface RawAgent extends WithExtra {
  id: string;
  name: string;
  role: string;
  capabilities: {
    sendMessage: boolean;
    aiSuggestion: boolean;
  };
}

export interface RawConversation extends WithExtra {
  id: string;
  contactName: string;
  contactPhone: string;
  avatarColor: string;
  unread: number;
  lastMessage: string;
  lastMessageDirection?: "inbound" | "outbound" | null;
  lastMessageStatus?: "pending" | "sent" | "delivered" | "read" | "failed" | null;
  lastMessageAt: string;
}

export interface RawContact extends WithExtra {
  id: string;
  name: string;
  phone: string;
  profileName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RawRecentSearch extends WithExtra {
  id: string;
  targetType: "conversation" | "contact";
  targetId: string;
  conversationId: string | null;
  label: string;
  subtitle: string;
  avatarInitials: string;
  updatedAt: string;
  canOpen: boolean;
}

export interface RawMessage extends WithExtra {
  id: string;
  direction: "in" | "out";
  body: string;
  status: "sent" | "delivered" | "read" | "failed";
  createdAt: string;
}

export interface RawMessagePage extends WithExtra {
  items: RawMessage[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface RawSentMessage extends WithExtra {
  id: string;
  conversationId: string;
  direction: "outbound";
  body: string;
  status: string;
  externalMessageId: string | null;
  createdAt: string;
}

export interface RawAiSuggestion extends WithExtra {
  suggestion: string | null;
  source: "openai" | "stub" | null;
  blocked: boolean;
  riskLevel: string;
  riskReasons: string[];
  userMessage: string | null;
}

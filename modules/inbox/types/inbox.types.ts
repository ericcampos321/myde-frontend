export interface Conversation {
  id: string;
  contactName: string;
  contactPhone: string;
  avatarColor: string;
  unread: number;
  lastMessage: string;
  lastMessageAt: string | null;
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

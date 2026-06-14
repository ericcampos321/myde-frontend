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

export interface AiSuggestion {
  suggestion: string;
  source: "openai" | "stub";
}

export interface AiSuggestPayload {
  conversationId: string;
}

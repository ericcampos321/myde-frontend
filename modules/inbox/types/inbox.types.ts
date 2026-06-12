export interface Conversation {
  id: string;
  contactName: string;
  contactPhone: string;
  avatarColor: string;
  unread: number;
  lastMessage: string;
  lastMessageAt: string;
}

export interface Message {
  id: string;
  direction: "in" | "out";
  body: string;
  status: "sent" | "delivered" | "read";
  createdAt: string;
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

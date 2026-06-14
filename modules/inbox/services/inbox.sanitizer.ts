/**
 * Sanitização das respostas do backend Inbox.
 *
 * Único lugar onde DTOs crus (`Raw*`) viram os tipos limpos consumidos pelo front
 * (`inbox.types.ts`). Cada função escolhe EXPLICITAMENTE os campos conhecidos —
 * qualquer campo extra do backend é descartado e nunca chega ao browser.
 */
import type {
  RawAgent,
  RawAiSuggestion,
  RawContact,
  RawConversation,
  RawMessage,
  RawRecentSearch,
  RawSentMessage,
} from "@/modules/inbox/services/inbox.raw.types";
import type {
  Agent,
  AiSuggestion,
  Contact,
  Conversation,
  Message,
  RecentSearch,
  SentMessage,
} from "@/modules/inbox/types/inbox.types";

export function sanitizeAgent(raw: RawAgent): Agent {
  return {
    id: raw.id,
    name: raw.name,
    role: raw.role,
    capabilities: {
      sendMessage: Boolean(raw.capabilities?.sendMessage),
      aiSuggestion: Boolean(raw.capabilities?.aiSuggestion),
    },
  };
}

export function sanitizeConversation(raw: RawConversation): Conversation {
  return {
    id: raw.id,
    contactName: raw.contactName,
    contactPhone: raw.contactPhone,
    avatarColor: raw.avatarColor,
    unread: raw.unread,
    lastMessage: raw.lastMessage,
    lastMessageAt: raw.lastMessageAt,
  };
}

export function sanitizeConversations(raw: RawConversation[]): Conversation[] {
  return raw.map(sanitizeConversation);
}

export function sanitizeContact(raw: RawContact): Contact {
  return {
    id: raw.id,
    name: raw.name,
    phone: raw.phone,
    profileName: raw.profileName,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function sanitizeContacts(raw: RawContact[]): Contact[] {
  return raw.map(sanitizeContact);
}

export function sanitizeRecentSearch(raw: RawRecentSearch): RecentSearch {
  return {
    id: raw.id,
    targetType: raw.targetType,
    targetId: raw.targetId,
    conversationId: raw.conversationId,
    label: raw.label,
    subtitle: raw.subtitle,
    avatarInitials: raw.avatarInitials,
    updatedAt: raw.updatedAt,
    canOpen: raw.canOpen,
  };
}

export function sanitizeRecentSearches(raw: RawRecentSearch[]): RecentSearch[] {
  return raw.map(sanitizeRecentSearch);
}

export function sanitizeMessage(raw: RawMessage): Message {
  return {
    id: raw.id,
    direction: raw.direction,
    body: raw.body,
    status: raw.status,
    createdAt: raw.createdAt,
  };
}

export function sanitizeMessages(raw: RawMessage[]): Message[] {
  return raw.map(sanitizeMessage);
}

export function sanitizeSentMessage(raw: RawSentMessage): SentMessage {
  return {
    id: raw.id,
    conversationId: raw.conversationId,
    direction: raw.direction,
    body: raw.body,
    status: raw.status,
    externalMessageId: raw.externalMessageId,
    createdAt: raw.createdAt,
  };
}

export function sanitizeAiSuggestion(raw: RawAiSuggestion): AiSuggestion {
  return {
    suggestion: raw.suggestion,
    source: raw.source,
  };
}
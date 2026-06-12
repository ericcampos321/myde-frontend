import { apiClient } from "@/services/http/api-client";
import { inboxEndpoints } from "@/modules/inbox/services/inbox.endpoints";
import type {
  Agent,
  AiSuggestion,
  Conversation,
  Message,
} from "@/modules/inbox/types/inbox.types";

export async function getMe(): Promise<Agent> {
  const { data } = await apiClient.get<Agent>(inboxEndpoints.me);
  return data;
}

export async function getConversations(): Promise<Conversation[]> {
  const { data } = await apiClient.get<Conversation[]>(
    inboxEndpoints.conversations
  );
  return data;
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data } = await apiClient.get<Message[]>(
    inboxEndpoints.conversationMessages(conversationId)
  );
  return data;
}

export async function suggestReply(
  conversationId: string
): Promise<AiSuggestion> {
  const { data } = await apiClient.post<AiSuggestion>(inboxEndpoints.aiSuggest, {
    conversationId,
  });
  return data;
}

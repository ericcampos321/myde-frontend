import { apiClient } from "@/services/http/api-client";
import type {
  Agent,
  AiSuggestion,
  Conversation,
  Message,
  SendMessagePayload,
} from "@/modules/inbox/types/inbox.types";

export async function getMe(): Promise<Agent> {
  const { data } = await apiClient.get<Agent>("/me");
  return data;
}

export async function getConversations(): Promise<Conversation[]> {
  const { data } = await apiClient.get<Conversation[]>("/conversations");
  return data;
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data } = await apiClient.get<Message[]>(
    `/conversations/${conversationId}/messages`
  );
  return data;
}

export async function sendMessage(
  conversationId: string,
  payload: SendMessagePayload
): Promise<Message> {
  const { data } = await apiClient.post<Message>(
    `/conversations/${conversationId}/messages`,
    payload
  );
  return data;
}

export async function suggestReply(
  conversationId: string
): Promise<AiSuggestion> {
  const { data } = await apiClient.post<AiSuggestion>("/ai/suggest", {
    conversationId,
  });
  return data;
}

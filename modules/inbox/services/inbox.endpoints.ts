/**
 * Endpoints da API do domínio Inbox.
 * Centralizados aqui para evitar strings de rota espalhadas pelo service.
 */
export const inboxEndpoints = {
  me: "/me",
  conversations: "/conversations",
  conversationMessages: (conversationId: string) =>
    `/conversations/${conversationId}/messages`,
  aiSuggest: "/ai/suggest",
} as const;

/**
 * Endpoints da API do domínio Inbox.
 * Centralizados aqui para evitar strings de rota espalhadas pelo service.
 */
export const inboxEndpoints = {
  me: "/me",
  conversations: "/conversations",
  contacts: "/contacts",
  recentSearches: "/recent-searches",
  conversationRead: (conversationId: string) => `/conversations/${conversationId}/read`,
  conversationMessages: (conversationId: string) =>
    `/conversations/${conversationId}/messages`,
  aiSuggest: "/ai/suggest",
  aiUsage: "/ai/usage",
} as const;

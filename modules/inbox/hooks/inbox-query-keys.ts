/**
 * Query keys do domínio Inbox.
 * Fonte única para evitar arrays de chave duplicados entre queries e mutations.
 */
export const inboxQueryKeys = {
  me: ["me"] as const,
  conversations: ["conversations"] as const,
  contacts: (searchTerm: string) => ["contacts", searchTerm] as const,
  conversationMessages: (conversationId: string | null) =>
    ["conversation-messages", conversationId] as const,
};

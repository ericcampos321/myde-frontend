import "server-only";

import { backendClient } from "@/services/http/server/backend-client";
import { inboxEndpoints } from "@/modules/inbox/services/inbox.endpoints";
import type {
  RawAgent,
  RawAiSuggestion,
  RawContact,
  RawConversation,
  RawMessage,
  RawRecentSearch,
  RawSentMessage,
} from "@/modules/inbox/services/inbox.raw.types";
import type { SaveRecentSearchPayload } from "@/modules/inbox/types/inbox.types";

/**
 * Service SERVER-SIDE do domínio Inbox.
 *
 * Fala com o backend Myde real via `backendClient`. Retorna os DTOs CRUS (`Raw*`);
 * a sanitização para os tipos do front acontece no route handler (inbox.sanitizer.ts).
 *
 * `RequestContext.headers` carrega o que o route handler quer repassar ao backend
 * (ex.: `X-Tenant-ID`, `Cookie`).
 */
export interface RequestContext {
  headers?: Record<string, string>;
}

export function getMe(ctx: RequestContext = {}): Promise<RawAgent> {
  return backendClient.get<RawAgent>(inboxEndpoints.me, { headers: ctx.headers });
}

export function getConversations(ctx: RequestContext = {}): Promise<RawConversation[]> {
  return backendClient.get<RawConversation[]>(inboxEndpoints.conversations, {
    headers: ctx.headers,
  });
}

export function getContacts(
  searchTerm: string | undefined,
  ctx: RequestContext = {}
): Promise<RawContact[]> {
  const term = searchTerm?.trim();
  const path = term
    ? `${inboxEndpoints.contacts}?${new URLSearchParams({ q: term }).toString()}`
    : inboxEndpoints.contacts;
  return backendClient.get<RawContact[]>(path, { headers: ctx.headers });
}

export function getRecentSearches(ctx: RequestContext = {}): Promise<RawRecentSearch[]> {
  return backendClient.get<RawRecentSearch[]>(inboxEndpoints.recentSearches, {
    headers: ctx.headers,
  });
}

export function saveRecentSearch(
  payload: SaveRecentSearchPayload,
  ctx: RequestContext = {}
): Promise<void> {
  return backendClient.post<void>(inboxEndpoints.recentSearches, payload, {
    headers: ctx.headers,
  });
}

export function clearRecentSearches(ctx: RequestContext = {}): Promise<void> {
  return backendClient.delete<void>(inboxEndpoints.recentSearches, undefined, {
    headers: ctx.headers,
  });
}

export function getMessages(
  conversationId: string,
  ctx: RequestContext = {}
): Promise<RawMessage[]> {
  return backendClient.get<RawMessage[]>(
    inboxEndpoints.conversationMessages(conversationId),
    { headers: ctx.headers }
  );
}

export function markConversationAsRead(
  conversationId: string,
  ctx: RequestContext = {}
): Promise<void> {
  return backendClient.post<void>(
    inboxEndpoints.conversationRead(conversationId),
    undefined,
    { headers: ctx.headers }
  );
}

export function suggestReply(
  conversationId: string,
  ctx: RequestContext = {}
): Promise<RawAiSuggestion> {
  return backendClient.post<RawAiSuggestion>(
    inboxEndpoints.aiSuggest,
    { conversationId },
    { headers: ctx.headers }
  );
}

export function sendMessage(
  conversationId: string,
  text: string,
  ctx: RequestContext = {}
): Promise<RawSentMessage> {
  return backendClient.post<RawSentMessage>(
    inboxEndpoints.conversationMessages(conversationId),
    { text },
    { headers: ctx.headers }
  );
}
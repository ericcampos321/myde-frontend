import "server-only";

import { backendClient } from "@/services/http/server/backend-client";
import { inboxEndpoints } from "@/modules/inbox/services/inbox.endpoints";
import type {
  RawAgent,
  RawAiSuggestion,
  RawAiUsagePage,
  RawContact,
  RawConversation,
  RawMessagePage,
  RawMessageSearchPage,
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

export function getMessagesPage(
  conversationId: string,
  params: { limit?: string; before?: string } = {},
  ctx: RequestContext = {}
): Promise<RawMessagePage> {
  const query = new URLSearchParams();
  if (params.limit) query.set("limit", params.limit);
  if (params.before) query.set("before", params.before);
  const qs = query.toString();
  const path = qs
    ? `${inboxEndpoints.conversationMessages(conversationId)}?${qs}`
    : inboxEndpoints.conversationMessages(conversationId);

  return backendClient.get<RawMessagePage>(path, { headers: ctx.headers });
}

export function getMessageSearchPage(
  conversationId: string,
  params: { q?: string; date?: string; limit?: string; cursor?: string },
  ctx: RequestContext = {}
): Promise<RawMessageSearchPage> {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.date) query.set("date", params.date);
  if (params.limit) query.set("limit", params.limit);
  if (params.cursor) query.set("cursor", params.cursor);

  const path = `${inboxEndpoints.conversationMessages(conversationId)}/search?${query.toString()}`;
  return backendClient.get<RawMessageSearchPage>(path, { headers: ctx.headers });
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

export function getAiUsage(
  params: {
    from?: string;
    to?: string;
    conversationId?: string;
    limit?: string;
    cursor?: string;
    model?: string;
    source?: string;
    provider?: string;
    riskLevel?: string;
    blocked?: string;
    stage?: string;
  } = {},
  ctx: RequestContext = {}
): Promise<RawAiUsagePage> {
  const query = new URLSearchParams();
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.conversationId) query.set("conversationId", params.conversationId);
  if (params.limit) query.set("limit", params.limit);
  if (params.cursor) query.set("cursor", params.cursor);
  if (params.model) query.set("model", params.model);
  if (params.source) query.set("source", params.source);
  if (params.provider) query.set("provider", params.provider);
  if (params.riskLevel) query.set("riskLevel", params.riskLevel);
  if (params.blocked) query.set("blocked", params.blocked);
  if (params.stage) query.set("stage", params.stage);
  const qs = query.toString();
  const path = qs ? `${inboxEndpoints.aiUsage}?${qs}` : inboxEndpoints.aiUsage;

  return backendClient.get<RawAiUsagePage>(path, { headers: ctx.headers });
}

import type { Conversation } from "@/modules/inbox/types/inbox.types";

export function buildConversationLastMessageKey(
  conversation: Conversation
): string | null {
  if (conversation.lastInboundMessageId) {
    return `${conversation.id}:${conversation.lastInboundMessageId}`;
  }

  return null;
}

export function detectNewInboundConversations(
  previousKeys: ReadonlyMap<string, string>,
  conversations: Conversation[],
  initialized: boolean
): {
  nextKeys: Map<string, string>;
  newInboundConversations: Conversation[];
} {
  const nextKeys = new Map<string, string>();
  const newInboundConversations: Conversation[] = [];

  for (const conversation of conversations) {
    const key = buildConversationLastMessageKey(conversation);
    if (!key) continue;

    const previousKey = previousKeys.get(conversation.id);
    if (
      initialized &&
      previousKey !== key &&
      key !== null
    ) {
      newInboundConversations.push(conversation);
    }

    nextKeys.set(conversation.id, key);
  }

  return { nextKeys, newInboundConversations };
}

import { describe, expect, it } from "vitest";
import type { Conversation } from "@/modules/inbox/types/inbox.types";
import {
  buildConversationLastMessageKey,
  detectNewInboundConversations,
} from "./conversation-notification";

function conversation(
  id: string,
  direction: Conversation["lastMessageDirection"],
  suffix = "1"
): Conversation {
  return {
    id,
    contactName: id,
    contactPhone: id,
    avatarColor: "#000000",
    unread: direction === "inbound" ? 1 : 0,
    lastMessage: `message-${suffix}`,
    lastMessageDirection: direction,
    lastMessageStatus: direction === "outbound" ? "sent" : null,
    lastMessageAt: `2026-06-15T12:00:0${suffix}.000Z`,
    lastInboundMessageId: direction === "inbound" ? `inbound-${suffix}` : null,
    lastInboundMessageAt:
      direction === "inbound" ? `2026-06-15T12:00:0${suffix}.000Z` : null,
  };
}

describe("conversation notification detection", () => {
  it("primeira carga cria baseline sem notificar", () => {
    const result = detectNewInboundConversations(
      new Map(),
      [conversation("a", "inbound")],
      false
    );
    expect(result.newInboundConversations).toEqual([]);
    expect(result.nextKeys.size).toBe(1);
  });

  it("nova inbound em conversa existente notifica", () => {
    const old = conversation("a", "inbound", "1");
    const current = conversation("a", "inbound", "2");
    const result = detectNewInboundConversations(
      new Map([["a", buildConversationLastMessageKey(old)!]]),
      [current],
      true
    );
    expect(result.newInboundConversations).toEqual([current]);
  });

  it("notifica inbound nova mesmo quando uma outbound posterior virou o preview", () => {
    const old = conversation("a", "inbound", "1");
    const current = {
      ...conversation("a", "outbound", "3"),
      lastInboundMessageId: "inbound-2",
      lastInboundMessageAt: "2026-06-15T12:00:02.000Z",
    };

    const result = detectNewInboundConversations(
      new Map([["a", buildConversationLastMessageKey(old)!]]),
      [current],
      true
    );

    expect(result.newInboundConversations).toEqual([current]);
  });

  it("nova outbound e refetch igual não notificam", () => {
    const old = conversation("a", "inbound", "1");
    const sameKey = buildConversationLastMessageKey(old)!;
    expect(
      detectNewInboundConversations(new Map([["a", sameKey]]), [old], true)
        .newInboundConversations
    ).toEqual([]);
    expect(
      detectNewInboundConversations(
        new Map([["a", sameKey]]),
        [conversation("a", "outbound", "2")],
        true
      ).newInboundConversations
    ).toEqual([]);
  });

  it("conversa nova inbound após inicialização notifica", () => {
    expect(
      detectNewInboundConversations(
        new Map(),
        [conversation("new", "inbound")],
        true
      ).newInboundConversations
    ).toHaveLength(1);
  });

  it("múltiplas inbound são detectadas no mesmo refetch", () => {
    expect(
      detectNewInboundConversations(
        new Map(),
        [conversation("a", "inbound"), conversation("b", "inbound")],
        true
      ).newInboundConversations
    ).toHaveLength(2);
  });

  it("conversa sem última mensagem não quebra nem entra no baseline", () => {
    const empty = {
      ...conversation("empty", null),
      lastMessage: "",
      lastMessageAt: null,
    };
    expect(buildConversationLastMessageKey(empty)).toBeNull();
    expect(
      detectNewInboundConversations(new Map(), [empty], true)
        .newInboundConversations
    ).toEqual([]);
  });
});

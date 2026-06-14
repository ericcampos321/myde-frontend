"use client";

import { AppShell } from "@/components/shared/app-shell";
import { ConversationList } from "./conversation-list";
import { ChatPanel } from "./chat-panel";
import { NoConversationSelected } from "./no-conversation-selected";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useConversationsQuery } from "@/modules/inbox/hooks/use-conversations-query";
import { useMarkConversationReadMutation } from "@/modules/inbox/hooks/use-mark-conversation-read-mutation";
import type { Conversation } from "@/modules/inbox/types/inbox.types";

export function InboxLayout() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useConversationsQuery();
  const markConversationRead = useMarkConversationReadMutation();
  const readMarkersRef = useRef<Map<string, string>>(new Map());
  const readInFlightRef = useRef<Set<string>>(new Set());
  const conversations = data ?? [];
  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedId) ?? null,
    [conversations, selectedId]
  );
  const selectedUnreadMarker = useMemo(
    () => buildUnreadMarker(selectedConversation),
    [
      selectedConversation?.id,
      selectedConversation?.unread,
      selectedConversation?.lastMessageAt,
    ]
  );

  const markConversationAsReadIfNeeded = useCallback(
    (conversation: Conversation | null, marker: string | null) => {
      if (!conversation || !marker) {
        return;
      }

      if (conversation.unread <= 0) {
        return;
      }

      if (readInFlightRef.current.has(conversation.id)) {
        return;
      }

      if (readMarkersRef.current.get(conversation.id) === marker) {
        return;
      }

      readInFlightRef.current.add(conversation.id);

      markConversationRead.mutate(
        {
          conversationId: conversation.id,
          marker,
        },
        {
          onSuccess: () => {
            readMarkersRef.current.set(conversation.id, marker);
            readInFlightRef.current.delete(conversation.id);
          },
          onError: () => {
            readInFlightRef.current.delete(conversation.id);
          },
        }
      );
    },
    [markConversationRead]
  );

  const handleSelectConversation = useCallback(
    (conversation: Conversation) => {
      setSelectedId(conversation.id);
      markConversationAsReadIfNeeded(conversation, buildUnreadMarker(conversation));
    },
    [markConversationAsReadIfNeeded]
  );

  useEffect(() => {
    if (!selectedConversation || !selectedUnreadMarker) {
      return;
    }

    markConversationAsReadIfNeeded(selectedConversation, selectedUnreadMarker);
  }, [
    markConversationAsReadIfNeeded,
    selectedConversation?.id,
    selectedConversation?.unread,
    selectedConversation?.lastMessageAt,
    selectedUnreadMarker,
  ]);

  return (
    <AppShell
      sidebar={
        <ConversationList
          conversations={conversations}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          onRetry={() => refetch()}
          selectedId={selectedId}
          onSelect={handleSelectConversation}
        />
      }
      main={
        selectedId ? (
          <ChatPanel
            conversationId={selectedId}
            conversation={selectedConversation}
            onBack={() => setSelectedId(null)}
          />
        ) : (
          <NoConversationSelected />
        )
      }
      showMain={!!selectedId}
    />
  );
}

function buildUnreadMarker(conversation: Conversation | null): string | null {
  if (!conversation || conversation.unread <= 0) {
    return null;
  }

  return [
    conversation.id,
    conversation.unread,
    conversation.lastMessageAt ?? "",
  ].join(":");
}

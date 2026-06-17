"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useConversationMessagesQuery } from "@/modules/inbox/hooks/use-conversation-messages-query";
import { flattenMessagePages } from "@/modules/inbox/utils/flatten-message-pages";
import { MessageList } from "./message-list";
import { MessageSearchPanel } from "./message-search-panel";
import { MessageComposer } from "./message-composer";
import { ContactAvatar } from "./contact-avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Conversation } from "@/modules/inbox/types/inbox.types";

interface ChatPanelProps {
  conversationId: string;
  conversation: Conversation | null;
  notificationSoundMuted: boolean;
  viewportSignal: number;
  onToggleNotificationSound: () => void;
  onBack: () => void;
}

const MOBILE_BACK_TRANSITION_MS = 220;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function isMobileViewport(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(max-width: 639px)").matches
  );
}

export function ChatPanel({
  conversationId,
  conversation,
  notificationSoundMuted,
  viewportSignal,
  onToggleNotificationSound,
  onBack,
}: ChatPanelProps) {
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useConversationMessagesQuery(conversationId);
  const messages = flattenMessagePages(data?.pages);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrollAnchorSignal, setScrollAnchorSignal] = useState(0);
  const [isLeaving, setIsLeaving] = useState(false);
  const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const subtitle = conversation
    ? conversation.unread > 0
      ? `${conversation.unread} mensagem${conversation.unread > 1 ? "s" : ""} não lida${conversation.unread > 1 ? "s" : ""}`
      : "Atendimento no WhatsApp"
    : "";

  const requestScrollToBottom = useCallback(() => {
    setScrollAnchorSignal((current) => current + 1);
  }, []);

  useEffect(() => {
    setIsLeaving(false);
  }, [conversationId]);

  useEffect(() => {
    return () => {
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
      }
    };
  }, []);

  const handleBackClick = useCallback(() => {
    if (isLeaving) {
      return;
    }

    if (!isMobileViewport() || prefersReducedMotion()) {
      onBack();
      return;
    }

    setIsLeaving(true);
    leaveTimeoutRef.current = setTimeout(() => {
      onBack();
    }, MOBILE_BACK_TRANSITION_MS);
  }, [isLeaving, onBack]);

  return (
    <div
      className={[
        "relative flex h-full min-h-0 w-full min-w-0 overflow-hidden transform-gpu sm:translate-x-0 sm:opacity-100",
        "transition-transform transition-opacity ease-out will-change-transform sm:transition-none",
        isLeaving
          ? "translate-x-full opacity-[0.96] pointer-events-none duration-[220ms]"
          : "translate-x-0 opacity-100 duration-[220ms]",
      ].join(" ")}
    >
      <section className="chat-bg flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex h-[60px] shrink-0 items-center gap-3 bg-chat-header px-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackClick}
          disabled={isLeaving}
          className="sm:hidden -ml-1.5"
          aria-label="Voltar para lista"
        >
          <BackIcon />
        </Button>

        {conversation ? (
          <>
            <ContactAvatar
              name={conversation.contactName}
              phone={conversation.contactPhone}
              id={conversation.id}
              color={conversation.avatarColor}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[16px] font-semibold leading-tight text-text">
                {conversation.contactName}
              </p>
              <p className="mt-0.5 truncate text-[13px] leading-tight text-text-muted">
                {subtitle}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <HeaderIconButton
                label={
                  notificationSoundMuted
                    ? "Ativar notificações"
                    : "Silenciar notificações"
                }
                onClick={onToggleNotificationSound}
              >
                {notificationSoundMuted ? <VolumeOffIcon /> : <VolumeIcon />}
              </HeaderIconButton>
              <HeaderIconButton
                label="Pesquisar na conversa"
                onClick={() => setSearchOpen((open) => !open)}
              >
                <HeaderSearchIcon />
              </HeaderIconButton>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          </div>
        )}
      </div>

      <MessageList
        key={conversationId}
        messages={messages}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        hasMore={hasNextPage}
        isFetchingMore={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
        viewportResizeSignal={viewportSignal}
        anchorToBottomSignal={scrollAnchorSignal}
      />

      <MessageComposer
        conversationId={conversationId}
        onComposerFocus={requestScrollToBottom}
        onBottomLayoutChange={requestScrollToBottom}
        onMessageSent={async () => {
          await refetch();
          requestScrollToBottom();
        }}
      />
      </section>

      {searchOpen && (
        <MessageSearchPanel
          conversationId={conversationId}
          contactName={conversation?.contactName ?? "esta conversa"}
          onClose={() => setSearchOpen(false)}
        />
      )}
    </div>
  );
}

function HeaderIconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 outline-none text-text-muted transition-colors hover:bg-surface-active hover:text-text focus:outline-none focus:ring-0"
    >
      {children}
    </button>
  );
}

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HeaderSearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function VolumeIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M15 9a4 4 0 0 1 0 6M17.5 6.5a7.5 7.5 0 0 1 0 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function VolumeOffIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m15 10 5 5m0-5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

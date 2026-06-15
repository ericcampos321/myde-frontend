"use client";

import { useState } from "react";
import { useConversationMessagesQuery } from "@/modules/inbox/hooks/use-conversation-messages-query";
import { flattenMessagePages } from "@/modules/inbox/utils/flatten-message-pages";
import { MessageList } from "./message-list";
import { MessageSearchPanel } from "./message-search-panel";
import { MessageComposer } from "./message-composer";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Conversation } from "@/modules/inbox/types/inbox.types";

interface ChatPanelProps {
  conversationId: string;
  conversation: Conversation | null;
  onBack: () => void;
}

export function ChatPanel({ conversationId, conversation, onBack }: ChatPanelProps) {
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
  const subtitle = conversation
    ? conversation.unread > 0
      ? `${conversation.unread} mensagem${conversation.unread > 1 ? "s" : ""} não lida${conversation.unread > 1 ? "s" : ""}`
      : "Atendimento no WhatsApp"
    : "";

  return (
    <div className="chat-bg relative flex h-full flex-col">
      <div className="flex h-[60px] shrink-0 items-center gap-3 border-b border-border bg-chat-header px-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="sm:hidden -ml-1.5"
          aria-label="Voltar para lista"
        >
          <BackIcon />
        </Button>

        {conversation ? (
          <>
            <Avatar
              name={conversation.contactName}
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
                label="Pesquisar na conversa"
                onClick={() => setSearchOpen((open) => !open)}
              >
                <HeaderSearchIcon />
              </HeaderIconButton>
              <HeaderIconButton label="Mais opções">
                <HeaderMenuIcon />
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
      />

      <MessageComposer
        conversationId={conversationId}
        onMessageSent={async () => {
          await refetch();
        }}
      />

      {searchOpen && (
        <MessageSearchPanel
          conversationId={conversationId}
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
      className="flex h-10 w-10 items-center justify-center rounded-full border-0 outline-none text-text-muted transition-colors hover:bg-surface-active hover:text-text focus:outline-none focus:ring-0"
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

function HeaderMenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="5" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="19" r="1.5" fill="currentColor" />
    </svg>
  );
}

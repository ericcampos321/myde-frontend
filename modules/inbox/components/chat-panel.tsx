"use client";

import { useConversationMessagesQuery } from "@/modules/inbox/hooks/use-conversation-messages-query";
import { useConversationsQuery } from "@/modules/inbox/hooks/use-conversations-query";
import { MessageList } from "./message-list";
import { MessageComposer } from "./message-composer";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatPanelProps {
  conversationId: string;
  onBack: () => void;
}

export function ChatPanel({ conversationId, onBack }: ChatPanelProps) {
  const { data: conversations } = useConversationsQuery();
  const { data: messages = [], isLoading, isError, refetch } = useConversationMessagesQuery(conversationId);

  const conversation = conversations?.find((c) => c.id === conversationId);

  return (
    <div className="flex flex-col h-full bg-bg">
      {/* Header do chat */}
      <div className="shrink-0 flex items-center gap-3 px-4 h-14 border-b border-border bg-surface">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="sm:hidden -ml-1"
          aria-label="Voltar para lista"
        >
          <BackIcon />
        </Button>

        {conversation ? (
          <>
            <Avatar
              name={conversation.contactName}
              color={conversation.avatarColor}
              size="sm"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text truncate">
                {conversation.contactName}
              </p>
              <p className="text-[11px] text-text-muted truncate">
                {conversation.contactPhone}
              </p>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full shrink-0" />
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
      />

      <MessageComposer conversationId={conversationId} />
    </div>
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

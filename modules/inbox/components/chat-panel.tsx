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
    <div className="flex h-full flex-col bg-bg">
      {/* Header do chat */}
      <div className="flex h-[60px] shrink-0 items-center gap-3 border-b border-border/70 bg-surface-raised/70 px-3 shadow-[0_1px_0_rgba(0,0,0,0.22)] sm:px-4">
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
              size="md"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-text truncate leading-tight">
                {conversation.contactName}
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-text-muted truncate leading-tight">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent/70 shrink-0" aria-hidden />
                {conversation.contactPhone}
              </p>
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
      />

      <MessageComposer
        conversationId={conversationId}
        onMessageSent={async () => {
          await refetch();
        }}
      />
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

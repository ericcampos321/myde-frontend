"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";
import { formatMessageTime } from "@/modules/inbox/utils/format-message-time";
import type { Conversation } from "@/modules/inbox/types/inbox.types";

interface ConversationListItemProps {
  conversation: Conversation;
  selected: boolean;
  onClick: () => void;
}

export function ConversationListItem({
  conversation,
  selected,
  onClick,
}: ConversationListItemProps) {
  const { contactName, avatarColor, unread, lastMessage, lastMessageAt } = conversation;

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex h-[72px] w-full items-center gap-3 px-4 text-left transition-colors duration-150",
        "focus-visible:outline-none",
        selected
          ? "bg-surface-active"
          : "bg-transparent hover:bg-surface-raised focus-visible:bg-surface-raised"
      )}
      aria-pressed={selected}
      aria-label={`Conversa com ${contactName}`}
    >
      <Avatar
        name={contactName}
        color={avatarColor}
        size="lg"
        className="h-[49px] w-[49px]"
      />

      <div
        className={cn(
          "flex h-full min-w-0 flex-1 flex-col justify-center border-b",
          selected ? "border-transparent" : "border-border"
        )}
      >
        <div className="flex items-baseline justify-between gap-2">
          <span
            className={cn(
              "truncate text-[16px] leading-5",
              unread > 0 ? "font-normal text-text" : "font-normal text-text"
            )}
          >
            {contactName}
          </span>
          <span
            className={cn(
              "shrink-0 text-[12px] tabular-nums",
              unread > 0 ? "font-medium text-accent" : "text-text-muted/80"
            )}
          >
            {formatMessageTime(lastMessageAt)}
          </span>
        </div>

        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span
            className={cn(
              "truncate pr-2 text-[14px] leading-5",
              unread > 0 ? "text-text/85" : "text-text-muted"
            )}
          >
            {lastMessage || "Sem mensagens ainda"}
          </span>
          <Badge count={unread} className="min-w-5 h-5 px-1.5 text-[11px]" />
        </div>
      </div>
    </button>
  );
}

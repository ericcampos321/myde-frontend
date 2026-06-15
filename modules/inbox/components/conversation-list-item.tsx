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
        "group block w-full px-3 py-1 text-left focus-visible:outline-none"
      )}
      aria-pressed={selected}
      aria-label={`Conversa com ${contactName}`}
    >
      <div
        className={cn(
          "flex h-[72px] items-center gap-3 rounded-2xl px-3 transition-colors duration-200",
          selected
            ? "bg-surface-active"
            : "bg-transparent group-hover:bg-surface-raised group-focus-visible:bg-surface-raised"
        )}
      >
        <Avatar
          name={contactName}
          color={avatarColor}
          size="lg"
          className="h-[49px] w-[49px]"
        />

        <div
          className={cn(
            "flex h-full min-w-0 flex-1 flex-col justify-center"
          )}
        >
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-[16px] font-normal leading-5 text-text">{contactName}</span>
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
      </div>
    </button>
  );
}

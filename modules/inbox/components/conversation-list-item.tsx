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
        "w-full flex items-center gap-3 px-3 py-3 text-left transition-colors",
        "hover:bg-surface-raised focus-visible:outline-none focus-visible:bg-surface-raised",
        selected && "bg-surface-raised border-l-2 border-l-accent"
      )}
      aria-pressed={selected}
      aria-label={`Conversa com ${contactName}`}
    >
      <Avatar name={contactName} color={avatarColor} size="md" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span
            className={cn(
              "text-sm truncate",
              unread > 0 ? "font-semibold text-text" : "font-medium text-text"
            )}
          >
            {contactName}
          </span>
          <span className="text-[10px] text-text-muted shrink-0">
            {formatMessageTime(lastMessageAt)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-1 mt-0.5">
          <span
            className={cn(
              "text-xs truncate",
              unread > 0 ? "text-text" : "text-text-muted"
            )}
          >
            {lastMessage}
          </span>
          <Badge count={unread} />
        </div>
      </div>
    </button>
  );
}

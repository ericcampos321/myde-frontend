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
        "group relative flex h-[76px] w-full items-center gap-3.5 px-4 text-left transition-colors duration-150",
        "after:absolute after:bottom-0 after:left-[76px] after:right-3 after:h-px after:bg-border/40",
        "hover:bg-surface-raised/55 focus-visible:outline-none focus-visible:bg-surface-raised/80",
        selected && "bg-accent/[0.075] hover:bg-accent/[0.095]"
      )}
      aria-pressed={selected}
      aria-label={`Conversa com ${contactName}`}
    >
      {/* Barra de seleção à esquerda — sutil */}
      <span
        className={cn(
          "absolute left-0 top-1/2 h-10 w-[3px] -translate-y-1/2 rounded-r-full bg-accent shadow-[0_0_12px_rgba(30,128,255,0.25)] transition-opacity",
          selected ? "opacity-100" : "opacity-0"
        )}
        aria-hidden
      />

      <Avatar
        name={contactName}
        color={avatarColor}
        size="lg"
        className="h-12 w-12 ring-1 ring-white/5"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span
            className={cn(
              "truncate text-[14px] leading-5",
              unread > 0 ? "font-semibold text-text" : "font-medium text-text"
            )}
          >
            {contactName}
          </span>
          <span
            className={cn(
              "shrink-0 text-[10.5px] tabular-nums",
              unread > 0 ? "font-medium text-accent" : "text-text-muted/80"
            )}
          >
            {formatMessageTime(lastMessageAt)}
          </span>
        </div>

        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span
            className={cn(
              "truncate text-[12.5px] leading-5",
              unread > 0 ? "text-text/85" : "text-text-muted/90"
            )}
          >
            {lastMessage || "Sem mensagens ainda"}
          </span>
          <Badge count={unread} />
        </div>
      </div>
    </button>
  );
}

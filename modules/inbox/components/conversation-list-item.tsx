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
  const {
    contactName,
    avatarColor,
    unread,
    lastMessage,
    lastMessageAt,
    lastMessageDirection,
    lastMessageStatus,
  } = conversation;

  return (
    <button
      onClick={onClick}
      className={cn(
        "group block w-full cursor-pointer px-3 py-1 text-left focus-visible:outline-none"
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
            <div className="flex min-w-0 items-center gap-1.5 pr-2">
              <LastMessageStatusIcon
                lastMessageDirection={lastMessageDirection}
                lastMessageStatus={lastMessageStatus}
              />
              <span
                className={cn(
                  "truncate text-[14px] leading-5",
                  unread > 0 ? "text-text/85" : "text-text-muted"
                )}
              >
                {lastMessage || "Sem mensagens ainda"}
              </span>
            </div>
            <Badge count={unread} className="min-w-5 h-5 px-1.5 text-[11px]" />
          </div>
        </div>
      </div>
    </button>
  );
}

function LastMessageStatusIcon({
  lastMessageDirection,
  lastMessageStatus,
}: Pick<Conversation, "lastMessageDirection" | "lastMessageStatus">) {
  if (lastMessageDirection !== "outbound" || !lastMessageStatus) {
    return null;
  }

  if (lastMessageStatus === "pending") {
    return (
      <span className="shrink-0 text-text-muted/80" aria-hidden>
        <PendingClockIcon />
      </span>
    );
  }

  if (lastMessageStatus === "read") {
    return (
      <span className="shrink-0 text-[#53bdeb]" aria-hidden>
        <DoubleCheckIcon />
      </span>
    );
  }

  if (lastMessageStatus === "delivered") {
    return (
      <span className="shrink-0 text-text-muted/80" aria-hidden>
        <DoubleCheckIcon />
      </span>
    );
  }

  if (lastMessageStatus === "sent") {
    return (
      <span className="shrink-0 text-text-muted/80" aria-hidden>
        <SingleCheckIcon />
      </span>
    );
  }

  if (lastMessageStatus === "failed") {
    return (
      <span className="shrink-0 text-danger/75" aria-hidden>
        <FailedMessageIcon />
      </span>
    );
  }

  return null;
}

function SingleCheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 8.3 6.2 10.5 11.5 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DoubleCheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1.8 8.3 4 10.5 9.3 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.3 8.3 8.5 10.5 13.8 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PendingClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.25" stroke="currentColor" strokeWidth="1.3" />
      <path d="M7 4.4v2.9l1.9 1.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FailedMessageIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 4.1v3.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="7" cy="10.2" r=".8" fill="currentColor" />
    </svg>
  );
}

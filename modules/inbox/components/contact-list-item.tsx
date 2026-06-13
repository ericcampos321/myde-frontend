"use client";

import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/utils/cn";
import { formatMessageTime } from "@/modules/inbox/utils/format-message-time";
import type { Contact, Conversation } from "@/modules/inbox/types/inbox.types";

interface ContactListItemProps {
  contact: Contact;
  conversation: Conversation | null;
  isActive: boolean;
  onOpenConversation: () => void;
}

export function ContactListItem({
  contact,
  conversation,
  isActive,
  onOpenConversation,
}: ContactListItemProps) {
  const canOpenConversation = Boolean(conversation);
  const displayName = contact.profileName || contact.name;

  return (
    <button
      type="button"
      onClick={canOpenConversation ? onOpenConversation : undefined}
      disabled={!canOpenConversation}
      title={!canOpenConversation ? "Contato sem conversa ainda" : undefined}
      className={cn(
        "group relative flex h-[76px] w-full items-center gap-3.5 px-4 text-left transition-colors duration-150",
        "after:absolute after:bottom-0 after:left-[78px] after:right-4 after:h-px after:bg-border/30",
        canOpenConversation
          ? "hover:bg-surface-raised/60 focus-visible:outline-none focus-visible:bg-surface-raised/85"
          : "cursor-default text-text-muted/90",
        isActive && "bg-accent/[0.08] hover:bg-accent/[0.1]"
      )}
    >
      <span
        className={cn(
          "absolute left-0 top-1/2 h-11 w-[3px] -translate-y-1/2 rounded-r-full bg-accent shadow-[0_0_12px_rgba(30,128,255,0.22)] transition-opacity",
          isActive ? "opacity-100" : "opacity-0"
        )}
        aria-hidden
      />

      <Avatar
        name={displayName}
        size="lg"
        className="h-[50px] w-[50px] ring-1 ring-white/5"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[14px] font-medium leading-5 text-text">
            {displayName}
          </span>
          <span className="shrink-0 text-[10.5px] text-text-muted/80 tabular-nums">
            {formatMessageTime(contact.updatedAt)}
          </span>
        </div>

        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span
            className={cn(
              "truncate pr-2 text-[12.5px] leading-5",
              canOpenConversation ? "text-text-muted/90" : "text-text-muted/70"
            )}
          >
            {contact.phone}
          </span>
          <span
            className={cn(
              "shrink-0 text-[10px] font-medium uppercase tracking-[0.08em]",
              canOpenConversation ? "text-accent/65" : "text-text-muted/50"
            )}
          >
            {canOpenConversation ? "Conversa" : "Sem conversa"}
          </span>
        </div>
      </div>
    </button>
  );
}

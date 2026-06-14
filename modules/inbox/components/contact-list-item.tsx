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
        "group relative flex h-[72px] w-full items-center gap-3 px-4 text-left transition-colors duration-150",
        canOpenConversation
          ? isActive
            ? "bg-surface-active focus-visible:outline-none"
            : "bg-transparent hover:bg-surface-raised focus-visible:outline-none focus-visible:bg-surface-raised"
          : "cursor-default bg-transparent text-text-muted/90 opacity-75"
      )}
    >
      <Avatar
        name={displayName}
        size="lg"
        className="h-[49px] w-[49px]"
      />

      <div className={cn("flex h-full min-w-0 flex-1 flex-col justify-center border-b", isActive ? "border-transparent" : "border-border")}>
        <div className="flex items-baseline justify-between gap-2">
          <span
            className={cn(
              "truncate text-[16px] font-normal leading-5 text-text"
            )}
          >
            {displayName}
          </span>
          <span
            className={cn(
              "shrink-0 text-[12px] tabular-nums",
              isActive ? "font-medium text-accent" : "text-text-muted/80"
            )}
          >
            {formatMessageTime(contact.updatedAt)}
          </span>
        </div>

        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span
            className={cn(
              "truncate pr-2 text-[12.5px] leading-5",
              canOpenConversation
                ? isActive
                  ? "text-text/85"
                  : "text-text-muted"
                : "text-text-muted/70"
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

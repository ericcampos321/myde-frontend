"use client";

import { AppShell } from "@/components/shared/app-shell";
import { ConversationList } from "./conversation-list";
import { ChatPanel } from "./chat-panel";
import { NoConversationSelected } from "./no-conversation-selected";
import { useMeQuery } from "@/modules/inbox/hooks/use-me-query";
import { useState } from "react";
import type { Conversation } from "@/modules/inbox/types/inbox.types";

export function InboxLayout() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: me } = useMeQuery();

  const header = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <MydeLogo />
        <span className="text-sm font-semibold text-text">Inbox</span>
      </div>
      {me && (
        <span className="text-xs text-text-muted hidden sm:block">
          {me.name} · {me.role}
        </span>
      )}
    </div>
  );

  return (
    <AppShell
      header={header}
      sidebar={
        <ConversationList
          selectedId={selectedId}
          onSelect={(c: Conversation) => setSelectedId(c.id)}
        />
      }
      main={
        selectedId ? (
          <ChatPanel
            conversationId={selectedId}
            onBack={() => setSelectedId(null)}
          />
        ) : (
          <NoConversationSelected />
        )
      }
      showMain={!!selectedId}
    />
  );
}

function MydeLogo() {
  return (
    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-accent">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"
          fill="white"
        />
      </svg>
    </div>
  );
}

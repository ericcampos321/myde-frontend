"use client";

import Image from "next/image";
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
      <MydeLogo />
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
    <Image
      src="/brand/myde-inbox-logo.png"
      alt="Myde Inbox"
      width={2508}
      height={627}
      priority
      className="w-[130px] sm:w-[160px] h-auto object-contain mix-blend-screen"
    />
  );
}

"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./message-bubble";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import type { Message } from "@/modules/inbox/types/inbox.types";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function MessageList({ messages, isLoading, isError, onRetry }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (isLoading) return <MessageListSkeleton />;

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <ErrorState message="Não foi possível carregar as mensagens." retry={onRetry} />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          title="Nenhuma mensagem ainda"
          description="Envie a primeira mensagem para iniciar o atendimento."
        />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2" role="log" aria-live="polite">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

function MessageListSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
      {[false, true, false, true, false].map((isOut, i) => (
        <div key={i} className={`flex ${isOut ? "justify-end" : "justify-start"}`}>
          <Skeleton className={`h-10 rounded-2xl ${isOut ? "w-48" : "w-56"}`} />
        </div>
      ))}
    </div>
  );
}

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

const messageListSurfaceClassName =
  "chat-bg relative isolate flex-1 overflow-y-auto px-4 py-2 sm:px-[8%]";

const messageColumnClassName = "flex w-full flex-col";

export function MessageList({ messages, isLoading, isError, onRetry }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);

  useEffect(() => {
    if (!bottomRef.current) return;
    // Primeira renderização com dados: posiciona sem animação.
    // Mensagens subsequentes (novas chegando): scroll suave.
    bottomRef.current.scrollIntoView({
      behavior: isMounted.current ? "smooth" : "instant",
    });
    isMounted.current = true;
  }, [messages.length]);

  if (isLoading) return <MessageListSkeleton />;

  if (isError) {
    return (
      <div className={`${messageListSurfaceClassName} flex items-center justify-center`}>
        <ErrorState message="Não foi possível carregar as mensagens." retry={onRetry} />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className={`${messageListSurfaceClassName} flex items-center justify-center`}>
        <EmptyState
          title="Nenhuma mensagem ainda"
          description="Aguardando mensagens recebidas no WhatsApp real."
        />
      </div>
    );
  }

  return (
    <div
      className={messageListSurfaceClassName}
      role="log"
      aria-live="polite"
    >
        <div className={`${messageColumnClassName} gap-[2px]`}>
          {messages.map((msg, index) => (
            <MessageBubble
              key={msg.id}
            message={msg}
            groupStart={index > 0 && messages[index - 1].direction !== msg.direction}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function MessageListSkeleton() {
  return (
    <div className={messageListSurfaceClassName}>
      <div className={`${messageColumnClassName} gap-3`}>
        {[false, true, false, true, false].map((isOut, i) => (
          <div key={i} className={`flex px-1 ${isOut ? "justify-end" : "justify-start"}`}>
            <Skeleton
              className={`h-11 rounded-2xl ${isOut ? "w-48 rounded-br-md" : "w-60 rounded-bl-md"}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

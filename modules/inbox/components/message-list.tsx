"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { MessageBubble } from "./message-bubble";
import { LoadMoreButton } from "./load-more-button";
import { DateSeparator } from "./date-separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { useScrollPreservation } from "@/modules/inbox/hooks/use-scroll-preservation";
import { groupMessagesByDay } from "@/modules/inbox/utils/group-messages-by-day";
import type { Message } from "@/modules/inbox/types/inbox.types";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  hasMore: boolean;
  isFetchingMore: boolean;
  onLoadMore: () => void;
}

const messageListSurfaceClassName =
  "relative isolate flex-1 overflow-y-auto px-4 py-2 sm:px-[8%]";

const messageColumnClassName = "flex w-full flex-col";

// Distância do fim (px) para considerar o usuário "perto do fim" e autoscrollar.
const NEAR_BOTTOM_THRESHOLD = 80;

export function MessageList({
  messages,
  isLoading,
  isError,
  onRetry,
  hasMore,
  isFetchingMore,
  onLoadMore,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasRenderedRef = useRef(false);
  const nearBottomRef = useRef(true);
  // true entre o clique em "carregar mais" e a chegada das mensagens antigas.
  const prependingRef = useRef(false);

  const capture = useScrollPreservation(scrollRef, messages.length);
  const dayGroups = useMemo(() => groupMessagesByDay(messages), [messages]);

  function handleLoadMore() {
    capture();
    prependingRef.current = true;
    onLoadMore();
  }

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    nearBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_THRESHOLD;
  }

  // Autoscroll: primeira renderização → fundo (instant). Mensagem nova no fim →
  // suave, só se o usuário já estava perto do fim. Prepend de antigas → não mexe
  // (a preservação de scroll cuida disso).
  useLayoutEffect(() => {
    if (prependingRef.current) {
      prependingRef.current = false;
      return;
    }
    if (messages.length === 0) return;

    if (!hasRenderedRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "instant" });
      hasRenderedRef.current = true;
      return;
    }

    if (nearBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // Mantém o flag de "perto do fim" coerente após o primeiro paint.
  useEffect(() => {
    handleScroll();
  }, []);

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
      ref={scrollRef}
      onScroll={handleScroll}
      className={messageListSurfaceClassName}
      role="log"
      aria-live="polite"
    >
      <LoadMoreButton
        hasMore={hasMore}
        isFetching={isFetchingMore}
        onLoadMore={handleLoadMore}
      />

      <div className={`${messageColumnClassName} gap-[2px]`}>
        {renderDayGroups(dayGroups)}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function renderDayGroups(
  groups: ReturnType<typeof groupMessagesByDay>
): ReactNode {
  // groupStart (cauda da bolha) acompanha a troca de direção ao longo da lista
  // inteira, independente do dia.
  let prevDirection: Message["direction"] | null = null;

  return groups.map((group) => (
    <div key={`${group.dayKey}-${group.messages[0]!.id}`}>
      <DateSeparator label={group.label} />
      {group.messages.map((msg) => {
        const groupStart = prevDirection !== null && prevDirection !== msg.direction;
        prevDirection = msg.direction;
        return <MessageBubble key={msg.id} message={msg} groupStart={groupStart} />;
      })}
    </div>
  ));
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

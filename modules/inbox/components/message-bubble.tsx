import { cn } from "@/utils/cn";
import type { ReactNode } from "react";
import type { Message } from "@/modules/inbox/types/inbox.types";

interface MessageBubbleProps {
  message: Message;
  groupStart?: boolean;
}

export function MessageBubble({ message, groupStart = false }: MessageBubbleProps) {
  const isOut = message.direction === "out";
  const isOptimistic = message.id.startsWith("optimistic-");

  const createdAt = message.createdAt ? new Date(message.createdAt) : null;
  const time =
    createdAt && !Number.isNaN(createdAt.getTime())
      ? createdAt.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  const isFailed = isOut && message.status === "failed";

  return (
    <div
      data-message-id={message.id}
      className={cn(
        "flex my-[1px]",
        isOut ? "justify-end" : "justify-start",
        groupStart && "mt-1.5"
      )}
    >
      <div
        className={cn(
          "relative w-fit max-w-[85%] overflow-visible rounded-lg pb-[20px] pl-[9px] pr-[7px] pt-[6px] shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] sm:max-w-[65%]",
          isOut
            ? "bubble-sent rounded-tr-[2px] bg-bubble-out text-text"
            : "bubble-recv rounded-tl-[2px] bg-bubble-in text-text",
          isFailed && "ring-1 ring-danger/40",
          isOptimistic && "opacity-60"
        )}
      >
        <p className="whitespace-pre-wrap break-words text-[14.2px] leading-[19px] [overflow-wrap:anywhere]">
          {renderBasicMarkdown(message.body)}
          <span
            aria-hidden
            className="inline-block select-none"
            style={{ width: isOut ? 62 : 44 }}
          />
        </p>

        <span
          className={cn(
            "absolute bottom-[5px] right-[7px] flex items-center gap-[3px] leading-none",
            "text-[var(--text-meta)]"
          )}
        >
          <span className="text-[11px] tabular-nums">{time}</span>
          {isOut && <StatusIcon status={message.status} />}
        </span>
      </div>
    </div>
  );
}

function renderBasicMarkdown(text: string): ReactNode[] {
  return text.split(/(\*\*[^*\n]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-semibold">{part.slice(2, -2)}</strong>;
    }

    return part;
  });
}

function StatusIcon({ status }: { status: Message["status"] }) {
  if (status === "failed") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-label="Não entregue" className="text-danger">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M12 7v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="16.5" r="1" fill="currentColor" />
      </svg>
    );
  }
  if (status === "read") {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-label="Lida" className="text-[#53bdeb]">
        <path d="M2 12l5 5L15 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12l5 5L22 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (status === "delivered") {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-label="Entregue" className="text-text/55">
        <path d="M2 12l5 5L15 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12l5 5L22 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-label="Enviada" className="text-text/55">
      <path d="M5 12l5 5L19 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

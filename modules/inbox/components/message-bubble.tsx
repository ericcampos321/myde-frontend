import { cn } from "@/utils/cn";
import type { ReactNode } from "react";
import type { Message } from "@/modules/inbox/types/inbox.types";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isOut = message.direction === "out";
  const isOptimistic = message.id.startsWith("optimistic-");

  const time = new Date(message.createdAt).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isFailed = isOut && message.status === "failed";

  return (
    <div className={cn("flex px-1", isOut ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "relative w-fit max-w-[88%] rounded-xl px-3 py-1.5 shadow-sm sm:max-w-[min(76%,680px)]",
          isOut
            ? "rounded-br-sm bg-[linear-gradient(160deg,#287fe9,#1769cf)] text-white shadow-[0_3px_10px_rgba(21,101,214,0.18)]"
            : "rounded-bl-sm border border-border/60 bg-surface-raised/95 text-text backdrop-blur-sm",
          isFailed && "ring-1 ring-danger/40",
          isOptimistic && "opacity-60"
        )}
      >
        <p className="whitespace-pre-wrap break-words text-[13.5px] leading-[1.45] [overflow-wrap:anywhere]">
          {renderBasicMarkdown(message.body)}
        </p>

        <div
          className={cn(
            "mt-0.5 flex items-center justify-end gap-1 leading-none",
            isOut ? "text-white/65" : "text-text-muted"
          )}
        >
          {isFailed && (
            <span className="mr-0.5 inline-flex items-center gap-0.5 text-[9px] font-medium text-white/75">
              Não entregue
            </span>
          )}
          <span className="text-[10px] tabular-nums">{time}</span>
          {isOut && <StatusIcon status={message.status} />}
        </div>
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
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-label="Não entregue" className="text-white/90">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M12 7v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="16.5" r="1" fill="currentColor" />
      </svg>
    );
  }
  if (status === "read") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-label="Lida" className="text-white/85">
        <path d="M2 12l5 5L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12l5 5L22 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (status === "delivered") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-label="Entregue" className="text-white/55">
        <path d="M2 12l5 5L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12l5 5L22 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-label="Enviada" className="text-white/55">
      <path d="M5 12l5 5L19 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

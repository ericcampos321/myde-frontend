import { cn } from "@/utils/cn";
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

  return (
    <div className={cn("flex", isOut ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] sm:max-w-[60%] rounded-2xl px-4 py-2.5 space-y-1",
          isOut
            ? "bg-accent text-white rounded-br-sm"
            : "bg-surface-raised text-text rounded-bl-sm",
          isOptimistic && "opacity-60"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.body}</p>
        <div className={cn("flex items-center justify-end gap-1", isOut ? "text-white/60" : "text-text-muted")}>
          <span className="text-[10px]">{time}</span>
          {isOut && <StatusIcon status={message.status} />}
        </div>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: Message["status"] }) {
  if (status === "read") {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-label="Lida" className="text-white/80">
        <path d="M2 12l5 5L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12l5 5L22 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (status === "delivered") {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-label="Entregue" className="text-white/60">
        <path d="M2 12l5 5L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12l5 5L22 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-label="Enviada" className="text-white/60">
      <path d="M5 12l5 5L19 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

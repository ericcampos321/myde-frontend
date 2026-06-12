"use client";

import { FormEvent, KeyboardEvent, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AiSuggestionButton } from "./ai-suggestion-button";
import { useSendMessageMutation } from "@/modules/inbox/hooks/use-send-message-mutation";

interface MessageComposerProps {
  conversationId: string;
}

export function MessageComposer({ conversationId }: MessageComposerProps) {
  const [text, setText] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { mutate: send, isPending } = useSendMessageMutation(conversationId);

  function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isPending) return;

    setSendError(null);
    send(trimmed, {
      onSuccess: () => setText(""),
      onError: () => setSendError("Falha ao enviar. Tente novamente."),
    });
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleSuggestion(suggestion: string) {
    setText(suggestion);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  return (
    <div className="shrink-0 border-t border-border bg-surface px-4 py-3">
      {sendError && (
        <p className="mb-2 text-xs text-danger" role="alert">
          {sendError}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <Textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (sendError) setSendError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Digite uma mensagem…"
              rows={1}
              className="min-h-[40px] max-h-32"
              disabled={isPending}
              aria-label="Campo de mensagem"
            />
            <p className="mt-1.5 text-[10px] text-text-muted">Enter para enviar</p>
          </div>

          <div className="flex shrink-0 items-center gap-2 pt-[2px]">
            <AiSuggestionButton conversationId={conversationId} onSuggestion={handleSuggestion} disabled={isPending} />
            <Button type="submit" size="md" loading={isPending} disabled={!text.trim()} aria-label="Enviar mensagem">
              <SendIcon />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

"use client";

import { KeyboardEvent, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AiSuggestionButton } from "./ai-suggestion-button";
import { useMeQuery } from "@/modules/inbox/hooks/use-me-query";
import { sendMessage } from "@/modules/inbox/services/inbox.service";
import { parseApiError } from "@/services/http/api-error";

interface MessageComposerProps {
  conversationId: string;
  onMessageSent?: () => Promise<void> | void;
}

type MessageState = "idle" | "success" | "error" | "sending";

export function MessageComposer({
  conversationId,
  onMessageSent,
}: MessageComposerProps) {
  const [text, setText] = useState("");
  const [messageState, setMessageState] = useState<MessageState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { data: me } = useMeQuery();

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
    }
  }

  function handleSuggestion(suggestion: string) {
    setText(suggestion);
    setMessageState("idle");
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  async function handleCopy() {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    try {
      await navigator.clipboard.writeText(trimmed);
      setMessageState("success");
    } catch {
      setMessageState("error");
      setErrorMessage("Não foi possível copiar automaticamente.");
    }
  }

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || !me?.id) {
      return;
    }

    setMessageState("sending");
    setErrorMessage("");

    try {
      await sendMessage(conversationId, trimmed, me.id);
      setText("");
      setMessageState("success");
      await onMessageSent?.();
      setTimeout(() => setMessageState("idle"), 2000);
    } catch (error) {
      setMessageState("error");
      setErrorMessage(parseApiError(error).message || "Erro ao enviar mensagem");
    }
  }

  const canSuggest = me?.capabilities.aiSuggestion ?? false;
  const canSend = me?.capabilities.sendMessage ?? false;
  const isSending = messageState === "sending";

  return (
    <div className="shrink-0 border-t border-border bg-surface px-4 py-3">
      {messageState === "success" && (
        <p className="mb-2 text-xs text-text-muted" role="status">
          Mensagem enviada com sucesso.
        </p>
      )}
      {messageState === "error" && (
        <p className="mb-2 text-xs text-danger" role="alert">
          {errorMessage || "Erro ao enviar mensagem."}
        </p>
      )}

      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (messageState !== "idle") setMessageState("idle");
            }}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem aqui..."
            rows={3}
            className="min-h-[72px] max-h-40"
            aria-label="Campo de mensagem"
            disabled={isSending}
          />
          <p className="mt-1.5 text-[10px] text-text-muted">
            Envio real de mensagens via Meta WhatsApp Cloud API.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 pt-[2px]">
          {canSuggest && (
            <AiSuggestionButton
              conversationId={conversationId}
              onSuggestion={handleSuggestion}
              disabled={isSending}
            />
          )}
          <Button
            type="button"
            size="md"
            variant="ghost"
            onClick={() => void handleCopy()}
            disabled={!text.trim() || isSending}
            aria-label="Copiar rascunho"
          >
            <CopyIcon />
            <span className="hidden sm:inline text-xs">Copiar</span>
          </Button>
          <Button
            type="button"
            size="md"
            onClick={() => void handleSend()}
            disabled={!canSend || !text.trim() || isSending}
            aria-label="Enviar mensagem"
            loading={isSending}
          >
            <SendIcon />
            <span className="hidden sm:inline text-xs">Enviar</span>
          </Button>
        </div>
      </div>
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

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="9"
        y="9"
        width="11"
        height="11"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

"use client";

import {
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
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

// Altura é 100% controlada por JS (sem classes Tailwind de altura), garantindo
// o auto-resize. Vazio = compacto; cresce até o limite; depois, scroll interno.
const MIN_TEXTAREA_HEIGHT = 40;
const MAX_TEXTAREA_HEIGHT = 150;

export function MessageComposer({
  conversationId,
  onMessageSent,
}: MessageComposerProps) {
  const [text, setText] = useState("");
  const [messageState, setMessageState] = useState<MessageState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { data: me } = useMeQuery();

  // Auto-resize: zera a altura para medir o conteúdo real, aplica o clamp
  // [MIN, MAX] e liga o scroll interno só quando passa do máximo.
  const resizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const next = Math.max(
      MIN_TEXTAREA_HEIGHT,
      Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT)
    );
    textarea.style.height = `${next}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden";
  }, []);

  // Reajusta sempre que o texto muda (digitação, sugestão IA, envio/limpeza).
  // requestAnimationFrame garante que o DOM já refletiu o novo valor.
  useEffect(() => {
    const id = requestAnimationFrame(resizeTextarea);
    return () => cancelAnimationFrame(id);
  }, [text, resizeTextarea]);

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
    <div className="shrink-0 border-t border-border/70 bg-surface-raised/80 px-2.5 pb-1.5 pt-2 shadow-[0_-4px_16px_rgba(0,0,0,0.12)] sm:px-3.5">
      {messageState === "success" && (
        <p className="mb-1.5 px-1 text-[10px] text-text-muted" role="status">
          Mensagem enviada com sucesso.
        </p>
      )}
      {messageState === "error" && (
        <p className="mb-1.5 px-1 text-[10px] text-danger" role="alert">
          {errorMessage || "Erro ao enviar mensagem."}
        </p>
      )}

      <div className="flex items-end gap-1.5 sm:gap-2">
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (messageState !== "idle") setMessageState("idle");
            resizeTextarea();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Digite uma mensagem"
          rows={1}
          style={{ maxHeight: MAX_TEXTAREA_HEIGHT }}
          className="block min-w-0 flex-1 resize-none overflow-hidden rounded-[20px] border-border/70 bg-surface px-4 py-[9px] text-sm leading-[22px] focus:border-accent/70 focus:ring-0"
          aria-label="Campo de mensagem"
          disabled={isSending}
        />

        <div className="flex shrink-0 items-center gap-1.5">
          {canSuggest && (
            <AiSuggestionButton
              conversationId={conversationId}
              onSuggestion={handleSuggestion}
              disabled={isSending}
            />
          )}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => void handleCopy()}
            disabled={!text.trim() || isSending}
            aria-label="Copiar rascunho"
            className="h-10 rounded-full border border-border px-2.5 disabled:opacity-50"
          >
            <CopyIcon />
            <span className="hidden text-xs lg:inline">Copiar</span>
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => void handleSend()}
            disabled={!canSend || !text.trim() || isSending}
            aria-label="Enviar mensagem"
            loading={isSending}
            className="h-10 rounded-full bg-[linear-gradient(160deg,#2a86f5,#1565d6)] px-3 text-white shadow-[0_4px_12px_rgba(21,101,214,0.24)] hover:brightness-110 disabled:bg-none disabled:bg-surface disabled:text-text-muted disabled:shadow-none"
          >
            <SendIcon />
            <span className="hidden text-xs font-semibold lg:inline">Enviar</span>
          </Button>
        </div>
      </div>

      <p className="mt-1 hidden px-1 text-[9px] leading-none text-text-muted/55 sm:block">
        Envio real via Meta WhatsApp Cloud API.
      </p>
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

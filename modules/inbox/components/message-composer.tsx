"use client";

import { KeyboardEvent, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AiSuggestionButton } from "./ai-suggestion-button";
import { useMeQuery } from "@/modules/inbox/hooks/use-me-query";

interface MessageComposerProps {
  conversationId: string;
}

export function MessageComposer({ conversationId }: MessageComposerProps) {
  const [text, setText] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { data: me } = useMeQuery();

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
    }
  }

  function handleSuggestion(suggestion: string) {
    setText(suggestion);
    setCopyState("idle");
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  async function handleCopy() {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    try {
      await navigator.clipboard.writeText(trimmed);
      setCopyState("success");
    } catch {
      setCopyState("error");
    }
  }

  const canSuggest = me?.capabilities.aiSuggestion ?? false;
  const canSend = me?.capabilities.sendMessage ?? false;

  return (
    <div className="shrink-0 border-t border-border bg-surface px-4 py-3">
      {!canSend && (
        <p className="mb-2 text-xs text-text-muted" role="status">
          Envio outbound ainda não habilitado neste backend. Use a sugestão e
          copie o texto para atendimento assistido.
        </p>
      )}
      {copyState === "success" && (
        <p className="mb-2 text-xs text-text-muted" role="status">
          Texto copiado para a area de transferencia.
        </p>
      )}
      {copyState === "error" && (
        <p className="mb-2 text-xs text-danger" role="alert">
          Nao foi possivel copiar automaticamente. Copie o texto manualmente.
        </p>
      )}

      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (copyState !== "idle") setCopyState("idle");
            }}
            onKeyDown={handleKeyDown}
            placeholder="Sugestao do backend real aparecera aqui..."
            rows={3}
            className="min-h-[72px] max-h-40"
            aria-label="Campo de rascunho"
          />
          <p className="mt-1.5 text-[10px] text-text-muted">
            Fluxo atual: leitura real da inbox e sugestao IA via backend.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 pt-[2px]">
          {canSuggest && (
            <AiSuggestionButton
              conversationId={conversationId}
              onSuggestion={handleSuggestion}
            />
          )}
          <Button
            type="button"
            size="md"
            variant="ghost"
            onClick={() => void handleCopy()}
            disabled={!text.trim()}
            aria-label="Copiar rascunho"
          >
            <CopyIcon />
            <span className="hidden sm:inline text-xs">Copiar</span>
          </Button>
          <Button
            type="button"
            size="md"
            disabled={!canSend || !text.trim()}
            aria-label="Enviar mensagem"
            title="Envio outbound ainda nao habilitado neste backend"
          >
            <SendIcon />
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

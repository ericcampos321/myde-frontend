"use client";

import {
  KeyboardEvent,
  TransitionEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Textarea } from "@/components/ui/textarea";
import { AiSuggestionButton } from "./ai-suggestion-button";
import { EmojiPickerPopover } from "./emoji-picker-popover";
import { useMeQuery } from "@/modules/inbox/hooks/use-me-query";
import { apiClient } from "@/services/http/api-client";
import { parseApiError } from "@/services/http/api-error";
import type { AiSuggestion, SentMessage } from "@/modules/inbox/types/inbox.types";

interface MessageComposerProps {
  conversationId: string;
  onMessageSent?: () => Promise<void> | void;
}

type MessageState = "idle" | "success" | "error" | "sending";
const AI_SUGGESTION_BLOCKED_FALLBACK_MESSAGE =
  "Não consegui gerar uma sugestão segura para essa mensagem. Revise manualmente antes de responder.";
const AI_SUGGESTION_EMPTY_FALLBACK_MESSAGE = "Não foi possível gerar uma sugestão para essa conversa.";

// Altura é 100% controlada por JS (sem classes Tailwind de altura), garantindo
// o auto-resize. Vazio = compacto; cresce até o limite; depois, scroll interno.
const MIN_TEXTAREA_HEIGHT = 42;
const MAX_TEXTAREA_HEIGHT = 150;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function MessageComposer({ conversationId, onMessageSent }: MessageComposerProps) {
  const [text, setText] = useState("");
  const [messageState, setMessageState] = useState<MessageState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [suggestionMessage, setSuggestionMessage] = useState<string | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  // Montagem separada da intenção: mantém o popover no DOM durante a animação de
  // saída e só desmonta no fim da transição (ou imediatamente em reduced-motion).
  const [emojiMounted, setEmojiMounted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiAreaRef = useRef<HTMLDivElement>(null);
  const { data: me } = useMeQuery();

  // Auto-resize: zera a altura para medir o conteúdo real, aplica o clamp
  // [MIN, MAX] e liga o scroll interno só quando passa do máximo.
  const resizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const next = Math.max(MIN_TEXTAREA_HEIGHT, Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT));
    textarea.style.height = `${next}px`;
    textarea.style.overflowY = textarea.scrollHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden";
  }, []);

  // Reajusta sempre que o texto muda (digitação, sugestão IA, envio/limpeza).
  // requestAnimationFrame garante que o DOM já refletiu o novo valor.
  useEffect(() => {
    const id = requestAnimationFrame(resizeTextarea);
    return () => cancelAnimationFrame(id);
  }, [text, resizeTextarea]);

  // Abre: monta e, no próximo frame, troca para o estado "aberto" (dispara a
  // transição de entrada). Em reduced-motion abre direto, sem animar.
  const openEmojiPicker = useCallback(() => {
    setEmojiMounted(true);
    if (prefersReducedMotion()) {
      setEmojiOpen(true);
      return;
    }
    requestAnimationFrame(() => setEmojiOpen(true));
  }, []);

  // Fecha: marca a intenção como fechada (dispara a transição de saída). O
  // desmonte acontece no onTransitionEnd; em reduced-motion desmonta na hora.
  const closeEmojiPicker = useCallback(() => {
    setEmojiOpen(false);
    if (prefersReducedMotion()) setEmojiMounted(false);
  }, []);

  const toggleEmojiPicker = useCallback(() => {
    if (emojiOpen) closeEmojiPicker();
    else openEmojiPicker();
  }, [emojiOpen, openEmojiPicker, closeEmojiPicker]);

  // Desmonta só quando a transição de saída termina (e apenas a do próprio shell).
  function handleEmojiShellTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    if (!emojiOpen) setEmojiMounted(false);
  }

  // Fecha o picker ao clicar fora (botão + popover ficam dentro de emojiAreaRef)
  // ou ao pressionar Escape. Listeners só ativos com o picker aberto.
  useEffect(() => {
    if (!emojiOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!emojiAreaRef.current?.contains(event.target as Node)) {
        closeEmojiPicker();
      }
    }
    function handleKeydown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") closeEmojiPicker();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [emojiOpen, closeEmojiPicker]);

  function insertEmoji(emoji: string) {
    const el = textareaRef.current;
    const { value, cursor } = insertEmojiAtSelection(text, el?.selectionStart, el?.selectionEnd, emoji);

    setText(value);
    if (suggestionMessage) setSuggestionMessage(null);
    if (messageState !== "idle") setMessageState("idle");

    // No próximo frame (DOM já com o novo valor): foca e posiciona o cursor.
    requestAnimationFrame(() => {
      const node = textareaRef.current;
      node?.focus();
      node?.setSelectionRange(cursor, cursor);
      resizeTextarea();
    });
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
    }
  }

  function handleSuggestion(suggestion: AiSuggestion) {
    const outcome = resolveAiSuggestionComposerState(text, suggestion);

    setText(outcome.nextText);
    setSuggestionMessage(outcome.feedbackMessage);
    setMessageState("idle");
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || !me?.id) {
      return;
    }

    setMessageState("sending");
    setErrorMessage("");
    setSuggestionMessage(null);

    try {
      await apiClient.post<SentMessage>(
        `/conversations/${conversationId}/messages`,
        { text: trimmed },
        { headers: { "X-Tenant-ID": me.id } }
      );
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
  const hasText = text.trim().length > 0;

  return (
    <div className="shrink-0 bg-transparent pb-2 pt-1">
      {messageState === "error" && (
        <p className="px-4 pt-1.5 text-[11px] text-danger" role="alert">
          {errorMessage || "Erro ao enviar mensagem."}
        </p>
      )}
      {suggestionMessage && (
        <p className="px-4 pt-1.5 text-[11px] text-text-muted" role="status">
          {suggestionMessage}
        </p>
      )}

      <div className="flex min-h-[62px] items-end gap-1.5 px-3.5">
        <div className="flex min-w-0 flex-1 items-end gap-1 rounded-[22px] bg-chat-footer px-2 py-1.5">
          <div ref={emojiAreaRef} className="relative shrink-0">
            <FooterIconButton label="Emoji" compact active={emojiOpen} onClick={toggleEmojiPicker}>
              <EmojiIcon />
            </FooterIconButton>

            {emojiMounted && (
              <div
                className="emoji-picker-popover-shell"
                data-state={emojiOpen ? "open" : "closed"}
                onTransitionEnd={handleEmojiShellTransitionEnd}
              >
                <EmojiPickerPopover onEmojiSelect={insertEmoji} />
              </div>
            )}
          </div>

          <Textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (suggestionMessage) setSuggestionMessage(null);
              if (messageState !== "idle") setMessageState("idle");
              resizeTextarea();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Digite uma mensagem"
            rows={1}
            style={{ maxHeight: MAX_TEXTAREA_HEIGHT }}
            className="block min-w-0 flex-1 resize-none overflow-hidden border-transparent bg-transparent px-2 py-[11px] text-[15px] leading-[20px] focus:border-transparent focus:ring-0"
            aria-label="Campo de mensagem"
            disabled={isSending}
          />

          <div className="flex shrink-0 items-center gap-2">
            {canSuggest && (
              <AiSuggestionButton conversationId={conversationId} onSuggestion={handleSuggestion} disabled={isSending} compact />
            )}

            {hasText && (
              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={!canSend || isSending}
                aria-label="Enviar mensagem"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-accent text-[#0b141a] outline-none transition-colors hover:bg-accent-hover focus:outline-none focus:ring-0 disabled:cursor-default disabled:opacity-70"
              >
                {isSending ? <SpinnerIcon /> : <SendIcon />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function clampIndex(value: number, max: number): number {
  if (!Number.isFinite(value) || value < 0) return max;
  return Math.min(value, max);
}

/**
 * Insere `emoji` em `value` respeitando a seleção atual (substitui o intervalo
 * selecionado). Função pura — retorna o novo texto e a posição final do cursor
 * (logo após o emoji). Seleção ausente → insere no fim.
 */
export function insertEmojiAtSelection(
  value: string,
  selectionStart: number | null | undefined,
  selectionEnd: number | null | undefined,
  emoji: string
): { value: string; cursor: number } {
  const len = value.length;
  const start = clampIndex(selectionStart ?? len, len);
  const end = clampIndex(selectionEnd ?? len, len);
  const lo = Math.min(start, end);
  const hi = Math.max(start, end);

  return {
    value: value.slice(0, lo) + emoji + value.slice(hi),
    cursor: lo + emoji.length,
  };
}

interface AiSuggestionComposerState {
  nextText: string;
  feedbackMessage: string | null;
}

export function resolveAiSuggestionComposerState(currentText: string, suggestion: AiSuggestion): AiSuggestionComposerState {
  if (suggestion.blocked) {
    return {
      nextText: currentText,
      feedbackMessage: suggestion.userMessage ?? AI_SUGGESTION_BLOCKED_FALLBACK_MESSAGE,
    };
  }

  const nextSuggestion = suggestion.suggestion?.trim() ?? "";

  if (nextSuggestion.length === 0) {
    return {
      nextText: currentText,
      feedbackMessage: AI_SUGGESTION_EMPTY_FALLBACK_MESSAGE,
    };
  }

  return {
    nextText: suggestion.suggestion ?? currentText,
    feedbackMessage: null,
  };
}

function FooterIconButton({
  label,
  onClick,
  disabled = false,
  compact = false,
  active = false,
  children,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  compact?: boolean;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={onClick ? active : undefined}
      title={disabled ? undefined : label}
      onClick={onClick}
      disabled={disabled}
      className={[
        "flex items-center justify-center rounded-full border-0 outline-none transition-colors enabled:hover:bg-text/8 enabled:hover:text-text focus:outline-none focus:ring-0 disabled:cursor-default disabled:opacity-60",
        active ? "text-accent" : "text-text-muted",
        onClick && !disabled ? "cursor-pointer" : "",
        compact ? "h-9 w-9" : "h-10 w-10",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function EmojiIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8.5 14.5c.9 1 2.1 1.5 3.5 1.5s2.6-.5 3.5-1.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="9" cy="10" r="1" fill="currentColor" />
      <circle cx="15" cy="10" r="1" fill="currentColor" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="animate-spin" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" />
      <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

"use client";

import { useState } from "react";
import { useAiSuggestionMutation } from "@/modules/inbox/hooks/use-ai-suggestion-mutation";
import { parseApiError } from "@/services/http/api-error";
import type { AiSuggestion } from "@/modules/inbox/types/inbox.types";

interface AiSuggestionButtonProps {
  conversationId: string;
  onSuggestion: (suggestion: AiSuggestion) => void;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
}

export function AiSuggestionButton({
  conversationId,
  onSuggestion,
  disabled,
  compact = false,
  className,
}: AiSuggestionButtonProps) {
  const { mutate, isPending } = useAiSuggestionMutation();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    mutate(conversationId, {
      onSuccess: (data) => onSuggestion(data),
      onError: (err) => setError(parseApiError(err).message),
    });
  }

  return (
    <div className="relative flex flex-col items-end gap-1">
      {error && (
        <p
          className="absolute bottom-full mb-1.5 right-0 z-10 max-w-[220px] whitespace-normal rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[10px] text-danger shadow-lg"
          role="alert"
        >
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isPending}
        aria-label="Gerar resposta com IA"
        aria-busy={isPending}
        title="Gerar resposta com IA"
        className={[
          "flex items-center justify-center rounded-full border-0 outline-none text-text-muted transition-colors enabled:hover:bg-text/8 enabled:hover:text-text focus:outline-none focus:ring-0 disabled:cursor-default disabled:opacity-60",
          compact ? "h-9 w-9" : "h-10 w-10",
          className ?? "",
        ].join(" ")}
      >
        {isPending ? <SpinnerIcon /> : <AiGenerateIcon />}
      </button>
    </div>
  );
}

function AiGenerateIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 17.5 17.5 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14 6h3.5v3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m5.5 12.5 1-2.5 2.5-1-2.5-1-1-2.5-1 2.5-2.5 1 2.5 1 1 2.5Z" fill="currentColor" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

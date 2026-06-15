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
        aria-label="Gerar sugestão com IA"
        aria-busy={isPending}
        title="Gerar sugestão com IA"
        className={[
          "ai-generate-button",
          compact ? "ai-generate-button--compact" : "",
          isPending ? "ai-generate-button--loading" : "",
          className ?? "",
        ].join(" ")}
      >
        <span className="ai-generate-button__icon">
          <SparklesIcon />
        </span>
        <span className="ai-generate-button__text">
          {isPending ? "Gerando..." : "Gerar IA"}
        </span>
      </button>
    </div>
  );
}

function SparklesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="m12 3 1.45 4.05L17.5 8.5l-4.05 1.45L12 14l-1.45-4.05L6.5 8.5l4.05-1.45L12 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="m18.5 13 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinejoin="round"
      />
      <path
        d="m5.5 14 .65 1.85L8 16.5l-1.85.65L5.5 19l-.65-1.85L3 16.5l1.85-.65L5.5 14Z"
        fill="currentColor"
      />
    </svg>
  );
}

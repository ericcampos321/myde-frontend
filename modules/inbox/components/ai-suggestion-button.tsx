"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAiSuggestionMutation } from "@/modules/inbox/hooks/use-ai-suggestion-mutation";
import { parseApiError } from "@/services/http/api-error";

interface AiSuggestionButtonProps {
  conversationId: string;
  onSuggestion: (text: string) => void;
  disabled?: boolean;
}

export function AiSuggestionButton({
  conversationId,
  onSuggestion,
  disabled,
}: AiSuggestionButtonProps) {
  const { mutate, isPending } = useAiSuggestionMutation();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    mutate(conversationId, {
      onSuccess: (data) => onSuggestion(data.suggestion),
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
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleClick}
        disabled={disabled || isPending}
        aria-label="Sugerir resposta com IA"
        aria-busy={isPending}
        title="Sugerir resposta com IA"
        className="h-10 rounded-full border border-accent/30 bg-accent/[0.06] px-2.5 text-accent hover:border-accent/55 hover:bg-accent/15 hover:text-accent disabled:opacity-50"
      >
        {isPending ? <SpinnerIcon /> : <SparkleIcon />}
        <span className="hidden text-xs xl:inline">Sugerir IA</span>
      </Button>
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="14"
      height="14"
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

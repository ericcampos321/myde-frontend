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
        <p className="absolute bottom-full mb-1 right-0 text-[10px] text-danger bg-surface border border-border rounded px-2 py-1 whitespace-nowrap" role="alert">
          {error}
        </p>
      )}
      <Button
        type="button"
        variant="ghost"
        size="md"
        onClick={handleClick}
        loading={isPending}
        disabled={disabled}
        aria-label="Sugerir resposta com IA"
        title="Sugerir resposta com IA"
        className="text-text-muted hover:text-accent border border-border"
      >
        {!isPending && <SparkleIcon />}
        <span className="hidden sm:inline text-xs">Sugerir IA</span>
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

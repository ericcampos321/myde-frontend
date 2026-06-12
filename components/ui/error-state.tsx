import { cn } from "@/utils/cn";
import { ReactNode } from "react";

interface ErrorStateProps {
  message?: string;
  retry?: () => void;
  className?: string;
}

export function ErrorState({ message, retry, className }: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-12 px-6 text-center",
        className
      )}
      role="alert"
    >
      <ErrorIcon />
      <p className="text-sm font-medium text-text">Algo deu errado</p>
      {message && (
        <p className="text-xs text-text-muted max-w-[240px]">{message}</p>
      )}
      {retry && (
        <button
          onClick={retry}
          className="mt-1 text-xs text-accent hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}

function ErrorIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      className="text-danger opacity-60"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
    </svg>
  ) as ReactNode;
}

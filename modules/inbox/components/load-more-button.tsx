"use client";

interface LoadMoreButtonProps {
  hasMore: boolean;
  isFetching: boolean;
  onLoadMore: () => void;
}

/**
 * Botão discreto no topo do histórico (estilo WhatsApp).
 * - `hasMore=false` → não renderiza nada.
 * - `isFetching` → spinner discreto.
 */
export function LoadMoreButton({
  hasMore,
  isFetching,
  onLoadMore,
}: LoadMoreButtonProps) {
  if (!hasMore && !isFetching) return null;

  return (
    <div className="flex justify-center py-2">
      <button
        type="button"
        onClick={onLoadMore}
        disabled={isFetching}
        className="flex cursor-pointer items-center gap-2 rounded-full bg-black/30 px-3 py-1 text-[12px] text-text-muted backdrop-blur-sm transition-colors hover:bg-black/40 hover:text-text disabled:cursor-default"
      >
        {isFetching ? (
          <>
            <Spinner />
            Carregando…
          </>
        ) : (
          "Carregar mensagens anteriores"
        )}
      </button>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" />
      <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

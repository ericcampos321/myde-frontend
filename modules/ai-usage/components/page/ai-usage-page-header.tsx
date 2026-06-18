import Link from "next/link";
import { cn } from "@/utils/cn";
import { BackArrowIcon } from "@/modules/ai-usage/components/shared/ai-usage-icons";

export function AiUsagePageHeader() {
  return (
    <header className="flex flex-col gap-2">
      <Link
        href="/"
        aria-label="Voltar para o inbox"
        className={cn(
          "inline-flex h-10 w-fit items-center gap-2 rounded-full border border-border bg-surface-raised/60 px-3.5 text-[13px] font-medium text-text-muted",
          "transition hover:bg-surface-active hover:text-text active:scale-[0.98]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        )}
      >
        <BackArrowIcon />
        <span className="sm:hidden">Inbox</span>
        <span className="hidden sm:inline">Voltar para o inbox</span>
      </Link>
      <h1 className="text-[22px] font-semibold text-text">Uso da IA</h1>
      <p className="text-[13px] text-text-muted">
        Acompanhamento de chamadas, tokens, bloqueios de guardrail e custo estimado da LLM. Somente leitura — não há prompt, mensagem
        ou token de API. O custo é aproximado, baseado no preço configurado por modelo.
      </p>
    </header>
  );
}

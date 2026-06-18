"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Item do rail de navegação principal. Cada item navega por rota (`href`) ou
 * alterna uma seção no inbox (`onClick`). O `active` é explícito (decidido por
 * quem renderiza) para manter o comportamento previsível entre páginas.
 */
export interface AppRailItem {
  id: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
  href?: string;
  onClick?: () => void;
  badgeCount?: number;
}

/**
 * Rail vertical de navegação (estilo WhatsApp Web). Compartilhado entre o inbox
 * e o painel de Uso da IA para que o item ativo seja consistente entre rotas.
 * Visível apenas em telas >= sm, seguindo o padrão atual do app.
 */
export function AppRail({
  items,
  ariaLabel = "Navegação principal",
}: {
  items: AppRailItem[];
  ariaLabel?: string;
}) {
  return (
    <nav
      className="hidden h-full w-12 min-w-14 shrink-0 flex-col items-center border-r border-border bg-sidebar-rail shadow-[1px_0_0_0_var(--divider-strong)] py-0 sm:flex"
      aria-label={ariaLabel}
    >
      <div className="flex w-full flex-1 flex-col items-center">
        {items.map((item) => (
          <RailItem key={item.id} {...item} />
        ))}
      </div>

      <div className="mt-auto flex flex-col items-center pb-1">
        <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-surface-active text-[13px] font-semibold text-text">
          M
        </span>
      </div>
    </nav>
  );
}

function RailItem({
  label,
  icon,
  active = false,
  href,
  onClick,
  badgeCount = 0,
}: AppRailItem) {
  const className = [
    "relative flex h-12 w-14 cursor-pointer items-center justify-center transition-colors duration-150",
    active ? "text-text" : "text-text-muted hover:text-text",
  ].join(" ");

  const inner = (
    <>
      {badgeCount > 0 && (
        <span className="absolute right-[7px] top-[5px] inline-flex h-[8px] w-[8px] items-center justify-center rounded-full bg-accent text-[0px] leading-none text-transparent">
          {badgeCount > 99 ? "99+" : badgeCount}
        </span>
      )}
      <span
        className={[
          "flex h-[34px] w-[34px] items-center justify-center rounded-full transition-colors duration-150",
          active ? "bg-white/10 text-text" : "bg-transparent text-inherit hover:bg-white/8",
        ].join(" ")}
      >
        {icon}
      </span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-label={label}
        aria-current={active ? "page" : undefined}
        className={className}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={className}
    >
      {inner}
    </button>
  );
}

export function ChatIcon() {
  return (
    <IconBase size={22}>
      <path
        d="M20 15a3 3 0 0 1-3 3H8l-4 3v-6a3 3 0 0 1-1-2V7a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

export function ContactsIcon() {
  return (
    <IconBase size={22}>
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M3.5 19c.4-4 2.2-6 5.5-6s5.1 2 5.5 6M16 5.5a3 3 0 0 1 0 5.8M17 13c2.2.6 3.4 2.5 3.5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </IconBase>
  );
}

/** Ícone do painel de Uso da IA — barras de métrica/atividade. */
export function AiUsageIcon() {
  return (
    <IconBase size={22}>
      <path
        d="M4 19V5M20 19H4M8 19v-5M12 19v-9M16 19v-7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

function IconBase({ children, size = 19 }: { children: ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      {children}
    </svg>
  );
}

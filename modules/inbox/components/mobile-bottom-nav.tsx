"use client";

import Link from "next/link";
import { AiUsageIcon, ChatIcon, ContactsIcon } from "@/components/shared/app-rail";
import { cn } from "@/utils/cn";

interface MobileBottomNavProps {
  activeSection: "conversations" | "contacts";
  onSectionChange: (section: "conversations" | "contacts") => void;
}

const baseItemClassName =
  "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition-colors";

export function MobileBottomNav({
  activeSection,
  onSectionChange,
}: MobileBottomNavProps) {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-sidebar/95 px-3 pb-[calc(env(safe-area-inset-bottom,0px)+10px)] pt-2 backdrop-blur-md sm:hidden"
    >
      <div className="mx-auto flex max-w-screen-sm items-center gap-1">
        <button
          type="button"
          aria-label="Conversas"
          aria-pressed={activeSection === "conversations"}
          onClick={() => onSectionChange("conversations")}
          className={cn(
            baseItemClassName,
            activeSection === "conversations"
              ? "bg-accent/12 text-accent"
              : "text-text-muted hover:bg-surface-raised hover:text-text"
          )}
        >
          <ChatIcon />
          <span>Conversas</span>
        </button>

        <button
          type="button"
          aria-label="Contatos"
          aria-pressed={activeSection === "contacts"}
          onClick={() => onSectionChange("contacts")}
          className={cn(
            baseItemClassName,
            activeSection === "contacts"
              ? "bg-accent/12 text-accent"
              : "text-text-muted hover:bg-surface-raised hover:text-text"
          )}
        >
          <ContactsIcon />
          <span>Contatos</span>
        </button>

        <Link
          href="/ai-usage"
          aria-label="Uso da IA"
          className={cn(
            baseItemClassName,
            "text-text-muted hover:bg-surface-raised hover:text-text"
          )}
        >
          <AiUsageIcon />
          <span>Uso da IA</span>
        </Link>
      </div>
    </nav>
  );
}

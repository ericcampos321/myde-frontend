"use client";

import { ReactNode } from "react";

interface AppShellProps {
  header: ReactNode;
  sidebar: ReactNode;
  main: ReactNode;
  showMain?: boolean;
}

export function AppShell({ header, sidebar, main, showMain = true }: AppShellProps) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg">
      <header className="z-10 flex h-13 shrink-0 items-center border-b border-border/70 bg-surface px-4">
        {header}
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — sempre visível no desktop, oculta no mobile quando há conversa ativa */}
        <aside
          className={[
            "flex w-full shrink-0 flex-col overflow-hidden border-r border-border/60 bg-surface sm:w-[420px] md:w-[440px] xl:w-[456px]",
            showMain ? "hidden sm:flex" : "flex",
          ].join(" ")}
        >
          {sidebar}
        </aside>

        {/* Painel de chat — oculto no mobile quando nenhuma conversa selecionada */}
        <main
          className={[
            "flex-1 flex flex-col overflow-hidden",
            showMain ? "flex" : "hidden sm:flex",
          ].join(" ")}
        >
          {main}
        </main>
      </div>
    </div>
  );
}

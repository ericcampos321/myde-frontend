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
      <header className="shrink-0 h-14 flex items-center px-4 border-b border-border bg-surface z-10">
        {header}
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — sempre visível no desktop, oculta no mobile quando há conversa ativa */}
        <aside
          className={[
            "flex flex-col shrink-0 w-full sm:w-72 md:w-80 border-r border-border bg-surface overflow-hidden",
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

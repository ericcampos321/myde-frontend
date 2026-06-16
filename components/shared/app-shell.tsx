"use client";

import { ReactNode } from "react";

interface AppShellProps {
  sidebar: ReactNode;
  main: ReactNode;
  showMain?: boolean;
}

export function AppShell({ sidebar, main, showMain = true }: AppShellProps) {
  return (
    <div
      className="flex min-h-0 overflow-hidden bg-bg"
      style={{ height: "var(--app-viewport-height, 100dvh)" }}
    >
      <aside
        className={[
          "flex min-h-0 w-full shrink-0 flex-col overflow-hidden bg-sidebar sm:w-[526px] sm:min-w-[526px]",
          showMain ? "hidden sm:flex" : "flex",
        ].join(" ")}
      >
        {sidebar}
      </aside>

      <main
        className={[
          "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-l border-border shadow-[-1px_0_0_0_var(--divider-strong)]",
          showMain ? "flex" : "hidden sm:flex",
        ].join(" ")}
      >
        {main}
      </main>
    </div>
  );
}

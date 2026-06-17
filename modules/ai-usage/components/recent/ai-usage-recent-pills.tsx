import { cn } from "@/utils/cn";
import type { AiUsageRecentItem } from "@/modules/ai-usage/types/ai-usage.types";

export function RiskPill({ level }: { level: AiUsageRecentItem["riskLevel"] }) {
  const styles: Record<AiUsageRecentItem["riskLevel"], string> = {
    low: "bg-accent/15 text-accent",
    medium: "bg-yellow-500/15 text-yellow-400",
    high: "bg-danger/15 text-danger",
  };
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${styles[level]}`}>{level}</span>;
}

export function BlockedPill({ blocked }: { blocked: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[11px] font-medium",
        blocked ? "bg-danger/15 text-danger" : "bg-surface-active text-text-muted"
      )}
    >
      {blocked ? "bloqueado" : "não bloqueado"}
    </span>
  );
}

export function MetaPill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-surface-active px-2 py-0.5 text-[11px] font-medium text-text-muted">{children}</span>;
}

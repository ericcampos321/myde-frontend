import {
  AI_USAGE_PERIODS,
  type AiUsagePeriodId,
} from "@/modules/ai-usage/utils/period/ai-usage-period";

export function AiUsagePeriodTabs({
  period,
  onChange,
  isRefreshing,
}: {
  period: AiUsagePeriodId;
  onChange: (period: AiUsagePeriodId) => void;
  isRefreshing: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {AI_USAGE_PERIODS.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onChange(p.id)}
          aria-pressed={period === p.id}
          className={[
            "cursor-pointer rounded-full border px-3 py-1 text-[13px] transition-colors",
            period === p.id
              ? "border-accent bg-accent/15 text-accent"
              : "border-border text-text-muted hover:bg-surface-active hover:text-text",
          ].join(" ")}
        >
          {p.label}
        </button>
      ))}
      {isRefreshing && <span className="text-[12px] text-text-muted">atualizando…</span>}
    </div>
  );
}

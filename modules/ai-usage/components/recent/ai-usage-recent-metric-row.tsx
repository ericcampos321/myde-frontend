export function AiUsageRecentMetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-surface-active/45 px-2.5 py-2">
      <span className="text-text-muted">{label}</span>
      <span className="font-medium tabular-nums text-text">{value}</span>
    </div>
  );
}

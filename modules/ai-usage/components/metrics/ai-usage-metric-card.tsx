import { Card } from "@/components/ui/card";

export function AiUsageMetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="flex min-w-0 flex-col gap-1 p-3 sm:p-4">
      <span className="text-[11px] text-text-muted sm:text-[12px]">{label}</span>
      <span className="truncate text-[17px] font-semibold tabular-nums text-text sm:text-[20px]">{value}</span>
    </Card>
  );
}

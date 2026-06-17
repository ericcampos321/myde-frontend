import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export function AiUsageRecentEmpty() {
  return (
    <Card className="p-6">
      <EmptyState title="Sem interações recentes" description="As últimas interações de IA aparecem aqui." />
    </Card>
  );
}

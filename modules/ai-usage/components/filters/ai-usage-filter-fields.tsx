import { Select } from "@/components/ui/select";
import type { AiUsageFilters } from "@/modules/ai-usage/types/ai-usage.types";

export function AiUsageFilterFields({
  filters,
  onChange,
  className,
}: {
  filters: AiUsageFilters;
  onChange: (key: keyof AiUsageFilters, value: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <FilterInput label="Modelo" value={filters.model} placeholder="gpt-5.4" onChange={(value) => onChange("model", value)} />
      <FilterInput
        label="Conversa"
        value={filters.conversationId}
        placeholder="ID da conversa"
        onChange={(value) => onChange("conversationId", value)}
      />
      <FilterSelect
        label="Origem"
        value={filters.source}
        onChange={(value) => onChange("source", value)}
        options={[
          { value: "", label: "Todas" },
          { value: "openai", label: "OpenAI" },
        ]}
      />
      <FilterSelect
        label="Risco"
        value={filters.riskLevel}
        onChange={(value) => onChange("riskLevel", value)}
        options={[
          { value: "", label: "Todos" },
          { value: "low", label: "Baixo" },
          { value: "medium", label: "Médio" },
          { value: "high", label: "Alto" },
        ]}
      />
      <FilterSelect
        label="Bloqueado"
        value={filters.blocked}
        onChange={(value) => onChange("blocked", value)}
        options={[
          { value: "", label: "Todos" },
          { value: "true", label: "Sim" },
          { value: "false", label: "Não" },
        ]}
      />
      <FilterSelect
        label="Fluxo"
        value={filters.stage}
        onChange={(value) => onChange("stage", value)}
        options={[
          { value: "", label: "Todos" },
          { value: "input", label: "Entrada" },
          { value: "output", label: "Saída" },
          { value: "recurring", label: "Recorrência" },
          { value: "auto_reply", label: "Auto-reply" },
        ]}
      />
    </div>
  );
}

function FilterInput({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-[12px] text-text-muted">
      {label}
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-border bg-surface px-3 py-2 text-[13px] text-text outline-none transition-colors placeholder:text-text-muted/70 focus:border-accent"
      />
    </label>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
}) {
  return <Select label={label} value={value} onValueChange={onChange} options={options} />;
}

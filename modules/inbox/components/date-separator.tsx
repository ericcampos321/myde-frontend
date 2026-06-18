interface DateSeparatorProps {
  label: string;
}

/** Separador de dia centralizado (pílula translúcida), estilo WhatsApp. */
export function DateSeparator({ label }: DateSeparatorProps) {
  if (!label) return null;

  return (
    <div className="flex justify-center py-2">
      <span className="rounded-md bg-black/30 px-2.5 py-1 text-[12px] font-medium uppercase tracking-wide text-text-muted backdrop-blur-sm">
        {label}
      </span>
    </div>
  );
}
import type { Message } from "@/modules/inbox/types/inbox.types";
import { formatDayLabel } from "./format-message-time";

export interface MessageDayGroup {
  /** Chave estável do dia local (`YYYY-MM-DD`) ou `"unknown"` se sem data. */
  dayKey: string;
  /** Rótulo exibível ("Hoje"/"Ontem"/dia-da-semana/`dd/mm/aaaa`); "" se sem data. */
  label: string;
  messages: Message[];
}

/** Chave de dia local `YYYY-MM-DD` a partir do ISO; `"unknown"` se inválido/null. */
function dayKeyOf(iso: string | null): string {
  if (!iso) return "unknown";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "unknown";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Agrupa mensagens (já em ordem ASC) por dia de calendário local, preservando a
 * ordem. Mensagens consecutivas do mesmo dia ficam no mesmo grupo.
 */
export function groupMessagesByDay(
  messages: Message[],
  now: Date = new Date()
): MessageDayGroup[] {
  const groups: MessageDayGroup[] = [];

  for (const message of messages) {
    const dayKey = dayKeyOf(message.createdAt);
    const last = groups[groups.length - 1];

    if (last && last.dayKey === dayKey) {
      last.messages.push(message);
    } else {
      groups.push({
        dayKey,
        label: formatDayLabel(message.createdAt, now),
        messages: [message],
      });
    }
  }

  return groups;
}
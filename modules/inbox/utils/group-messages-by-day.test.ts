import { describe, expect, it } from "vitest";
import { groupMessagesByDay } from "@/modules/inbox/utils/group-messages-by-day";
import type { Message } from "@/modules/inbox/types/inbox.types";

function msg(id: string, createdAt: string | null): Message {
  return { id, direction: "in", body: id, status: "sent", createdAt };
}

// `now` fixo (horário LOCAL) para rótulos determinísticos.
const now = new Date("2026-06-14T12:00:00");

describe("groupMessagesByDay", () => {
  it("agrupa mensagens do mesmo dia em um único grupo, preservando a ordem", () => {
    const messages = [
      msg("a", "2026-06-14T08:00:00"),
      msg("b", "2026-06-14T09:30:00"),
      msg("c", "2026-06-14T10:00:00"),
    ];
    const groups = groupMessagesByDay(messages, now);

    expect(groups).toHaveLength(1);
    expect(groups[0]!.dayKey).toBe("2026-06-14");
    expect(groups[0]!.label).toBe("Hoje");
    expect(groups[0]!.messages.map((m) => m.id)).toEqual(["a", "b", "c"]);
  });

  it("separa dias diferentes na ordem cronológica (Ontem, Hoje)", () => {
    const messages = [
      msg("a", "2026-06-13T22:00:00"),
      msg("b", "2026-06-14T08:00:00"),
      msg("c", "2026-06-14T09:00:00"),
    ];
    const groups = groupMessagesByDay(messages, now);

    expect(groups.map((g) => g.label)).toEqual(["Ontem", "Hoje"]);
    expect(groups.map((g) => g.dayKey)).toEqual(["2026-06-13", "2026-06-14"]);
    expect(groups[1]!.messages.map((m) => m.id)).toEqual(["b", "c"]);
  });

  it("createdAt null/inválido → grupo 'unknown' com label vazio", () => {
    const groups = groupMessagesByDay([msg("a", null), msg("b", "lixo")], now);
    expect(groups).toHaveLength(1);
    expect(groups[0]!.dayKey).toBe("unknown");
    expect(groups[0]!.label).toBe("");
  });

  it("lista vazia → []", () => {
    expect(groupMessagesByDay([], now)).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import { formatDayLabel } from "@/modules/inbox/utils/format-message-time";

const now = new Date("2026-06-14T12:00:00"); // sábado, horário local

describe("formatDayLabel", () => {
  it("hoje → 'Hoje'", () => {
    expect(formatDayLabel("2026-06-14T08:00:00", now)).toBe("Hoje");
  });

  it("ontem → 'Ontem'", () => {
    expect(formatDayLabel("2026-06-13T23:30:00", now)).toBe("Ontem");
  });

  it("até 6 dias atrás → dia da semana", () => {
    const iso = "2026-06-11T10:00:00";
    expect(formatDayLabel(iso, now)).toBe(
      new Date(iso).toLocaleDateString("pt-BR", { weekday: "long" })
    );
  });

  it("7+ dias atrás → dd/mm/aaaa", () => {
    expect(formatDayLabel("2026-06-04T10:00:00", now)).toBe("04/06/2026");
  });

  it("null/inválido → ''", () => {
    expect(formatDayLabel(null, now)).toBe("");
    expect(formatDayLabel("lixo", now)).toBe("");
  });
});

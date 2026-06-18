import { describe, expect, it } from "vitest";
import { highlightSearchTerm } from "@/modules/inbox/utils/highlight-search-term";

describe("highlightSearchTerm", () => {
  it('destaca "er" em "Eric" (case-insensitive, preserva o caso)', () => {
    expect(highlightSearchTerm("Eric", "er")).toEqual([
      { text: "Er", match: true },
      { text: "ic", match: false },
    ]);
  });

  it("destaca múltiplas ocorrências", () => {
    expect(highlightSearchTerm("er er", "er")).toEqual([
      { text: "er", match: true },
      { text: " ", match: false },
      { text: "er", match: true },
    ]);
  });

  it("termo no meio: parte antes, match, parte depois", () => {
    expect(highlightSearchTerm("Suave Eric tudo", "eric")).toEqual([
      { text: "Suave ", match: false },
      { text: "Eric", match: true },
      { text: " tudo", match: false },
    ]);
  });

  it("sem match → uma parte não destacada", () => {
    expect(highlightSearchTerm("Olá mundo", "xyz")).toEqual([
      { text: "Olá mundo", match: false },
    ]);
  });

  it("termo vazio/whitespace → uma parte não destacada", () => {
    expect(highlightSearchTerm("texto", "")).toEqual([
      { text: "texto", match: false },
    ]);
    expect(highlightSearchTerm("texto", "   ")).toEqual([
      { text: "texto", match: false },
    ]);
  });

  it("não retorna HTML — partes são texto puro reconstruindo o original", () => {
    const parts = highlightSearchTerm("a<b>c", "b");
    // Cada parte é { text, match } — strings cruas; o '<b>' fica literal no texto.
    expect(parts.every((p) => typeof p.text === "string" && typeof p.match === "boolean")).toBe(true);
    expect(parts.map((p) => p.text).join("")).toBe("a<b>c");
  });

  it("trata caracteres especiais de regex como literais (sem regex)", () => {
    // '.' não deve casar com qualquer char — só com '.' literal.
    expect(highlightSearchTerm("a.b axb", ".")).toEqual([
      { text: "a", match: false },
      { text: ".", match: true },
      { text: "b axb", match: false },
    ]);
  });
});

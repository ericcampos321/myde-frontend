import { describe, expect, it } from "vitest";
import {
  formatCostUsd,
  formatDurationMs,
  formatInteger,
  formatTokens,
} from "@/modules/ai-usage/utils/ai-usage-format";

describe("formatTokens / formatInteger", () => {
  it("formata inteiros e trata null como —", () => {
    expect(formatTokens(0)).toBe("0");
    expect(formatTokens(1234)).toBe("1.234"); // pt-BR usa ponto de milhar
    expect(formatTokens(null)).toBe("—");
    expect(formatInteger(undefined)).toBe("—");
  });
});

describe("formatCostUsd", () => {
  it("custo pequeno sem zeros à direita", () => {
    expect(formatCostUsd(0.00075)).toBe("US$ 0.00075");
    expect(formatCostUsd(0.007593)).toBe("US$ 0.007593");
    expect(formatCostUsd(0)).toBe("US$ 0");
  });
  it("custo acima de um centavo usa até 4 casas", () => {
    expect(formatCostUsd(0.123456)).toBe("US$ 0.1235");
    expect(formatCostUsd(12.3)).toBe("US$ 12.3");
  });
  it("null → — (modelo sem preço)", () => {
    expect(formatCostUsd(null)).toBe("—");
  });
});

describe("formatDurationMs", () => {
  it("ms abaixo de 1s; segundos acima", () => {
    expect(formatDurationMs(950)).toBe("950 ms");
    expect(formatDurationMs(1200)).toBe("1.2 s");
    expect(formatDurationMs(null)).toBe("—");
  });
});

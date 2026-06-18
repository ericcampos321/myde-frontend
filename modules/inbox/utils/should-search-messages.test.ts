import { describe, expect, it } from "vitest";
import { shouldSearchMessages } from "@/modules/inbox/utils/should-search-messages";

describe("shouldSearchMessages", () => {
  it("false com 0/1 caractere (após trim)", () => {
    expect(shouldSearchMessages("")).toBe(false);
    expect(shouldSearchMessages(" ")).toBe(false);
    expect(shouldSearchMessages("a")).toBe(false);
    expect(shouldSearchMessages(" a ")).toBe(false);
  });

  it("true com 2+ caracteres", () => {
    expect(shouldSearchMessages("er")).toBe(true);
    expect(shouldSearchMessages("  eric  ")).toBe(true);
  });
});

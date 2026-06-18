import { describe, expect, it, vi } from "vitest";
import {
  FALLBACK_AVATARS,
  getContactAvatarUrl,
  getFallbackAvatarUrl,
  getStableAvatarIndex,
} from "./avatar-fallback";

describe("avatar fallback", () => {
  it("retorna sempre o mesmo avatar para a mesma seed", () => {
    expect(getFallbackAvatarUrl("5511999999999")).toBe(
      getFallbackAvatarUrl("5511999999999")
    );
  });

  it("seeds diferentes podem retornar avatares diferentes", () => {
    const urls = new Set(["contato-1", "contato-2", "contato-3"].map(getFallbackAvatarUrl));
    expect(urls.size).toBeGreaterThan(1);
  });

  it("sempre retorna um asset permitido", () => {
    expect(FALLBACK_AVATARS).toContain(getFallbackAvatarUrl("qualquer"));
  });

  it("seed vazia ou nula usa default", () => {
    expect(getFallbackAvatarUrl("")).toBe(getFallbackAvatarUrl("default"));
    expect(getFallbackAvatarUrl(null)).toBe(getFallbackAvatarUrl("default"));
  });

  it("prefere avatarUrl informado", () => {
    expect(
      getContactAvatarUrl({
        avatarUrl: "https://example.com/avatar.png",
        phone: "5511999999999",
      })
    ).toBe("https://example.com/avatar.png");
  });

  it("usa phone antes de id e name", () => {
    expect(
      getContactAvatarUrl({ phone: "phone", id: "id", name: "name" })
    ).toBe(getFallbackAvatarUrl("phone"));
  });

  it("não usa Math.random", () => {
    const random = vi.spyOn(Math, "random");
    getStableAvatarIndex("contato");
    expect(random).not.toHaveBeenCalled();
    random.mockRestore();
  });
});

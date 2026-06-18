import { describe, expect, it } from "vitest";
import {
  AI_USAGE_PERIODS,
  resolvePeriodRange,
} from "@/modules/ai-usage/utils/period/ai-usage-period";

const now = new Date("2026-06-14T12:00:00.000Z");
const DAY = 24 * 60 * 60 * 1000;

describe("resolvePeriodRange", () => {
  it("to = agora; from = agora - N dias", () => {
    const { from, to } = resolvePeriodRange("7d", now);
    expect(to).toBe(now.toISOString());
    expect(new Date(to).getTime() - new Date(from).getTime()).toBe(7 * DAY);
  });

  it("24h e 30d respeitam os dias do preset", () => {
    expect(
      new Date(resolvePeriodRange("24h", now).to).getTime() -
        new Date(resolvePeriodRange("24h", now).from).getTime()
    ).toBe(1 * DAY);
    expect(
      new Date(resolvePeriodRange("30d", now).to).getTime() -
        new Date(resolvePeriodRange("30d", now).from).getTime()
    ).toBe(30 * DAY);
  });

  it("presets têm ids únicos", () => {
    const ids = AI_USAGE_PERIODS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

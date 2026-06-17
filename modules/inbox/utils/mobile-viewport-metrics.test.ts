import { describe, expect, it } from "vitest";
import { resolveMobileViewportMetrics } from "./mobile-viewport-metrics";

describe("resolveMobileViewportMetrics", () => {
  it("uses viewport height as the visible app height", () => {
    expect(
      resolveMobileViewportMetrics({
        fallbackHeight: 844,
        viewportHeight: 512,
        viewportOffsetTop: 0,
      })
    ).toEqual({
      appViewportHeight: 512,
      keyboardOffset: 332,
    });
  });

  it("discounts visual viewport offset when present", () => {
    expect(
      resolveMobileViewportMetrics({
        fallbackHeight: 844,
        viewportHeight: 540,
        viewportOffsetTop: 24,
      })
    ).toEqual({
      appViewportHeight: 540,
      keyboardOffset: 280,
    });
  });

  it("falls back safely when viewport data is invalid", () => {
    expect(
      resolveMobileViewportMetrics({
        fallbackHeight: 780,
        viewportHeight: Number.NaN,
        viewportOffsetTop: Number.NaN,
      })
    ).toEqual({
      appViewportHeight: 780,
      keyboardOffset: 0,
    });
  });

  it("can prefer the layout viewport when Android visualViewport is too short", () => {
    expect(
      resolveMobileViewportMetrics({
        fallbackHeight: 640,
        viewportHeight: 320,
        viewportOffsetTop: 0,
        preferLayoutViewport: true,
      })
    ).toEqual({
      appViewportHeight: 640,
      keyboardOffset: 320,
    });
  });
});

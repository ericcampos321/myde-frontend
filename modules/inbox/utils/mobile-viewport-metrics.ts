export interface MobileViewportMetricsInput {
  viewportHeight: number;
  viewportOffsetTop?: number;
  fallbackHeight: number;
  preferLayoutViewport?: boolean;
}

export interface MobileViewportMetrics {
  appViewportHeight: number;
  keyboardOffset: number;
}

export function resolveMobileViewportMetrics(
  input: MobileViewportMetricsInput
): MobileViewportMetrics {
  const fallbackHeight = Number.isFinite(input.fallbackHeight)
    ? Math.max(0, Math.round(input.fallbackHeight))
    : 0;
  const viewportHeight = Number.isFinite(input.viewportHeight)
    ? Math.max(0, Math.round(input.viewportHeight))
    : fallbackHeight;
  const viewportOffsetTop = Number.isFinite(input.viewportOffsetTop)
    ? Math.max(0, Math.round(input.viewportOffsetTop ?? 0))
    : 0;
  const layoutViewportHeight = Math.max(fallbackHeight - viewportOffsetTop, 0);

  return {
    appViewportHeight: input.preferLayoutViewport
      ? Math.max(viewportHeight, layoutViewportHeight)
      : viewportHeight,
    keyboardOffset: Math.max(
      fallbackHeight - viewportHeight - viewportOffsetTop,
      0
    ),
  };
}

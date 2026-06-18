"use client";

import { useEffect, useState } from "react";
import { resolveMobileViewportMetrics } from "@/modules/inbox/utils/mobile-viewport-metrics";

const APP_VIEWPORT_HEIGHT_VAR = "--app-viewport-height";
const KEYBOARD_OFFSET_VAR = "--keyboard-offset";

export function useMobileKeyboardViewport() {
  const [viewportSignal, setViewportSignal] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let lastHeight = -1;
    let lastOffset = -1;
    const preferLayoutViewport = /Android/i.test(window.navigator.userAgent);

    const applyViewportMetrics = () => {
      const fallbackHeight = window.innerHeight;
      const viewport = window.visualViewport;
      const metrics = resolveMobileViewportMetrics({
        fallbackHeight,
        viewportHeight: viewport?.height ?? fallbackHeight,
        viewportOffsetTop: viewport?.offsetTop ?? 0,
        preferLayoutViewport,
      });

      document.documentElement.style.setProperty(
        APP_VIEWPORT_HEIGHT_VAR,
        `${metrics.appViewportHeight}px`
      );
      document.documentElement.style.setProperty(
        KEYBOARD_OFFSET_VAR,
        `${metrics.keyboardOffset}px`
      );

      if (
        metrics.appViewportHeight !== lastHeight ||
        metrics.keyboardOffset !== lastOffset
      ) {
        lastHeight = metrics.appViewportHeight;
        lastOffset = metrics.keyboardOffset;
        setViewportSignal((current) => current + 1);
      }
    };

    const handleViewportChange = () => {
      window.requestAnimationFrame(applyViewportMetrics);
    };

    applyViewportMetrics();

    window.addEventListener("resize", handleViewportChange);
    window.visualViewport?.addEventListener("resize", handleViewportChange);
    window.visualViewport?.addEventListener("scroll", handleViewportChange);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.visualViewport?.removeEventListener("resize", handleViewportChange);
      window.visualViewport?.removeEventListener("scroll", handleViewportChange);
      document.documentElement.style.removeProperty(APP_VIEWPORT_HEIGHT_VAR);
      document.documentElement.style.removeProperty(KEYBOARD_OFFSET_VAR);
    };
  }, []);

  return { viewportSignal };
}

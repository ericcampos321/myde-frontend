"use client";

import { useEffect, useState } from "react";

/**
 * Breakpoint mobile do inbox — alinhado ao `sm:` do Tailwind (640px) e à mesma
 * media query já usada no composer/chat-panel (`max-width: 639px`).
 */
const MOBILE_MEDIA_QUERY = "(max-width: 639px)";

/**
 * `true` quando a viewport está no breakpoint mobile do inbox. Reativo: acompanha
 * mudanças de tamanho/orientação via `matchMedia`. SSR-safe: começa `false` e
 * sincroniza no mount (evita divergência de hidratação).
 */
export function useIsMobileViewport(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
    const update = () => setIsMobile(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return isMobile;
}

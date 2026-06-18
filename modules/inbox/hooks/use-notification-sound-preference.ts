"use client";

import { useCallback, useState } from "react";

const STORAGE_KEY = "myde:inbox:notification-sound-muted";

export function useNotificationSoundPreference() {
  const [muted, setMuted] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const toggleMuted = useCallback(() => {
    setMuted((current) => {
      const next = !current;
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(STORAGE_KEY, String(next));
        } catch {
          // A preferência continua válida na sessão mesmo sem persistência.
        }
      }
      return next;
    });
  }, []);

  return { muted, toggleMuted };
}

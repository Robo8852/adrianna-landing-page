"use client";

import { useSyncExternalStore } from "react";

/**
 * SSR-safe media query. Returns false on the server and during the first
 * client render, then the real match after hydration — no effect, no
 * hydration-mismatch error (useSyncExternalStore handles the handoff).
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

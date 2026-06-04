"use client";

import { useEffect, useState } from "react";

/**
 * Returns true once the reader has scrolled past `fraction` of the page
 * (0.5 = halfway). Latches: once reached it stays true. Mirrors the Kit
 * modal's `trigger: scroll @ 50%`.
 */
export function useScrollDepth(fraction = 0.5): boolean {
  const [reached, setReached] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (reached) return;

    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      // Pages too short to scroll never reach a depth trigger.
      if (scrollable <= 0) return;
      const depth = window.scrollY / scrollable;
      // Require an actual scroll (scrollY > 0) so fraction=0 fires on the
      // reader's first scroll, not on page load while still at the top.
      if (window.scrollY > 0 && depth >= fraction) setReached(true);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [fraction, reached]);

  return reached;
}

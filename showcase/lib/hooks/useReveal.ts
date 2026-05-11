"use client";

import { useEffect, useRef, useState } from "react";

export interface UseRevealOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export interface UseRevealReturn<T extends HTMLElement> {
  ref: React.RefObject<T>;
  revealed: boolean;
}

export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options?: UseRevealOptions,
): UseRevealReturn<T> {
  const { threshold = 0.2, rootMargin = "0px 0px -10% 0px", once = true } =
    options ?? {};

  const ref = useRef<T>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRevealed(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            if (once) {
              observer.disconnect();
            }
          } else if (!once) {
            setRevealed(false);
          }
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, revealed } as UseRevealReturn<T>;
}

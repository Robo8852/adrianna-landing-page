"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getReducedMotion() {
  return window.matchMedia(reducedMotionQuery).matches;
}

function getServerReducedMotion() {
  return false;
}

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
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    getServerReducedMotion,
  );

  useEffect(() => {
    if (reducedMotion) return;

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
  }, [threshold, rootMargin, once, reducedMotion]);

  return { ref, revealed: reducedMotion || revealed } as UseRevealReturn<T>;
}

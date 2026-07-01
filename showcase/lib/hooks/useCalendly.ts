"use client";

// Lazy-loaded Calendly popup widget.
//
// Nothing loads at page load: Calendly's script + CSS are injected only when
// `open()` is first called (e.g. a "Book a call" button click), so the widget
// costs zero page-load performance. The script and stylesheet are appended to
// <head> exactly once and shared across every hook instance via the
// module-level `scriptPromise` (same pattern as useTurnstile's lazy load).
//
// SSR-safe: all document/window access is guarded, and `open()` is a no-op when
// invoked during SSR or before the browser globals exist.

import { useCallback } from "react";

export interface CalendlyPrefill {
  name?: string;
  email?: string;
}

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (options: {
        url: string;
        prefill?: CalendlyPrefill;
      }) => void;
    };
  }
}

const SCRIPT_SRC = "https://assets.calendly.com/assets/external/widget.js";
const CSS_HREF = "https://assets.calendly.com/assets/external/widget.css";

// Module-level so every hook instance shares a single script+css load.
let scriptPromise: Promise<void> | null = null;

function loadCalendly(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve) => {
    // CSS first — injected once, no load gating needed for styling.
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = CSS_HREF;
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export interface UseCalendlyResult {
  /** Lazy-loads the widget if needed, then opens the Calendly popup. */
  open: (url: string, prefill?: CalendlyPrefill) => void;
}

export function useCalendly(): UseCalendlyResult {
  const open = useCallback((url: string, prefill?: CalendlyPrefill) => {
    // No-op during SSR or before the browser globals are available.
    if (typeof window === "undefined" || typeof document === "undefined") return;
    void loadCalendly().then(() => {
      window.Calendly?.initPopupWidget({ url, prefill });
    });
  }, []);

  return { open };
}

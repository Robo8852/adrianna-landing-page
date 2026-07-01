"use client";

// Lazy-loaded Cloudflare Turnstile (managed, interaction-only) — P3-10.
//
// Nothing loads at page load: the script is injected only when the user first
// interacts with a form (`arm()`, wired to input focus), so Turnstile costs
// zero page-load performance. The widget renders in interaction-only
// appearance — invisible unless Cloudflare decides a visible challenge is
// needed, in which case it appears in the container the form provides.
//
// Without NEXT_PUBLIC_TURNSTILE_SITE_KEY the hook is a no-op and getToken()
// resolves undefined — the server side fails open symmetrically when
// TURNSTILE_SECRET_KEY is unset.

import { useCallback, useEffect, useRef, type RefObject } from "react";

interface TurnstileApi {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      appearance?: "always" | "execute" | "interaction-only";
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    },
  ) => string | undefined;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
    __onTurnstileLoad?: () => void;
  }
}

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=__onTurnstileLoad&render=explicit";

/** How long getToken() waits for Turnstile before giving up (ms). */
const TOKEN_WAIT_MS = 8000;

// Module-level so multiple form instances share one script load.
let scriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve) => {
    window.__onTurnstileLoad = () => resolve();
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export interface UseTurnstileResult {
  /** Begin loading + rendering the widget. Idempotent; wire to first focus. */
  arm: () => void;
  /**
   * Resolve the current Turnstile token, waiting (bounded) for the challenge
   * to finish if it is still running. Resolves undefined when Turnstile is
   * not configured or did not produce a token in time — the caller submits
   * anyway and the server decides.
   */
  getToken: () => Promise<string | undefined>;
}

export function useTurnstile(
  containerRef: RefObject<HTMLDivElement | null>,
): UseTurnstileResult {
  const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const armedRef = useRef(false);
  const widgetIdRef = useRef<string | undefined>(undefined);
  const tokenRef = useRef<string | undefined>(undefined);
  const waitersRef = useRef<Array<(token: string | undefined) => void>>([]);

  const arm = useCallback(() => {
    if (!sitekey || armedRef.current) return;
    armedRef.current = true;
    void loadTurnstileScript().then(() => {
      const container = containerRef.current;
      if (!window.turnstile || !container || widgetIdRef.current !== undefined) return;
      widgetIdRef.current = window.turnstile.render(container, {
        sitekey,
        appearance: "interaction-only",
        callback: (token: string) => {
          tokenRef.current = token;
          for (const resolve of waitersRef.current.splice(0)) resolve(token);
        },
        "expired-callback": () => {
          tokenRef.current = undefined;
        },
        "error-callback": () => {
          // Unblock any submit waiting on a token; server decides what to do.
          for (const resolve of waitersRef.current.splice(0)) resolve(undefined);
        },
      });
    });
  }, [sitekey, containerRef]);

  const getToken = useCallback(async (): Promise<string | undefined> => {
    if (!sitekey) return undefined;
    arm(); // in case submit happens without a focus event having fired
    if (tokenRef.current) return tokenRef.current;
    return new Promise<string | undefined>((resolve) => {
      const timer = setTimeout(() => resolve(undefined), TOKEN_WAIT_MS);
      waitersRef.current.push((token) => {
        clearTimeout(timer);
        resolve(token);
      });
    });
  }, [sitekey, arm]);

  // Drop the widget on unmount so a re-mounted form can render a fresh one.
  useEffect(() => {
    return () => {
      if (widgetIdRef.current !== undefined && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // widget already gone — fine
        }
        widgetIdRef.current = undefined;
      }
    };
  }, []);

  return { arm, getToken };
}

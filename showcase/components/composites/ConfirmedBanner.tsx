"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const DISMISS_AFTER_MS = 8000;

const COPY = {
  confirmed: "Sealed. Your name is inscribed — the first letter will find you soon.",
  expired:
    "This seal has lapsed — the ink faded before it was pressed. Inscribe your name below and a fresh letter will find you.",
} as const;

/**
 * Renders the double opt-in landing state after /confirm redirects home with
 * ?confirmed=1 (sealed) or ?confirmed=expired (lapsed seal). The query param
 * is stripped from the URL immediately so a reload or shared link doesn't
 * replay the banner; the banner itself fades out after a few seconds.
 *
 * Must be wrapped in <Suspense> by the caller — useSearchParams suspends
 * during prerendering.
 */
export function ConfirmedBanner() {
  const searchParams = useSearchParams();
  const confirmed = searchParams.get("confirmed");

  // Latch the variant at mount: Next keeps useSearchParams in sync with
  // history.replaceState, so once we strip the param below the live value
  // goes null — without the latch the banner would unmount instantly.
  const [variant] = useState<"confirmed" | "expired" | null>(() =>
    confirmed === "1" ? "confirmed" : confirmed === "expired" ? "expired" : null,
  );

  // Visibility is derived: shown while a variant is present and the dismiss
  // timer hasn't fired. No setState-on-mount needed.
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!variant) return;

    // Strip the param without re-running server components or scrolling.
    const url = new URL(window.location.href);
    url.searchParams.delete("confirmed");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);

    const timer = setTimeout(() => setDismissed(true), DISMISS_AFTER_MS);
    return () => clearTimeout(timer);
  }, [variant]);

  if (!variant || dismissed) return null;

  return (
    <div
      role="status"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        justifyContent: "center",
        padding: "0.85rem 1.25rem",
        backgroundColor: "rgba(12, 10, 8, 0.92)",
        borderBottom:
          variant === "confirmed"
            ? "1px solid var(--gold, #c9a961)"
            : "1px solid rgba(201, 169, 97, 0.45)",
        boxShadow: "0 1px 0 rgba(201,169,97,0.18), 0 8px 24px rgba(0,0,0,0.35)",
        backdropFilter: "blur(4px)",
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-eb-garamond), Georgia, serif",
          fontStyle: "italic",
          fontSize: "1rem",
          letterSpacing: "0.03em",
          color:
            variant === "confirmed"
              ? "var(--gold-warm, #d9be7e)"
              : "var(--parchment, #ece5d8)",
          textAlign: "center",
        }}
      >
        {COPY[variant]}
      </p>
    </div>
  );
}

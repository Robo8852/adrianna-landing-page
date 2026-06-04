"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useScrollDepth } from "@/lib/hooks/useScrollDepth";
import { GoldRule } from "@/components/primitives/GoldRule";
import { NewsletterForm } from "@/components/composites/NewsletterForm";

export interface NewsletterModalProps {
  /** Scroll depth (0–1) that triggers the modal. 0 = fire on first scroll. */
  triggerDepth?: number;
  headline?: string;
  subtext?: string;
}

export function NewsletterModal({
  triggerDepth = 0.5,
  headline = "Does something need to shift?",
  subtext = "Join the newsletter for reflections, practices, and announcements from Adrianna — arriving now and then, never as noise.",
}: NewsletterModalProps = {}) {
  const reached = useScrollDepth(triggerDepth);
  const [dismissed, setDismissed] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  // No frequency cap: open whenever the reader passes the trigger depth,
  // every visit, until they close it this session.
  const open = reached && !dismissed;

  const close = useCallback(() => setDismissed(true), []);

  // Focus management + Esc to close while open.
  useEffect(() => {
    if (!open) return;
    lastFocused.current = document.activeElement as HTMLElement | null;
    panelRef.current?.querySelector<HTMLElement>("input,button")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // lock scroll behind the lightbox

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      lastFocused.current?.focus();
    };
  }, [open, close]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="newsletter-modal-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={close} // backdrop click closes
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
            backgroundColor: "rgba(4,22,20,0.78)",
            backdropFilter: "blur(2px)",
          }}
        >
          <motion.div
            ref={panelRef}
            onClick={(e) => e.stopPropagation()} // clicks inside the panel don't close
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "32rem",
              backgroundColor: "var(--ink-green)",
              border: "1px solid rgba(201,169,97,0.35)",
              boxShadow:
                "0 24px 80px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(201,169,97,0.12)",
              padding: "3rem 2.25rem 2.5rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: "1.25rem",
            }}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              style={{
                position: "absolute",
                top: "0.85rem",
                right: "1rem",
                background: "transparent",
                border: "none",
                color: "var(--gold-warm)",
                fontSize: "1.4rem",
                lineHeight: 1,
                cursor: "pointer",
                opacity: 0.7,
                padding: "0.25rem",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
            >
              ×
            </button>

            <GoldRule width="4rem" animate={false} />

            <h2
              id="newsletter-modal-title"
              style={{
                margin: 0,
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "2.1rem",
                color: "var(--parchment)",
                fontWeight: 400,
                letterSpacing: "0.01em",
                lineHeight: 1.15,
              }}
            >
              {headline}
            </h2>

            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-eb-garamond), Georgia, serif",
                fontSize: "1.02rem",
                lineHeight: 1.65,
                color: "var(--parchment)",
                opacity: 0.85,
                maxWidth: "26rem",
              }}
            >
              {subtext}
            </p>

            <NewsletterForm source="modal" />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

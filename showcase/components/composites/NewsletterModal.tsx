"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useScrollDepth } from "@/lib/hooks/useScrollDepth";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { GoldRule } from "@/components/primitives/GoldRule";
import { NewsletterForm } from "@/components/composites/NewsletterForm";

export interface NewsletterModalProps {
  /** Scroll depth (0–1) that triggers the modal. 0 = fire on first scroll. */
  triggerDepth?: number;
}

const BODY_PARAGRAPHS = [
  "Most people spend their lives trying to solve problems without understanding the forces and frameworks that created them.",
  "Your thoughts, habits, fears, relationships, beliefs, and even your perception of reality are shaped by influences far larger than yourself: family, culture, religion, education, technology, history, theology, symbolism, economics, ideologies, and the stories your society tells about what it means to be human.",
  "We explore the deeper patterns shaping us, as well as the forces contributing to fragmentation, confusion, cultural decay, and the challenges of living in a postmodern age.",
  "Join thousands of readers seeking clarity in an age of confusion, and receive thoughtful essays, reflections, and educational resources that help make sense of the world around you.",
];

export function NewsletterModal({
  triggerDepth = 0.5,
}: NewsletterModalProps = {}) {
  const reached = useScrollDepth(triggerDepth);
  const isWide = useMediaQuery("(min-width: 820px)");
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

  const bodyText = {
    margin: 0,
    fontFamily: "var(--font-eb-garamond), Georgia, serif",
    fontSize: "1rem",
    lineHeight: 1.6,
    color: "var(--parchment)",
    opacity: 0.85,
  } as const;

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
              maxWidth: isWide ? "60rem" : "32rem",
              maxHeight: "90vh",
              overflowY: "auto",
              backgroundColor: "var(--ink-green)",
              border: "1px solid rgba(201,169,97,0.35)",
              boxShadow:
                "0 24px 80px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(201,169,97,0.12)",
              padding: isWide ? "3rem 3rem 2.75rem" : "2.5rem 1.75rem 2rem",
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
                zIndex: 1,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
            >
              ×
            </button>

            <div
              style={{
                display: "flex",
                flexDirection: isWide ? "row" : "column",
                gap: isWide ? "2.5rem" : "1.75rem",
                alignItems: "flex-start",
              }}
            >
              {/* LEFT: copy */}
              <div
                style={{
                  flex: isWide ? "1.15" : undefined,
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <GoldRule width="4rem" animate={false} />
                <h2
                  id="newsletter-modal-title"
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-cormorant), Georgia, serif",
                    fontSize: isWide ? "2.3rem" : "1.9rem",
                    color: "var(--parchment)",
                    fontWeight: 400,
                    letterSpacing: "0.02em",
                    lineHeight: 1.1,
                    textTransform: "uppercase",
                  }}
                >
                  Psychology alone is not enough.
                </h2>
                <p
                  style={{
                    ...bodyText,
                    fontStyle: "italic",
                    fontSize: "1.05rem",
                    opacity: 0.95,
                  }}
                >
                  Neither is politics.
                  <br />
                  Neither is self-help.
                </p>
                {BODY_PARAGRAPHS.map((para, i) => (
                  <p key={i} style={bodyText}>
                    {para}
                  </p>
                ))}
                <p style={{ ...bodyText, opacity: 0.95 }}>
                  Enter your email below to receive essays, reflections, and
                  educational resources delivered directly to your inbox.
                </p>
              </div>

              {/* RIGHT: form (input → button) stacked above the icon */}
              <div
                style={{
                  flex: isWide ? "0.85" : undefined,
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "1.75rem",
                }}
              >
                <NewsletterForm
                  source="modal"
                  buttonLabel="Join the Vespers"
                />
                <Image
                  src="/holy-family.png"
                  alt="Orthodox icon of the Holy Family"
                  width={698}
                  height={1080}
                  sizes="(max-width: 820px) 70vw, 22rem"
                  style={{
                    display: "block",
                    width: isWide ? "min(22rem, 100%)" : "min(16rem, 70vw)",
                    height: "auto",
                    border: "1px solid rgba(201,169,97,0.25)",
                  }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

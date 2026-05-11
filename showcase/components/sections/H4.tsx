"use client";

import { GoldRule } from "@/components/primitives/GoldRule";

export default function H4() {
  return (
    <section
      style={{
        padding: "8rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: "2.5rem",
      }}
    >
      <GoldRule width="6rem" />
      <blockquote
        style={{
          margin: 0,
          fontFamily: "var(--font-eb-garamond), Georgia, serif",
          fontStyle: "italic",
          fontSize: "1.25rem",
          color: "var(--parchment)",
          opacity: 0.8,
          lineHeight: 1.6,
          maxWidth: "32rem",
        }}
      >
        Maybe you are searching among the branches for what only appears in the
        roots.
      </blockquote>
      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "0.7rem",
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "var(--gold-warm)",
        }}
      >
        — Rumi
      </p>
      <GoldRule width="6rem" />
    </section>
  );
}

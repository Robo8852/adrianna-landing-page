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
        <span
          style={{
            color: "var(--gold-warm)",
            fontSize: "1.5rem",
            lineHeight: 0,
            verticalAlign: "-0.2em",
            marginRight: "0.15em",
          }}
        >
          {"“"}
        </span>
        When you see a poor believer, believe that you behold an altar.
        <span
          style={{
            color: "var(--gold-warm)",
            fontSize: "1.5rem",
            lineHeight: 0,
            verticalAlign: "-0.2em",
            marginLeft: "0.15em",
          }}
        >
          {"”"}
        </span>
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
        St. John Chrysostom
      </p>
      <GoldRule width="6rem" />
    </section>
  );
}

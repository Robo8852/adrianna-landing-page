"use client";

import { GoldRule } from "@/components/primitives/GoldRule";
import { NewsletterForm } from "@/features/newsletter";

export default function H8() {
  return (
    <section
      id="newsletter"
      style={{
        padding: "10rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: "2rem",
      }}
    >
      <GoldRule width="6rem" />
      <h2
        style={{
          margin: 0,
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "3rem",
          color: "var(--parchment)",
          fontWeight: 400,
          letterSpacing: "0.01em",
          lineHeight: 1.1,
        }}
      >
        Stay close to the work.
      </h2>
      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-eb-garamond), Georgia, serif",
          fontSize: "1.1rem",
          lineHeight: 1.7,
          color: "var(--parchment)",
          opacity: 0.85,
          maxWidth: "36rem",
        }}
      >
        Join the newsletter for reflections, practices, and announcements from
        Adrianna.
      </p>
      <NewsletterForm source="h8" />
    </section>
  );
}

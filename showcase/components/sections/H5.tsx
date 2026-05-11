"use client";

import Link from "next/link";
import { ArrowGlyph } from "@/components/primitives/ArrowGlyph";

export default function H5() {
  return (
    <section
      style={{
        padding: "5rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: "2rem",
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-eb-garamond), Georgia, serif",
          fontSize: "1.1rem",
          lineHeight: 1.75,
          color: "var(--parchment)",
          opacity: 0.92,
          maxWidth: "36rem",
        }}
      >
        I facilitate and assist beings from all walks of faith in demystifying
        psychospiritual psychology and guiding their journey toward integration
        through neuroscience and embodied awareness.
      </p>
      <Link
        href="/about"
        style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "0.78rem",
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "var(--gold-warm)",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.6rem",
        }}
      >
        Read full bio
        <ArrowGlyph size={12} />
      </Link>
    </section>
  );
}

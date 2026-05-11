"use client";

import Link from "next/link";
import { GoldRule } from "@/components/primitives/GoldRule";
import { ArrowGlyph } from "@/components/primitives/ArrowGlyph";

const linkStyle = {
  fontFamily: "var(--font-cormorant), Georgia, serif",
  fontSize: "0.78rem",
  letterSpacing: "0.28em",
  textTransform: "uppercase" as const,
  color: "var(--gold-warm)",
  textDecoration: "none",
  display: "inline-flex" as const,
  alignItems: "center" as const,
  gap: "0.5rem",
};

export default function A5() {
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
      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-eb-garamond), Georgia, serif",
          fontSize: "1.15rem",
          lineHeight: 1.7,
          color: "var(--parchment)",
          opacity: 0.92,
          maxWidth: "36rem",
        }}
      >
        Continue the conversation — return to Home, book a free intro call, or
        join the newsletter.
      </p>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <Link href="/" style={linkStyle}>
          <ArrowGlyph direction="left" size={12} />
          Return Home
        </Link>
        <span aria-hidden="true" style={{ color: "var(--gold)" }}>
          ·
        </span>
        <Link href="/#services" style={linkStyle}>
          Free Intro Call
        </Link>
        <span aria-hidden="true" style={{ color: "var(--gold)" }}>
          ·
        </span>
        <Link href="/#newsletter" style={linkStyle}>
          Join the Newsletter
        </Link>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { GoldRule } from "@/components/primitives/GoldRule";
import { MottoLine } from "@/components/primitives/MottoLine";
import { NewsletterForm } from "@/components/composites/NewsletterForm";

export function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "var(--ink-green)",
        padding: "5rem 1.5rem 3rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: "2rem",
      }}
    >
      <GoldRule width="6rem" />
      <MottoLine />
      <NewsletterForm compact source="footer" />
      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-eb-garamond), Georgia, serif",
          fontStyle: "italic",
          fontSize: "0.95rem",
          color: "var(--gold-warm)",
        }}
      >
        Prefer to{" "}
        <Link
          href="/#contact"
          style={{
            color: "var(--gold-warm)",
            textDecoration: "underline",
            textUnderlineOffset: "0.2em",
          }}
        >
          write directly
        </Link>
      </p>
      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-eb-garamond), Georgia, serif",
          fontStyle: "italic",
          fontSize: "0.85rem",
          color: "var(--parchment)",
          opacity: 0.55,
        }}
      >
        Ora et labora
      </p>
      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-eb-garamond), Georgia, serif",
          fontSize: "0.75rem",
          color: "var(--parchment)",
          opacity: 0.5,
        }}
      >
        © 2026 Judith Adrianna Naílah · The Altar Within
      </p>
    </footer>
  );
}

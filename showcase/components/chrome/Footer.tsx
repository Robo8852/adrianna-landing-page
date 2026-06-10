"use client";

import Link from "next/link";
import { GoldRule } from "@/components/primitives/GoldRule";
import { MottoLine } from "@/components/primitives/MottoLine";

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
      <figure
        style={{
          margin: 0,
          maxWidth: "26rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.85rem",
        }}
      >
        <blockquote
          style={{
            margin: 0,
            fontFamily: "var(--font-eb-garamond), Georgia, serif",
            fontStyle: "italic",
            fontSize: "1.15rem",
            color: "var(--parchment)",
            lineHeight: 1.55,
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
        <figcaption
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "0.7rem",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "var(--gold-warm)",
          }}
        >
          St. John Chrysostom
        </figcaption>
      </figure>
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

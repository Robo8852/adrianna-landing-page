"use client";

import { GoldRule } from "@/components/primitives/GoldRule";

export interface PullQuoteProps {
  quote: string;
  attribution?: string;
  className?: string;
}

export function PullQuote({ quote, attribution, className }: PullQuoteProps) {
  return (
    <figure
      className={className}
      style={{
        margin: "4rem auto",
        maxWidth: "42rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2rem",
      }}
    >
      <GoldRule width="10rem" />
      <blockquote
        style={{
          margin: 0,
          fontFamily: "var(--font-eb-garamond), Georgia, serif",
          fontStyle: "italic",
          fontSize: "1.5rem",
          color: "var(--parchment)",
          lineHeight: 1.55,
          textAlign: "center",
        }}
      >
        <span
          style={{
            color: "var(--gold-warm)",
            fontSize: "2rem",
            lineHeight: 0,
            verticalAlign: "-0.2em",
            marginRight: "0.15em",
          }}
        >
          {"“"}
        </span>
        {quote}
        <span
          style={{
            color: "var(--gold-warm)",
            fontSize: "2rem",
            lineHeight: 0,
            verticalAlign: "-0.2em",
            marginLeft: "0.15em",
          }}
        >
          {"”"}
        </span>
      </blockquote>
      {attribution ? (
        <figcaption
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "0.78rem",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "var(--gold-warm)",
          }}
        >
          {attribution}
        </figcaption>
      ) : null}
      <GoldRule width="10rem" />
    </figure>
  );
}

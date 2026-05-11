"use client";

import { GoldRule } from "@/components/primitives/GoldRule";
import { MicroSigil, type MicroSigilMotif } from "@/components/primitives/MicroSigil";

export interface PillarPanelProps {
  motif: MicroSigilMotif;
  name: string;
  body: string;
  className?: string;
}

export function PillarPanel({ motif, name, body, className }: PillarPanelProps) {
  return (
    <article
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.5rem",
        textAlign: "center",
        padding: "3rem 1rem",
        maxWidth: "34rem",
        margin: "0 auto",
      }}
    >
      <MicroSigil motif={motif} size={64} />
      <h3
        style={{
          margin: 0,
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "2rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--parchment)",
          fontWeight: 400,
        }}
      >
        {name}
      </h3>
      <GoldRule width="5rem" />
      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-eb-garamond), Georgia, serif",
          fontSize: "1.1rem",
          lineHeight: 1.75,
          color: "var(--parchment)",
          opacity: 0.92,
          textAlign: "left",
        }}
      >
        {body}
      </p>
    </article>
  );
}

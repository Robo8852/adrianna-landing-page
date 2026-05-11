"use client";

import { GoldRule } from "@/components/primitives/GoldRule";
import { MicroSigil, type MicroSigilMotif } from "@/components/primitives/MicroSigil";

export interface PillarCardProps {
  motif: MicroSigilMotif;
  name: string;
  distillation: string;
  className?: string;
}

export function PillarCard({
  motif,
  name,
  distillation,
  className,
}: PillarCardProps) {
  return (
    <article
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.85rem",
        textAlign: "center",
        padding: "2rem 1rem",
      }}
    >
      <MicroSigil motif={motif} size={36} />
      <h3
        style={{
          margin: 0,
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "1.25rem",
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "var(--parchment)",
          fontWeight: 400,
        }}
      >
        {name}
      </h3>
      <GoldRule width="4rem" />
      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-eb-garamond), Georgia, serif",
          fontSize: "1.05rem",
          lineHeight: 1.6,
          color: "var(--parchment)",
          opacity: 0.9,
          maxWidth: "32rem",
        }}
      >
        {distillation}
      </p>
    </article>
  );
}

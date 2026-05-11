"use client";

import Link from "next/link";
import { ArrowGlyph } from "@/components/primitives/ArrowGlyph";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import { PillarCard } from "@/components/composites/PillarCard";
import type { MicroSigilMotif } from "@/components/primitives/MicroSigil";

const pillars: { motif: MicroSigilMotif; name: string; distillation: string }[] = [
  {
    motif: "vessel",
    name: "Compassion",
    distillation:
      "An active, intelligent force that rewires the brain for connection and dismantles shame.",
  },
  {
    motif: "vesica",
    name: "Love",
    distillation:
      "A potent essential force at the root of neuroplasticity; a radical space where you can unravel and evolve.",
  },
  {
    motif: "vine",
    name: "Resilience",
    distillation:
      "Not bouncing back, but expanding forward — turning adversity into wisdom.",
  },
  {
    motif: "plumb-line",
    name: "Integrity",
    distillation:
      "The thread that binds thought, action, and purpose into one cohesive flow.",
  },
  {
    motif: "interlocking-lobes",
    name: "Partnership & Humor",
    distillation:
      "Healing is not a solo mission; we are co-pilots navigating your inner landscape.",
  },
];

export default function H6() {
  return (
    <section
      style={{
        padding: "6rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "3rem",
      }}
    >
      <SectionHeading size="2.25rem">The Pillars of My Practice</SectionHeading>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
          maxWidth: "40rem",
          width: "100%",
        }}
      >
        {pillars.map((p) => (
          <PillarCard
            key={p.name}
            motif={p.motif}
            name={p.name}
            distillation={p.distillation}
          />
        ))}
      </div>
      <Link
        href="/about#pillars"
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
        Read more about each pillar
        <ArrowGlyph size={12} />
      </Link>
    </section>
  );
}

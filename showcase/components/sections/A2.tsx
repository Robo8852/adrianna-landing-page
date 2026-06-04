"use client";

import { SectionHeading } from "@/components/primitives/SectionHeading";
import { DropCap } from "@/components/primitives/DropCap";
import { PullQuote } from "@/components/primitives/PullQuote";
import { IlluminatedMarker } from "@/components/primitives/IlluminatedMarker";

export default function A2() {
  return (
    <section
      style={{
        padding: "1rem 1.5rem 5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "3rem",
      }}
    >
      <SectionHeading size="1.75rem">Her Story</SectionHeading>

      <div style={{ maxWidth: "34rem", width: "100%" }}>
        <DropCap>
          Judith Adrianna Naílah&apos;s journey is one of profound transformation and
          deep challenges — from finding resilience amid soul wounds, chaos, and
          early fragmentation, to rediscovering her ancient original faith and
          shaping her purpose through the adversities she endured since
          childhood and adolescence. At her core, she is a Transpersonal and
          Integration Psychotherapist, deeply committed to demystifying the
          complexities of trauma and internal systems.
        </DropCap>
        <p
          style={{
            margin: "1.5rem 0 0",
            fontFamily: "var(--font-eb-garamond), Georgia, serif",
            fontSize: "1.1rem",
            lineHeight: 1.75,
            color: "var(--parchment)",
          }}
        >
          Born in the High Andes of Peru but raised across different parts of
          the world, Adrianna earned her degree in Clinical Psychology in the
          U.S. and an MSc in Transpersonal Psychology, Spirituality &amp;
          Consciousness in the U.K., specializing in the Neuroscience of
          Emotions. Her early childhood and adolescence were marked by extended
          and repetitive complex trauma — including domestic violence,
          emotional and physical abuse, and sexual abuse from a very young
          age — which she felt fractured her true identity and filtered her
          understanding of the world, humanity, and suffering.
        </p>
      </div>

      <PullQuote
        quote="To be loved but not seen is comforting but superficial; not to be known and not loved is our greatest fear. To be fully known and truly loved is to be loved by the Almighty."
        attribution="Tk. T 5,53"
      />

      <div style={{ maxWidth: "34rem", width: "100%" }}>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-eb-garamond), Georgia, serif",
            fontSize: "1.1rem",
            lineHeight: 1.75,
            color: "var(--parchment)",
          }}
        >
          These experiences not only shaped her professionally through
          sensitivity, empathy, and compassion, but fueled her personal quest
          to understand the deeper intersections of the mind, behavior, psyche,
          and spirit.
        </p>
      </div>

      <IlluminatedMarker variant="plus" />
    </section>
  );
}

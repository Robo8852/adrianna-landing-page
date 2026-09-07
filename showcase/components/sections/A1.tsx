"use client";

import Image from "next/image";
import { GoldRule } from "@/components/primitives/GoldRule";

export default function A1() {
  return (
    <section
      style={{
        padding: "3rem 1.5rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: "2.5rem",
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "0.78rem",
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "var(--gold-warm)",
        }}
      >
        Founder
      </p>
      <h2
        style={{
          margin: 0,
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontWeight: 300,
          letterSpacing: "0.01em",
          lineHeight: 1.1,
          fontSize: "clamp(2rem, 5vw, 3rem)",
          color: "var(--parchment)",
        }}
      >
        Judith Adrianna Naílah
      </h2>
      <GoldRule width="8rem" />
      <Image
        src="/bio-pic.jpg"
        alt="Judith Adrianna Naílah"
        width={1078}
        height={1080}
        priority
        sizes="(max-width: 480px) 72vw, 320px"
        style={{
          display: "block",
          width: "min(320px, 72vw)",
          height: "auto",
        }}
      />
    </section>
  );
}

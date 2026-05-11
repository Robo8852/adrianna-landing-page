"use client";

import { GoldRule } from "@/components/primitives/GoldRule";

export default function A1() {
  return (
    <section
      style={{
        padding: "8rem 1.5rem 6rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: "2.5rem",
      }}
    >
      <h1
        style={{
          margin: 0,
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontWeight: 300,
          letterSpacing: "0.01em",
          lineHeight: 1.1,
          fontSize: "clamp(2.5rem, 6vw, 4rem)",
          color: "var(--parchment)",
        }}
      >
        About Adrianna Naílah
      </h1>
      <GoldRule width="8rem" />
    </section>
  );
}

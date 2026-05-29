"use client";

import Image from "next/image";
import { GoldRule } from "@/components/primitives/GoldRule";

export default function A1() {
  return (
    <section
      style={{
        padding: "8rem 1.5rem 1.5rem",
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
      <Image
        src="/bio-pic.jpg"
        alt="Adrianna Naílah"
        width={958}
        height={991}
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

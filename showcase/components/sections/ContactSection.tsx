"use client";

import { SectionHeading } from "@/components/primitives/SectionHeading";
import { ContactForm } from "@/components/composites/ContactForm";

export default function ContactSection() {
  return (
    <section
      id="contact"
      style={{
        padding: "6rem 1.5rem 8rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: "2rem",
      }}
    >
      <SectionHeading size="2.25rem">Write to Adrianna</SectionHeading>
      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-eb-garamond), Georgia, serif",
          fontStyle: "italic",
          fontSize: "1.05rem",
          lineHeight: 1.7,
          color: "var(--parchment)",
          opacity: 0.85,
          maxWidth: "36rem",
        }}
      >
        Prefer to write directly? Send a note and Adrianna will reply
        personally.
      </p>
      <ContactForm source="contact-h8" />
    </section>
  );
}

"use client";

import { SectionHeading } from "@/components/primitives/SectionHeading";
import { GoldRule } from "@/components/primitives/GoldRule";
import { PriceCard } from "@/components/composites/PriceCard";
import { BookButton } from "@/features/calendly";
import type { BookingKey } from "@/features/calendly";

interface Service {
  name: string;
  duration?: string;
  price: string;
  priceNote?: string;
  description: string;
  bookingKey: BookingKey;
}

const services: Service[] = [
  {
    name: "Introductory Meeting",
    duration: "30 minutes",
    price: "Free",
    bookingKey: "intro",
    description:
      "This introductory call is a space for us to connect and see if we're the right fit for each other. It's a chance for you to share your vision and for me to offer a glimpse of how I work. No pressure — just an open conversation to explore whether we can co-create a journey together.",
  },
  {
    name: "1:1 Psychotherapy Session",
    duration: "60–75 minutes",
    price: "$175",
    bookingKey: "session",
    description:
      "In these personalized sessions, we dive deeply into your unique needs. Using a blend of science, spirituality, and practical tools, we work together on what matters most to you — your values and your intention for Beyond Therapy.",
  },
  {
    name: "Deep Immersion",
    duration: "90–120 minutes",
    price: "$275",
    bookingKey: "immersion",
    description:
      "An extended session for the work that needs room to unfold. With more time we can move past the opening and stay with what surfaces — deeper process, fuller integration, and space to arrive at something a shorter hour would only begin.",
  },
];

// Four 1:1 sessions at $150 each — $100 off the $700 à la carte price.
// Rendered as a full-width band below the grid rather than a fourth card,
// so the three-card layout keeps its balance.
const fourPack = {
  eyebrow: "For those ready to go deeper",
  name: "Four 1:1 Sessions",
  price: "$600",
  saving: "$150 per session — a $100 saving on $700",
  bookingKey: "fourpack" as BookingKey,
  description:
    "Continuity is where the real work happens. Committing to four sessions lets us build momentum together, returning to the same thread rather than starting fresh each time — supporting your ongoing growth, exploration, integration, and transformation.",
};

export default function H7() {
  return (
    <section
      id="services"
      style={{
        padding: "6rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "3.5rem",
      }}
    >
      <SectionHeading size="2.25rem">Services &amp; Offerings</SectionHeading>
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        style={{ maxWidth: "72rem", width: "100%" }}
      >
        {services.map((s) => (
          <PriceCard
            key={s.name}
            name={s.name}
            duration={s.duration}
            price={s.price}
            priceNote={s.priceNote}
            description={s.description}
            bookingKey={s.bookingKey}
          />
        ))}
      </div>
      <FourPackBand />
    </section>
  );
}

function FourPackBand() {
  return (
    <aside
      aria-label={fourPack.name}
      style={{
        maxWidth: "72rem",
        width: "100%",
        padding: "3rem 2rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: "1rem",
        borderTop: "1px solid rgba(201,169,97,0.35)",
        borderBottom: "1px solid rgba(201,169,97,0.35)",
        background:
          "linear-gradient(180deg, rgba(201,169,97,0.05), transparent 60%)",
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "0.85rem",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "var(--gold-warm)",
          opacity: 0.9,
        }}
      >
        {fourPack.eyebrow}
      </p>
      <h3
        style={{
          margin: 0,
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "1.75rem",
          fontWeight: 400,
          color: "var(--parchment)",
          letterSpacing: "0.02em",
        }}
      >
        {fourPack.name}
      </h3>
      <GoldRule width="3rem" />
      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "2.5rem",
          color: "var(--gold-warm)",
          letterSpacing: "0.02em",
        }}
      >
        {fourPack.price}
      </p>
      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-eb-garamond), Georgia, serif",
          fontStyle: "italic",
          fontSize: "1rem",
          color: "var(--parchment)",
          opacity: 0.75,
        }}
      >
        {fourPack.saving}
      </p>
      <p
        style={{
          margin: 0,
          maxWidth: "44rem",
          fontFamily: "var(--font-eb-garamond), Georgia, serif",
          fontSize: "1rem",
          lineHeight: 1.7,
          color: "var(--parchment)",
          opacity: 0.85,
        }}
      >
        {fourPack.description}
      </p>
      <div style={{ marginTop: "0.75rem", minWidth: "18rem" }}>
        <BookButton
          className="w-full"
          bookingKey={fourPack.bookingKey}
          label="Reserve the Four"
        />
      </div>
    </aside>
  );
}

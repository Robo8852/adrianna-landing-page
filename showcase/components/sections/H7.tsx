"use client";

import { SectionHeading } from "@/components/primitives/SectionHeading";
import { PriceCard } from "@/components/composites/PriceCard";
import { PriceNote } from "@/components/composites/PriceNote";

const services = [
  {
    name: "Introductory Meeting",
    duration: "30 minutes",
    price: "Free",
    description:
      "This introductory call is a space for us to connect and see if we're the right fit for each other. It's a chance for you to share your vision and for me to offer a glimpse of how I work. No pressure — just an open conversation to explore whether we can co-create a journey together.",
  },
  {
    name: "1:1 Psychotherapy Session",
    duration: "60–90 minutes",
    price: "$120",
    description:
      "In these personalized sessions, we dive deeply into your unique needs. Using a blend of science, spirituality, and practical tools, we work together on what matters most to you — your values and your intention for Beyond Therapy.",
  },
  {
    name: "3-Session Package",
    price: "$270",
    priceNote: "save $90",
    description:
      "This package allows us to build momentum and consistency in your healing journey. The same depth as individual sessions at a discounted rate, supporting your commitment to ongoing growth, exploration, integration, and transformation.",
  },
  {
    name: "Psychotherapy with Coaching",
    duration: "60–90 minutes",
    price: "$200",
    description:
      "These sessions combine psychotherapy with a coaching framework for a holistic, action-oriented approach. Ideal for those entering the realm of Conscious Leadership Coaching — empowering creative executives, professionals, and entrepreneurs to harness both self-leadership and collective leadership capacities, with a focus on fostering clarity, optimizing flow, and creating expansive impact.",
  },
];

const notes = [
  {
    title: "Insurance",
    body:
      "If you have insurance, we'll apply your deductible and the final payment for sessions will be $65.",
  },
  {
    title: "Financial Flexibility",
    body: "Sliding-scale options are available — write directly to inquire.",
  },
];

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
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        style={{ maxWidth: "52rem", width: "100%" }}
      >
        {services.map((s) => (
          <PriceCard
            key={s.name}
            name={s.name}
            duration={s.duration}
            price={s.price}
            priceNote={s.priceNote}
            description={s.description}
          />
        ))}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2.5rem",
        }}
      >
        {notes.map((n) => (
          <PriceNote key={n.title} title={n.title} body={n.body} />
        ))}
      </div>
    </section>
  );
}

"use client";

import { GoldRule } from "@/components/primitives/GoldRule";
import { BookButton } from "@/features/calendly";
import type { BookingKey } from "@/features/calendly";

export interface PriceCardProps {
  name: string;
  duration?: string;
  price: string;
  priceNote?: string;
  description: string;
  bookingKey?: BookingKey;
  className?: string;
}

export function PriceCard({
  name,
  duration,
  price,
  priceNote,
  description,
  bookingKey,
  className,
}: PriceCardProps) {
  return (
    <article
      className={className}
      style={{
        padding: "2.5rem 1.75rem",
        border: "1px solid rgba(201,169,97,0.35)",
        boxShadow: "inset 0 0 0 1px rgba(201,169,97,0.08)",
        backgroundColor: "transparent",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: "1rem",
      }}
    >
      <h3
        style={{
          margin: 0,
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "1.5rem",
          color: "var(--parchment)",
          fontWeight: 400,
          letterSpacing: "0.02em",
        }}
      >
        {name}
      </h3>
      <GoldRule width="3rem" />
      {duration ? (
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
          {duration}
        </p>
      ) : null}
      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "2rem",
          color: "var(--gold-warm)",
          letterSpacing: "0.02em",
        }}
      >
        {price}
        {priceNote ? (
          <span
            style={{
              fontFamily: "var(--font-eb-garamond), Georgia, serif",
              fontStyle: "italic",
              fontSize: "0.9rem",
              color: "var(--parchment)",
              opacity: 0.7,
              marginLeft: "0.5rem",
            }}
          >
            ({priceNote})
          </span>
        ) : null}
      </p>
      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-eb-garamond), Georgia, serif",
          fontSize: "1rem",
          lineHeight: 1.7,
          color: "var(--parchment)",
          opacity: 0.85,
        }}
      >
        {description}
      </p>
      {bookingKey ? (
        <div style={{ marginTop: "0.5rem" }}>
          <BookButton
            bookingKey={bookingKey}
            label={bookingKey === "intro" ? "Book — Free" : "Book a Session"}
          />
        </div>
      ) : null}
    </article>
  );
}

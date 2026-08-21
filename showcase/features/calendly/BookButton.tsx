"use client";

import { useState } from "react";

import type { BookingKey } from "./calendly";
import { bookingUrl } from "./calendly";
import { useCalendly } from "./useCalendly";

export interface BookButtonProps {
  bookingKey: BookingKey;
  label?: string;
  className?: string;
}

export function BookButton({
  bookingKey,
  label = "Book a Session",
  className,
}: BookButtonProps) {
  const { open } = useCalendly();
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      className={className}
      onClick={() => open(bookingUrl(bookingKey))}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        appearance: "none",
        border: "none",
        borderRadius: 0,
        padding: "0.85rem 2rem",
        backgroundColor: hovered
          ? "var(--gold-warm, #D6B873)"
          : "var(--gold, #C9A961)",
        color: "var(--ink-green, #0B3B36)",
        fontFamily: "var(--font-cormorant), Georgia, serif",
        fontSize: "0.85rem",
        fontWeight: 500,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        cursor: "pointer",
        transition: "background-color 0.2s ease",
      }}
    >
      {label}
    </button>
  );
}

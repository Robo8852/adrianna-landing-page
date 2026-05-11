"use client";

import type { ReactNode } from "react";

export interface DropCapProps {
  children: ReactNode;
  className?: string;
}

export function DropCap({ children, className }: DropCapProps) {
  return (
    <>
      <p
        className={`drop-cap-paragraph ${className ?? ""}`.trim()}
        style={{
          fontFamily: "var(--font-eb-garamond), Georgia, serif",
          fontSize: "1.1rem",
          lineHeight: 1.7,
          color: "var(--parchment)",
          margin: 0,
        }}
      >
        {children}
      </p>
      <style jsx>{`
        .drop-cap-paragraph::first-letter {
          font-family: var(--font-cormorant), Georgia, serif;
          color: var(--gold-warm);
          font-size: 5rem;
          line-height: 0.85;
          float: left;
          padding-right: 0.6rem;
          padding-top: 0.4rem;
          font-weight: 400;
        }
      `}</style>
    </>
  );
}

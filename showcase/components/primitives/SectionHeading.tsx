"use client";

import type { ReactNode } from "react";
import { GoldRule } from "@/components/primitives/GoldRule";

export interface SectionHeadingProps {
  as?: "h2" | "h3";
  size?: string;
  tracking?: string;
  smallCaps?: boolean;
  ruleWidth?: string;
  id?: string;
  children: ReactNode;
  className?: string;
}

export function SectionHeading({
  as = "h2",
  size = "2.25rem",
  tracking = "0.18em",
  smallCaps = true,
  ruleWidth = "6rem",
  id,
  children,
  className,
}: SectionHeadingProps) {
  const Tag = as;
  return (
    <div
      id={id}
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.25rem",
      }}
    >
      <GoldRule width={ruleWidth} />
      <Tag
        style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          color: "var(--parchment)",
          fontSize: size,
          letterSpacing: tracking,
          textTransform: smallCaps ? "uppercase" : undefined,
          fontWeight: 400,
          margin: 0,
          textAlign: "center",
        }}
      >
        {children}
      </Tag>
      <GoldRule width={ruleWidth} />
    </div>
  );
}

export interface PriceNoteProps {
  title: string;
  body: string;
  className?: string;
}

export function PriceNote({ title, body, className }: PriceNoteProps) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        margin: "0 auto",
        maxWidth: "32rem",
        gap: "0.5rem",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "1rem",
          color: "var(--gold)",
          opacity: 0.85,
        }}
      >
        +
      </span>
      <h4
        style={{
          margin: 0,
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "0.85rem",
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "var(--gold-warm)",
          fontWeight: 400,
        }}
      >
        {title}
      </h4>
      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-eb-garamond), Georgia, serif",
          fontSize: "0.95rem",
          lineHeight: 1.7,
          color: "var(--parchment)",
          opacity: 0.8,
        }}
      >
        {body}
      </p>
    </div>
  );
}

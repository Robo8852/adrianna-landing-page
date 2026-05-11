export interface CredentialRowProps {
  numeral: string;
  title: string;
  year: string;
  institution: string;
  specialization?: string;
  className?: string;
}

export function CredentialRow({
  numeral,
  title,
  year,
  institution,
  specialization,
  className,
}: CredentialRowProps) {
  return (
    <li
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: "1.5rem",
        padding: "1.5rem 0",
        borderBottom: "1px solid rgba(201,169,97,0.3)",
        listStyle: "none",
        alignItems: "baseline",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "1.1rem",
          letterSpacing: "0.28em",
          color: "var(--gold-warm)",
          minWidth: "2.5rem",
        }}
      >
        {numeral}
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
        <h3
          style={{
            margin: 0,
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "1.15rem",
            color: "var(--parchment)",
            fontWeight: 400,
            letterSpacing: "0.02em",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-eb-garamond), Georgia, serif",
            fontStyle: "italic",
            fontSize: "0.9rem",
            color: "var(--parchment)",
            opacity: 0.65,
          }}
        >
          {year}
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-eb-garamond), Georgia, serif",
            fontSize: "0.95rem",
            color: "var(--parchment)",
            opacity: 0.85,
          }}
        >
          {institution}
        </p>
        {specialization ? (
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-eb-garamond), Georgia, serif",
              fontStyle: "italic",
              fontSize: "0.9rem",
              color: "var(--gold-warm)",
            }}
          >
            {specialization}
          </p>
        ) : null}
      </div>
    </li>
  );
}

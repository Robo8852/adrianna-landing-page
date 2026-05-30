"use client";

import { useId, useState, type CSSProperties, type FormEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { GoldRule } from "@/components/primitives/GoldRule";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export interface NewsletterFormProps {
  buttonLabel?: string;
  compact?: boolean;
  className?: string;
  source?: string;
}

const visuallyHidden: CSSProperties = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  whiteSpace: "nowrap",
  border: 0,
};

export function NewsletterForm({
  buttonLabel = "Join the Vespers",
  compact = false,
  className,
  source = "unknown",
}: NewsletterFormProps = {}) {
  const inputId = useId();
  const errorId = useId();

  const subscribe = useMutation(api.subscribers.subscribe);

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setError("a valid email, please");
      return;
    }
    setError(null);
    setPending(true);
    try {
      await subscribe({ email: email.trim(), source });
      setSubmitted(true);
    } catch {
      setError("the ink did not take — try again");
    } finally {
      setPending(false);
    }
  }

  const maxW = compact ? "22rem" : "28rem";

  if (submitted) {
    return (
      <div
        className={className}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
          maxWidth: maxW,
          margin: "0 auto",
        }}
      >
        <GoldRule width="6rem" animate={false} />
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-eb-garamond), Georgia, serif",
            fontStyle: "italic",
            fontSize: "1.1rem",
            color: "var(--parchment)",
            textAlign: "center",
          }}
        >
          Inscribed. A response will arrive in due time.
        </p>
        <GoldRule width="6rem" animate={false} />
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={className}
      style={{
        display: "flex",
        flexDirection: compact ? "row" : "column",
        gap: compact ? "0.5rem" : "0.75rem",
        maxWidth: maxW,
        margin: "0 auto",
        width: "100%",
      }}
    >
      <label htmlFor={inputId} style={visuallyHidden}>
        Email address
      </label>
      <input
        id={inputId}
        type="email"
        required
        placeholder="your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={pending}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : undefined}
        style={{
          flex: 1,
          backgroundColor: "transparent",
          border: error
            ? "1px solid rgba(217,190,126,0.85)"
            : "1px solid rgba(201,169,97,0.35)",
          color: "var(--parchment)",
          fontFamily: "var(--font-eb-garamond), Georgia, serif",
          fontStyle: "italic",
          letterSpacing: "0.04em",
          padding: compact ? "0.6rem 0.8rem" : "0.85rem 1rem",
          borderRadius: 0,
          outline: "none",
          fontSize: compact ? "0.9rem" : "0.95rem",
        }}
      />
      <button
        type="submit"
        disabled={pending}
        style={{
          backgroundColor: "transparent",
          color: "var(--gold-warm)",
          border: "1px solid var(--gold)",
          borderRadius: 0,
          fontFamily: "var(--font-cormorant), Georgia, serif",
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          fontSize: compact ? "0.7rem" : "0.78rem",
          padding: compact ? "0.6rem 1.2rem" : "0.85rem 1.6rem",
          height: "auto",
          boxShadow: "inset 0 0 0 1px rgba(201,169,97,0.18)",
          transition: "background-color 350ms ease, color 350ms ease",
          opacity: pending ? 0.6 : 1,
          cursor: pending ? "default" : "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(201,169,97,0.08)";
          e.currentTarget.style.color = "var(--parchment)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = "var(--gold-warm)";
        }}
      >
        {buttonLabel}
      </button>
      {error ? (
        <p
          id={errorId}
          role="alert"
          style={{
            margin: 0,
            fontFamily: "var(--font-eb-garamond), Georgia, serif",
            fontStyle: "italic",
            fontSize: "0.85rem",
            color: "var(--gold-warm)",
            textAlign: "center",
            flexBasis: "100%",
          }}
        >
          {error}
        </p>
      ) : null}
    </form>
  );
}

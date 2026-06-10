"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import { GoldRule } from "@/components/primitives/GoldRule";
import { useTurnstile } from "@/lib/hooks/useTurnstile";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export interface ContactFormProps {
  source?: string;
  className?: string;
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

const fieldStyle = (hasError: boolean, pending: boolean): CSSProperties => ({
  backgroundColor: "transparent",
  border: hasError
    ? "1px solid rgba(217,190,126,0.85)"
    : "1px solid rgba(201,169,97,0.35)",
  color: "var(--parchment)",
  fontFamily: "var(--font-eb-garamond), Georgia, serif",
  fontStyle: "italic",
  letterSpacing: "0.04em",
  padding: "0.85rem 1rem",
  borderRadius: 0,
  outline: "none",
  fontSize: "0.95rem",
  width: "100%",
  opacity: pending ? 0.6 : 1,
  cursor: pending ? "default" : undefined,
});

export function ContactForm({
  source = "unknown",
  className,
}: ContactFormProps = {}) {
  const nameId = useId();
  const emailId = useId();
  const messageId = useId();
  const errorId = useId();

  // Turnstile (P3-10): nothing loads until the user touches the form.
  const turnstileRef = useRef<HTMLDivElement>(null);
  const { arm, getToken } = useTurnstile(turnstileRef);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [hp, setHp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);

  const renderedAt = useRef<number | null>(null);
  useEffect(() => {
    renderedAt.current = Date.now();
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setError("a valid email, please");
      return;
    }
    if (!message.trim()) {
      setError("a few words, please");
      return;
    }
    const elapsedMs =
      renderedAt.current === null ? undefined : Date.now() - renderedAt.current;
    setError(null);
    setPending(true);
    try {
      const turnstileToken = await getToken();
      // P3-9: submissions go through the /api/contact front door (IP rate
      // limiting + Turnstile verification), not directly to Convex.
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          message: message.trim(),
          name: name.trim() || undefined,
          source,
          hp,
          elapsedMs,
          turnstileToken,
        }),
      });
      if (!res.ok) throw new Error("contact failed");
      setSubmitted(true);
    } catch {
      setError("the ink did not take — try again");
    } finally {
      setPending(false);
    }
  }

  if (submitted) {
    return (
      <div
        className={className}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
          maxWidth: "28rem",
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
        flexDirection: "column",
        gap: "0.75rem",
        maxWidth: "28rem",
        margin: "0 auto",
        width: "100%",
      }}
    >
      <div aria-hidden="true" style={visuallyHidden}>
        <input
          name="company"
          type="text"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
      </div>

      <label htmlFor={nameId} style={visuallyHidden}>
        Name (optional)
      </label>
      <input
        id={nameId}
        type="text"
        maxLength={100}
        placeholder="your name (optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onFocus={arm}
        disabled={pending}
        style={fieldStyle(false, pending)}
      />

      <label htmlFor={emailId} style={visuallyHidden}>
        Email address
      </label>
      <input
        id={emailId}
        type="email"
        required
        maxLength={254}
        placeholder="your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onFocus={arm}
        disabled={pending}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : undefined}
        style={fieldStyle(!!error, pending)}
      />

      <label htmlFor={messageId} style={visuallyHidden}>
        Message
      </label>
      <textarea
        id={messageId}
        required
        rows={5}
        maxLength={5000}
        placeholder="your message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={pending}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : undefined}
        style={{
          ...fieldStyle(!!error, pending),
          resize: "vertical",
          fontStyle: "italic",
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
          fontSize: "0.78rem",
          padding: "0.85rem 1.6rem",
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
        Send
      </button>

      {/*
        Turnstile mount point. Invisible in interaction-only mode; if
        Cloudflare escalates to a visible challenge it renders here.
      */}
      <div ref={turnstileRef} />

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

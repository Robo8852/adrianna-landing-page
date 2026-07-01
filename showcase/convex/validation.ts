// Shared validation/sanitization helpers for the Convex backend.
//
// Plain TypeScript only — no Convex imports — so this module is safe for the
// Convex CLI to analyze and is also importable from client/unit-test code.
// Unit tests live in showcase/lib/convexValidation.test.ts (NOT in this
// directory, which `convex push` analyzes).

/** Server-side max lengths for user-supplied fields. */
export const LIMITS = {
  name: 100,
  email: 254,
  message: 5000,
  source: 50,
} as const;

/** Allowed `source` values for newsletter signups. */
export const NEWSLETTER_SOURCES = ["hero", "h8", "modal", "footer"] as const;

/** Allowed `source` values for contact-form submissions. */
export const CONTACT_SOURCES = ["contact-h8", "footer"] as const;

/**
 * Match a client-supplied source against an allowlist; anything else
 * (including undefined) collapses to "unknown" so arbitrary strings never
 * reach the database or notification emails.
 */
export function normalizeSource(
  source: string | undefined,
  allowed: readonly string[],
): string {
  if (source !== undefined && allowed.includes(source)) return source;
  return "unknown";
}

/**
 * Sanitize a user-supplied name for use in an email subject/body:
 * strip control characters (header-injection vectors), collapse whitespace,
 * trim, and cap at 100 chars.
 */
export function sanitizeSubjectName(name: string): string {
  return name
    .replace(/[\x00-\x1f\x7f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}

/**
 * Redact an email address for logging: keep the first character of the
 * local part and the domain, e.g. "judith@example.com" -> "j***@example.com".
 */
export function redactEmail(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) return "***";
  return `${email[0]}***${email.slice(at)}`;
}

/** Count URL-ish occurrences (http://, https://, www.) in a string. */
export function countUrls(text: string): number {
  return (text.match(/(https?:\/\/|www\.)/gi) ?? []).length;
}

let warnedMissingSharedSecret = false;

/**
 * Gateway shared-secret check for the public form mutations (P3-9).
 *
 * The Next.js route handlers (/api/subscribe, /api/contact) attach
 * CONVEX_SHARED_SECRET to every mutation call. A call arriving without the
 * right secret bypassed the front door (direct Convex client) and is treated
 * as a bot: the mutation answers an opaque { ok: true } and writes nothing —
 * same convention as the honeypot/timing/rate-limit paths.
 *
 * Fail-open by design when CONVEX_SHARED_SECRET is NOT set on the deployment
 * (e.g. a fresh dev deployment): the site must not break because an env var
 * is missing. Logged once per isolate so it is visible in the dashboard.
 */
export function sharedSecretOk(provided: string | undefined): boolean {
  const expected = process.env.CONVEX_SHARED_SECRET;
  if (!expected) {
    if (!warnedMissingSharedSecret) {
      console.warn(
        "CONVEX_SHARED_SECRET is not set — accepting form mutations without a gateway secret (fail-open)",
      );
      warnedMissingSharedSecret = true;
    }
    return true;
  }
  return provided === expected;
}

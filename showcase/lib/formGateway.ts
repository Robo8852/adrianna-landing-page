// Server-only helpers shared by the /api/subscribe and /api/contact route
// handlers (P3-9 front door + P3-10 Turnstile verification).
//
// Do NOT import this from client components — it reads server env vars and
// uses node:crypto.

import { createHash } from "node:crypto";

/**
 * Client IP as reported by the platform. On Vercel `x-forwarded-for` is set
 * by the edge network and the leftmost entry is the real client (Vercel
 * strips/overrides client-supplied values, so it is trustworthy there).
 */
export function getClientIp(headers: Headers): string | undefined {
  const xff = headers.get("x-forwarded-for");
  const first = xff?.split(",")[0]?.trim();
  return first || undefined;
}

/**
 * Salted sha256 of the client IP. The raw IP never leaves this process; only
 * the hash is passed to Convex as a rate-limit key. Salting (with the gateway
 * shared secret — already required server-side) stops trivial reversal of
 * the small IPv4 space.
 */
export function hashIp(ip: string | undefined): string | undefined {
  if (!ip) return undefined;
  const salt = process.env.CONVEX_SHARED_SECRET ?? "";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

let warnedMissingTurnstileSecret = false;

/**
 * Server-side Turnstile verification (P3-10).
 *
 * Returns true when the submission should proceed:
 *   - TURNSTILE_SECRET_KEY unset → fail OPEN (dev/preview without keys must
 *     not break the forms); logged once.
 *   - siteverify unreachable / non-JSON → fail OPEN (a Cloudflare outage must
 *     not take the forms down) — the Convex-side heuristics still apply.
 * Returns false (caller answers an opaque { ok: true }) when:
 *   - the secret is set but the client sent no token, or
 *   - siteverify answers success: false.
 */
export async function verifyTurnstile(
  token: string | undefined,
  ip: string | undefined,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    if (!warnedMissingTurnstileSecret) {
      console.warn(
        "TURNSTILE_SECRET_KEY is not set — skipping Turnstile verification (fail-open)",
      );
      warnedMissingTurnstileSecret = true;
    }
    return true;
  }

  if (!token) return false;

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set("remoteip", ip);
    const res = await fetch(SITEVERIFY_URL, { method: "POST", body });
    if (!res.ok) {
      console.error("Turnstile siteverify HTTP error", res.status, "— failing open");
      return true;
    }
    const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    return data.success === true;
  } catch (err) {
    console.error("Turnstile siteverify unreachable — failing open:", String(err));
    return true;
  }
}

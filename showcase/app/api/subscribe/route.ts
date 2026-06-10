// P3-9 front door for newsletter signups.
//
// The NewsletterForm POSTs here instead of calling the Convex mutation
// directly. This route:
//   1. verifies the Turnstile token server-side (P3-10) — failure is opaque,
//   2. derives a salted ipHash from the Vercel-trusted x-forwarded-for,
//   3. forwards to the Convex mutation with CONVEX_SHARED_SECRET attached,
//      so direct mutation calls (bypassing this route) are no-ops.
// The Convex mutation still runs its own honeypot/timing/rate-limit checks —
// this route is an additional layer, not a replacement.

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { getClientIp, hashIp, verifyTurnstile } from "@/lib/formGateway";

export const runtime = "nodejs";

const EMAIL_MAX = 254;

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email : "";
  if (!email || email.length > EMAIL_MAX) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const ip = getClientIp(request.headers);

  // Turnstile (P3-10). A failed verification gets the same opaque success the
  // Convex heuristics use — the bot learns nothing, and nothing is written.
  const turnstileToken =
    typeof body.turnstileToken === "string" ? body.turnstileToken : undefined;
  if (!(await verifyTurnstile(turnstileToken, ip))) {
    return NextResponse.json({ ok: true });
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    console.error("/api/subscribe: NEXT_PUBLIC_CONVEX_URL is not set");
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  try {
    const convex = new ConvexHttpClient(convexUrl);
    await convex.mutation(api.subscribers.subscribe, {
      email,
      source: typeof body.source === "string" ? body.source : undefined,
      hp: typeof body.hp === "string" ? body.hp : undefined,
      elapsedMs: typeof body.elapsedMs === "number" ? body.elapsedMs : undefined,
      secret: process.env.CONVEX_SHARED_SECRET,
      ipHash: hashIp(ip),
    });
    return NextResponse.json({ ok: true });
  } catch {
    // The mutation only throws on real validation failures (invalid email,
    // over-length) — surface those as a client error, without details.
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

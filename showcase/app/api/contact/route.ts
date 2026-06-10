// P3-9 front door for contact-form submissions — see /api/subscribe for the
// full rationale. Same layering: Turnstile verification (opaque on failure),
// salted ipHash for per-IP rate limiting, CONVEX_SHARED_SECRET so direct
// mutation calls are no-ops.

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { getClientIp, hashIp, verifyTurnstile } from "@/lib/formGateway";

export const runtime = "nodejs";

const EMAIL_MAX = 254;
const MESSAGE_MAX = 5000;
const NAME_MAX = 100;

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email : "";
  const message = typeof body.message === "string" ? body.message : "";
  const name = typeof body.name === "string" ? body.name : undefined;
  if (
    !email ||
    email.length > EMAIL_MAX ||
    !message ||
    message.length > MESSAGE_MAX ||
    (name !== undefined && name.length > NAME_MAX)
  ) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const ip = getClientIp(request.headers);

  const turnstileToken =
    typeof body.turnstileToken === "string" ? body.turnstileToken : undefined;
  if (!(await verifyTurnstile(turnstileToken, ip))) {
    return NextResponse.json({ ok: true });
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    console.error("/api/contact: NEXT_PUBLIC_CONVEX_URL is not set");
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  try {
    const convex = new ConvexHttpClient(convexUrl);
    await convex.mutation(api.messages.submitContact, {
      email,
      message,
      name,
      source: typeof body.source === "string" ? body.source : undefined,
      hp: typeof body.hp === "string" ? body.hp : undefined,
      elapsedMs: typeof body.elapsedMs === "number" ? body.elapsedMs : undefined,
      secret: process.env.CONVEX_SHARED_SECRET,
      ipHash: hashIp(ip),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

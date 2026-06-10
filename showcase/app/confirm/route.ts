import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

// The confirmation link must hit Convex on every click — never a cached
// response — so a second visit with a spent token reads as expired.
export const dynamic = "force-dynamic";

/**
 * Double opt-in landing. The emailed link points here with ?token=...; we
 * confirm the subscriber in Convex and bounce to the homepage, where
 * ConfirmedBanner renders the outcome.
 *
 * Only two destinations exist: success, or the lapsed-seal state. Garbage
 * tokens and network failures both land on "expired" — re-subscribing fixes
 * either, and we never tell a probing client which kind of miss it scored.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";

  let confirmed = "expired";
  try {
    const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const result = await client.mutation(api.subscribers.confirm, { token });
    if (result.ok) confirmed = "1";
  } catch (err) {
    // Convex unreachable: fall through to the expired copy, which invites
    // the visitor to subscribe again rather than showing an error page.
    // Logged (token never included) so outages are visible server-side.
    console.error("confirm route: Convex call failed:", err);
  }

  return NextResponse.redirect(new URL(`/?confirmed=${confirmed}`, req.nextUrl.origin));
}

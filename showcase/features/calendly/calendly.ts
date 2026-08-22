// Single source of truth for Calendly booking links.
//
// When Adrianna provides her real event slugs (or an API token to list event
// types), update SERVICE_SLUGS below — no component changes are needed. Every
// booking button references a service by BookingKey, never by raw URL.

const ACCOUNT =
  process.env.NEXT_PUBLIC_CALENDLY_URL ?? "https://calendly.com/thealtarwithin";

export type BookingKey =
  | "menu"
  | "intro"
  | "session"
  | "immersion"
  | "fourpack"
  | "coaching";

// UX rule: a button with a specific intent opens that specific event; a
// button with undecided intent (the nav CTA) opens the account landing page,
// which lists every event — the "menu".
//
// A null slug resolves to the landing page. For `menu` that is deliberate.
// For the others it is a fallback until the real event exists on Calendly.
//
// Live events verified 2026-08-22 on calendly.com/thealtarwithin:
//   short-form-consultation-30-min  — 30 min
//   session-1                       — "1:1 Psychotherapy Session" (60–75 min)
//   deep-immersion                  — "Deep Immersion", 90 min
//   four-1-1-sessions               — "Four 1:1 Sessions", 60 min
//   content-creation-podcast-collaboration-inquiry — 45 min (not a service)
const SERVICE_SLUGS: Record<BookingKey, string | null> = {
  menu: null, // intentional: show all events
  intro: "short-form-consultation-30-min", // ✅ live
  session: "session-1", // ✅ live (60–75 min)
  immersion: "deep-immersion", // ✅ live (90 min; description notes 90–120)
  fourpack: "four-1-1-sessions", // ✅ live (60 min, first of four)
  coaching: null, // TODO: confirm real slug
};

// Brand palette passed to Calendly so the popup matches the site.
const CALENDLY_THEME: Record<string, string> = {
  background_color: "0B3B36",
  text_color: "F3EEDA",
  primary_color: "C9A961",
};

/** Full themed Calendly URL for a service. */
export function bookingUrl(key: BookingKey): string {
  const slug = SERVICE_SLUGS[key];
  const base = slug ? `${ACCOUNT}/${slug}` : ACCOUNT;
  const params = new URLSearchParams(CALENDLY_THEME).toString();
  return `${base}?${params}`;
}

/** True when the service maps to a confirmed, specific event (not the account fallback). */
export function hasConfirmedBooking(key: BookingKey): boolean {
  return SERVICE_SLUGS[key] !== null;
}

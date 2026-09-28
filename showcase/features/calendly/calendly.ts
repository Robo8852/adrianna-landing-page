// Single source of truth for Calendly booking links.
//
// Every booking button references a service by BookingKey, never by raw URL.
// Slugs are stable routing identifiers, independent of Calendly event titles.
// Keep them unchanged when removing prices from event titles for Zoom.
// Website prices are displayed separately in components/sections/H7.tsx.

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
// Booking URLs verified 2026-09-14 on calendly.com/thealtarwithin:
//   short-form-consultation-30-min — 30 min
//   1-1-session-125                — 60 min
//   deep-immersion-200             — 120 min
//   four-1-1-sessions-400           — 60 min
//   content-creation-podcast-collaboration-inquiry — 45 min (not a service)
const SERVICE_SLUGS: Record<BookingKey, string | null> = {
  menu: null, // intentional: show all events
  intro: "short-form-consultation-30-min", // ✅ live
  session: "1-1-session-125", // ✅ live (60 min, $120)
  immersion: "deep-immersion-200", // ✅ live (120 min, $250)
  fourpack: "four-1-1-sessions-400", // ✅ live (60 min, first of four, $400)
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

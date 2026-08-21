// Single source of truth for Calendly booking links.
//
// When Adrianna provides her real event slugs (or an API token to list event
// types), update SERVICE_SLUGS below — no component changes are needed. Every
// booking button references a service by BookingKey, never by raw URL.

const ACCOUNT =
  process.env.NEXT_PUBLIC_CALENDLY_URL ?? "https://calendly.com/thealtarwithin";

export type BookingKey = "intro" | "session" | "package" | "coaching";

// Confirmed from her Linktree scrape: only `intro` is a verified live event.
// The rest are null (unconfirmed) and fall back to her account landing page
// until she confirms the real slugs.
const SERVICE_SLUGS: Record<BookingKey, string | null> = {
  intro: "short-form-consultation-30-min", // ✅ confirmed live
  session: null, // TODO: confirm real slug
  package: null, // TODO: confirm real slug
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

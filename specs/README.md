# specs/README.md — map of the map

The Altar Within — a Next.js landing site for Adrianna Naílah, somatic/spiritual practitioner.
Two static-feeling pages (`/` home, `/about`) plus a real interactive core: newsletter signup with
double opt-in email, a contact form, and Calendly booking. Backend is Convex; email is Resend.

**App code lives in `showcase/`** — the repo root holds docs, assets, and these specs.
Stack: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 3 · Convex · Resend.

## How the parts connect

```
pages (/ and /about)
  └─ sections (Hero, H4–H8, A1–A5, ContactSection)
       └─ features (newsletter + contact forms, calendly BookButton)
          + composites (cards, ConfirmedBanner) + chrome (HeaderNav, Footer)
            └─ primitives (Sigil, GoldRule, headings, marks)

features/{newsletter,contact} forms ──▶ /api routes ──▶ Convex ──▶ Resend emails
                                        (shared plumbing: notifications.md)
features/calendly BookButton ──▶ Calendly popup          (partial — see calendly.md)
```

## Which spec covers what

- `sections.md` — the two pages, their section order, and what each section says
- `components.md` — composites, chrome, primitives: one line each
- `styling.md` — color/font tokens and the styling conventions
- `newsletter.md` — signup form + scroll modal + double opt-in lifecycle (`features/newsletter/`)
- `contact.md` — contact form → Convex → owner notification (`features/contact/`)
- `notifications.md` — shared email & anti-spam plumbing both forms lean on
- `calendly.md` — the booking popup feature (`features/calendly/`, partial)
- `stripe.md` — payments (planned, no code yet)
- `tooling.md` — run/test/deploy commands and env vars

## Built vs planned

- **Built & wired:** newsletter double opt-in (confirm + welcome emails), contact form with owner
  notification, Turnstile + honeypot + rate limiting, unsubscribe webhook, daily purge crons.
- **Partial:** Calendly — only the "intro" event has a real slug; other booking keys fall back to
  the account page. Not yet browser-verified.
- **Planned, not started:** Stripe payments, Calendly webhook receiver.

## Global rules

- Run everything from `showcase/` (`npm run dev / build / test / lint`).
- Color/font tokens are duplicated in `globals.css` AND `tailwind.config.ts` — change both.
- Honor the layering: primitives → composites → sections → pages; never import upward.
- Feature logic lives in `showcase/features/<name>/`; `app/` routes and `convex/<name>.ts` files are thin adapters. Sections/composites import from features, never the reverse.
- `main` auto-deploys to production on Vercel; Convex backend deploys separately via CLI.

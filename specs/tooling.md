# tooling — build, test, deploy, and environment

## What
The app runs from `showcase/` directory. Frontend (Next.js + React) deploys on Vercel; Convex backend deploys separately via CLI. All commands run from showcase root.

## Where
- **Scripts**: `showcase/package.json` — `npm run dev` (local), `build`, `start`, `test`, `lint`
- **Tests**: vitest configuration in `showcase/`, test files co-located with source
- **Convex deployment**: `npx convex` CLI commands (schema push, migrations, crons)
- **Frontend hosting**: Vercel (main → production, PRs → preview)
- **Backend**: Convex (prod backend deploy currently manual)

## How
**Local development:** `npm run dev` from showcase/. Opens `http://localhost:3000`.

**Testing & quality:** `npm run test` (vitest), `npm run lint` (TypeScript + linting).

**Building:** `npm run build` (Next.js), `npm run start` (production preview).

**Convex schema & migrations:** `npx convex dev` (watches for changes), `npx convex deploy` (push to prod).

**Environment variables** (all in `.env.local` in showcase/):
- `NEXT_PUBLIC_CONVEX_URL` — Convex client endpoint
- `NEXT_PUBLIC_CONVEX_SITE_URL` — Alternative Convex URL
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` — Cloudflare Turnstile public key
- `NEXT_PUBLIC_CALENDLY_URL` — Calendly profile fallback URL
- `CONVEX_DEPLOYMENT` — Convex deployment name
- `CONVEX_SHARED_SECRET` — Shared secret for form gateway + IP hash salt
- `TURNSTILE_SECRET_KEY` — Turnstile verification secret
- `RESEND_API_KEY` — Resend email API key
- `RESEND_AUDIENCE_ID` — Resend audience ID for newsletter
- `RESEND_WEBHOOK_SECRET` — Svix signature secret for Resend webhooks
- `NEWSLETTER_FROM` — Sender email for newsletters
- `CONTACT_NOTIFY_EMAIL` — Recipient for contact form submissions
- `SITE_URL` — Canonical site URL (used in email links)

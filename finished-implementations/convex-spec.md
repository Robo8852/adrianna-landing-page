# convex-spec — The Altar Within: newsletter backend

A specification for adding a real, persisted backend to the newsletter signup, using **Convex**.

This document describes **what** the backend does and **why**, not **how** it is built. A separate `convex-imp.md` will follow with the sequential build plan. When complete, both archive to `finished-implementations/` and a durable `spec/convex.md` domain spec joins the spec map (`spec/readme.md`).

Cross-references:
- The form being wired: `showcase/components/composites/NewsletterForm.tsx`
- Existing behaviour + the gap: `spec/composites.md` (§How), `spec/readme.md` (Known gaps)
- App shell where the provider mounts: `showcase/app/layout.tsx`, `spec/app-shell.md`
- Tooling/CI/deploy this must satisfy: `spec/tooling.md`

**Build method:** this feature is built by **orchestrated subagents**, not a single linear pass — each `convex-imp.md` step is implemented by a dedicated implementer subagent and independently checked by an adversarial verifier subagent against that step's acceptance criteria, with parallel fan-out where the dependency graph allows. See `convex-imp.md` → "Build orchestration (subagents)".

---

## 1. Purpose & scope

The newsletter signup is **the single primary CTA of the entire site** (per `SPEC.md` §1) — every section exists to earn the email. Today that email is **thrown away**: `NewsletterForm.onSubmit` runs a local regex, flips React state to a thank-you message, and persists nothing. There is no API route, no database, no email. Every submitted address is lost on reload.

This iteration closes that gap: **a submitted email is durably stored** in a Convex database, so signups survive reloads and can later be exported or emailed. Convex is chosen because it is the planned backend (branch `feat/convex-backend`), is serverless/zero-ops, has a first-class React client and a first-party Resend component for the next phase.

**In scope (this iteration):**
- A Convex deployment for the project.
- A `subscribers` table storing each unique email + a timestamp + provenance.
- A `subscribe` mutation: server-side validation, idempotent dedup, insert.
- A client provider wired into the app shell so every `NewsletterForm` instance (hero, H8, footer) can reach Convex.
- `NewsletterForm` calling the mutation on submit, with pending/error states layered onto the existing UX.
- Tests updated for the new network path.

**Out of scope (this iteration — but the design must not preclude them):**
- **Sending any email** (welcome, double opt-in, admin notification). That is the **Resend** phase. The `subscribe` mutation must be structured so a follow-up email action can be scheduled from it without reshaping the data model.
- A verified **sending domain** / DNS (SPF/DKIM/DMARC) — part of the Resend phase.
- An admin UI / dashboard to read subscribers (Convex's own dashboard suffices for now).
- Unsubscribe flow, segmentation, analytics.

---

## 2. Architecture & data flow

```
NewsletterForm ("use client")
   │  useMutation(api.subscribers.subscribe)({ email, source })
   ▼
ConvexReactClient  ──▶  Convex deployment
   │                       └─ subscribers.subscribe  (mutation)
   │                            ├─ validate email (server-side)
   │                            ├─ dedup via by_email index
   │                            └─ insert { email, createdAt, source }
   ▼
ConvexClientProvider ("use client", mounted in app/layout.tsx around chrome + children)
```

- **Server vs client:** `app/layout.tsx` is a Server Component and must stay one. The Convex client is browser-side, so a thin `"use client"` provider component wraps `{children}` (and the chrome `HeaderNav`/`Footer`, since the Footer hosts a `NewsletterForm`). This mirrors the existing client/server split in `spec/app-shell.md`.
- **Connection config:** the browser client reads `NEXT_PUBLIC_CONVEX_URL` (public by design — it is a deployment URL, not a secret). `npx convex dev` writes it (and `CONVEX_DEPLOYMENT`) into `showcase/.env.local`, which is already git-ignored.
- **Layering:** this is a new **backend domain** (`showcase/convex/*`) plus a provider in the app shell. It does not change primitives, sections, or styling. `NewsletterForm` gains a data dependency but keeps its props and visuals.

---

## 3. Data model

### 3.1 `subscribers` table

| Field       | Type     | Notes |
|-------------|----------|-------|
| `email`     | `string` | Normalised: trimmed + lowercased before storage. The dedup key. |
| `createdAt` | `number` | `Date.now()` at insert (ms epoch). First-seen time. |
| `source`    | `string` | Where the signup came from — `"hero"`, `"h8"`, `"footer"`, or `"unknown"`. Lets us see which placement converts. Optional but defaulted. |

- **Index:** `by_email` on `["email"]` — for O(log n) dedup lookups; never table-scan on submit.
- Convex auto-adds `_id` and `_creationTime`. We keep an explicit `createdAt` anyway so the meaning is ours and survives any future re-seeding/import. ❓ *Open: keep both, or rely on `_creationTime` alone? Default = keep explicit `createdAt`.*

### 3.2 Forward-looking fields (NOT added now, noted so the model is stable)

For the Resend phase these will likely be added; calling them out now prevents a migration surprise:
- `status` (`"pending" | "confirmed"`) for double opt-in.
- `confirmedAt`, `welcomeEmailSentAt` timestamps.

We do **not** add them this iteration. The `subscribe` mutation will be written so adding them later is additive.

---

## 4. The `subscribe` mutation — contract

**Name:** `api.subscribers.subscribe`  ·  **Type:** Convex `mutation`

**Args:**
- `email: string` (required)
- `source: string` (optional; defaults to `"unknown"`)

**Behaviour:**
1. **Normalise** — `email.trim().toLowerCase()`.
2. **Validate** server-side with the same regex contract the client uses (`/^[^@\s]+@[^@\s]+\.[^@\s]+$/`). On failure, **throw** so the client surfaces an error. Server validation is mandatory — never trust the client.
3. **Dedup** — look up the normalised email via `by_email`. If it already exists, **succeed silently** (idempotent: do not insert a duplicate, do not throw). Re-subscribing is a no-op, not an error, and must not leak "you're already subscribed" (avoids disclosing who is on the list).
4. **Insert** `{ email, createdAt: Date.now(), source }` when new.
5. **Return** a small result the UI can branch on — proposed `{ ok: true }` for both new and duplicate. ❓ *Open: also return `{ alreadySubscribed: boolean }`? Default = no, keep it opaque for privacy.*

**Errors:** only invalid email throws (message kept generic). Storage/transport errors propagate as Convex errors → the form shows a generic retry message.

**Resend seam (not implemented now):** step 4 is the natural place to later add `await ctx.scheduler.runAfter(0, internal.emails.sendWelcome, { email })`. The mutation stays pure (DB only); email lives in a Convex **action** (network I/O is not allowed in mutations). No code for this yet — just the documented seam.

---

## 5. Client integration — `NewsletterForm`

The component keeps its **props, layout, accessibility wiring, and visual states** exactly as in `spec/composites.md`. Changes are limited to submit behaviour:

- **Keep** the existing local `EMAIL_RE` check as instant, offline UX feedback (unchanged failure path → inline `role="alert"` error "a valid email, please").
- **On valid submit:** call `useMutation(api.subscribers.subscribe)({ email: email.trim(), source })`.
  - Enter a **pending** state: disable the input + button, optionally soften the button label/opacity. ❓ *Open: show a word ("inscribing…") or just disable? Default = disable + reduced opacity, no label change, to preserve the typographic button.*
  - **On success:** flip `submitted = true` → the existing "Inscribed. A response will arrive in due time." confirmation. Unchanged copy and markup.
  - **On failure (network/server):** clear pending, show an inline error in the brand voice — **Decided: *"the ink did not take — try again"*** (lowercase italic, mirroring the "a valid email, please" error style and reusing the "Inscribed" inscription metaphor). Keep the entered email so the user can retry. Backup wording on hold: *"the inscription faltered — try once more."*
- **`source` prop:** add an optional `source?: string` prop so the three placements identify themselves (`"hero"`, `"h8"`, `"footer"`), defaulting to `"unknown"`. Callers in sections/Footer pass their placement. This is the only new prop and is backward-compatible (`<NewsletterForm />` still valid).

No visual redesign. The success/error **look** is already specified in `SPEC.md` §5.3; we are only making them fire on real outcomes.

---

## 6. Configuration, environment & secrets

- `NEXT_PUBLIC_CONVEX_URL` — public deployment URL, read by the browser client. Lives in `showcase/.env.local` locally (git-ignored) and must be set in **Vercel** project env for preview + production.
- `CONVEX_DEPLOYMENT` — written by the Convex CLI; identifies the deployment for `convex dev`/`deploy`. Not used by the browser.
- No secret values are committed. `.env.local` is already ignored in both root and `showcase/.gitignore`.
- **Deploy model (from `spec/tooling.md`):** `main` auto-deploys to production; PRs get previews. Convex has its own deploy (`npx convex deploy`) that must run for production and ideally be wired into the Vercel build, so the frontend and backend ship together. ❓ *Open: wire `convex deploy` into the Vercel build command now, or deploy Convex manually for the first cut? Default = document it in imp.md; manual for first preview, automated before production.*

---

## 7. Security & privacy

- **Server-side validation is authoritative** — the client regex is UX only.
- **No enumeration leak** — duplicate signups return the same opaque success as new ones; the form never reveals who is already subscribed.
- **Emails are PII** — stored lowercased; not logged in plaintext beyond what Convex records; never exposed to the client (no public query returns the list in this iteration).
- **Rate limiting** — not added this iteration; Convex's platform limits apply. ❓ *Open: add a basic per-deployment rate limit / honeypot field before launch? Default = defer, note as a pre-launch task.*
- `NEXT_PUBLIC_CONVEX_URL` being public is expected and safe — it grants only the access the deployed functions allow, and `subscribe` only writes.

---

## 8. Testing

`NewsletterForm.test.tsx` currently asserts (per `spec/composites.md`): renders field+button, invalid email → `role="alert"`, valid submit swaps to confirmation, custom `buttonLabel` respected. There is **no network mock** because there was no network call. That premise changes.

- **Mock `convex/react`'s `useMutation`** so tests run with no real deployment. The mock returns a stub async fn.
- Preserve all four existing assertions, adapting the "valid submit" test to await the mocked mutation resolving before asserting the confirmation.
- **Add:** valid submit **calls the mutation** with the normalised email (+ `source`); mutation **rejection** shows the generic error and does **not** show the confirmation; pending state disables the control during the in-flight call.
- Keep tests deterministic — no real timers/network; the mock resolves synchronously where possible.

---

## 9. Acceptance criteria (feature-level)

- [ ] A real email submitted through any of the three `NewsletterForm` placements appears as a row in the Convex `subscribers` table.
- [ ] Submitting the **same** email twice yields exactly **one** row and no user-facing error.
- [ ] Submitting an invalid email never hits the network (client guard) and, if forced, is rejected server-side.
- [ ] The form shows pending during the call, the existing "Inscribed." confirmation on success, and a graceful error on failure (email preserved for retry).
- [ ] `app/layout.tsx` remains a Server Component; the Convex client lives only in the `"use client"` provider.
- [ ] `npm run lint`, `npm run test`, `npm run build` all pass in `showcase/`; `package-lock.json` is in sync for `npm ci`.
- [ ] No secrets committed; `NEXT_PUBLIC_CONVEX_URL` documented for Vercel.
- [ ] `spec/convex.md` added and `spec/readme.md` updated so the "signups dropped on the floor" caveat is retired and Convex appears as a domain.

---

## 10. Open questions (do not block drafting `convex-imp.md`)

1. **§3.1** Keep explicit `createdAt` alongside Convex's `_creationTime`? *(default: yes)*
2. **§4** Should `subscribe` return `alreadySubscribed`? *(default: no — keep opaque)*
3. **§5** Pending-state treatment — word vs. plain disable? *(default: plain disable + opacity)*
4. **§5** Exact failure-message copy in the brand voice. **✅ Resolved: *"the ink did not take — try again"*** (drawn from the landing-page liturgical/inscription voice).
5. **§6** Wire `convex deploy` into Vercel build now, or manual first? *(default: manual first cut)*
6. **§7** Add rate-limit/honeypot before launch? *(default: defer, flag as pre-launch)*

Defaults above are what `convex-imp.md` will assume unless you say otherwise.

# Handoff: finish the Calendly wiring via her logged-in dashboard

Written 2026-08-22 for a fresh session. Everything below is verified; nothing is assumed.

## Where things stand

Site is live at www.the-altar-within.com, deployed from `main` (last commit `fa46910`).
Services section was restructured today:

| Card / CTA                      | Price | Key         | Calendly slug                      | Status |
|---------------------------------|-------|-------------|------------------------------------|--------|
| Nav "Book a Session" (x2)       |       | `menu`      | null **on purpose** → landing page | done   |
| Hero "Free Intro Call"          |       | `intro`     | `short-form-consultation-30-min`   | done   |
| Introductory Meeting, 30 min    | Free  | `intro`     | `short-form-consultation-30-min`   | done   |
| 1:1 Psychotherapy, 60–75 min    | $175  | `session`   | `session-1`                        | done   |
| Deep Immersion, 90–120 min      | $275  | `immersion` | null → falls to landing page       | **TODO** |
| Four 1:1 Sessions (band)        | $600  | `fourpack`  | null → falls to landing page       | **TODO** |

UX rule (encoded in `showcase/features/calendly/calendly.ts`): specific intent → specific
event; undecided intent (nav) → the landing page "menu". The two TODOs are null only because
**the events do not exist on her Calendly yet.** That is the whole remaining job.

Live events on calendly.com/thealtarwithin (verified via DevTools 2026-08-22):
- `short-form-consultation-30-min` — "Short Form Consultation", 30 min
- `session-1` — "60-75 Min | Full Immersion Session.", 60–75 min  ← **misnamed**, see task 1
- `content-creation-podcast-collaboration-inquiry` — 45 min, not a service, leave alone

Calendly's REST API **cannot create or edit event types** — dashboard only. Hence the browser.

## Constraints — read before touching anything

- **NO payments.** Do not touch "Collect payment", Stripe, or PayPal anywhere in Calendly. Leo
  decided this explicitly. The $600 is collected outside Calendly.
- This is a client's live public account. Create and rename only what's listed. Do not delete
  anything, do not change availability, do not touch the podcast/collab event.
- Subagents: Haiku by default (per `~/.claude/CLAUDE.md`). Pass `model: "haiku"` explicitly.
- Commit straight to `main` when done — small, safe, matches `BRANCHING-STRATEGY.md`.

## Browser access

A dedicated Chrome profile at `~/chrome-debug/` is logged into Adrianna's Calendly. Launch it
with remote debugging (it was NOT running when this was written — port 9222 empty):

```bash
export DISPLAY=:0 XAUTHORITY=$(ls /run/user/1000/.mutter-Xwaylandauth.* 2>/dev/null | head -1)
google-chrome --user-data-dir="$HOME/chrome-debug" --remote-debugging-port=9222 \
  "https://calendly.com/event_types/user/me" &
sleep 3 && curl -s http://127.0.0.1:9222/json/version   # should return JSON
```

Then drive it with the `mcp__chrome-devtools__*` tools (`list_pages`, `take_snapshot`, `click`,
`fill`, `take_screenshot`). If the profile turns out to be logged out, STOP and tell Leo —
do not attempt to log in.

See `~/notes/chrome-profile-launch.md` for profile background.

## Tasks, in order

### 1. Rename the $175 event
`session-1` is currently titled "60-75 Min | Full Immersion Session." That name now collides
with the site's "Deep Immersion" card. Rename it to exactly:

    1:1 Psychotherapy Session

Leave the duration (60–75) and slug alone. Calendly keeps the slug on rename — verify after
saving that `https://calendly.com/thealtarwithin/session-1` still returns 200.

### 2. Create "Deep Immersion"
New event type → One-on-one.
- Name: `Deep Immersion`
- Duration: custom, **90 min** (Calendly takes one number; 90 is the floor of the 90–120 range
  the site advertises — leave a note in the description that sessions run 90–120)
- Description: "An extended 90–120 minute session for the work that needs room to unfold."
- Everything else: defaults. No payment.
- Record the slug from the event's "Copy link".

### 3. Create "Four 1:1 Sessions"
New event type → One-on-one.
- Name: `Four 1:1 Sessions`
- Duration: **60 min**
- Description: "Book your first of four sessions here — we'll schedule the remaining three
  together at the end of it."
- No payment. No extra questions.
- Record the slug.

### 4. Wire the slugs
In `showcase/features/calendly/calendly.ts`, replace the two nulls:

```ts
  immersion: "<slug from task 2>",
  fourpack: "<slug from task 3>",
```

Then from `showcase/`:
```bash
npx tsc --noEmit -p . && npx eslint features/calendly/calendly.ts && npx next build
```
(One pre-existing lint *warning* in `HeaderNav.tsx:49` is known and unrelated.)

### 5. Verify end to end
On the live site after deploy (~60s after push), each button must open the right event:

```bash
for s in session-1 <immersion-slug> <fourpack-slug>; do
  printf "%-50s " "$s"; curl -s -o /dev/null -w "%{http_code}\n" "https://calendly.com/thealtarwithin/$s"
done
```
All three must be 200. Then open www.the-altar-within.com in the debug Chrome, click each of
the six CTAs, and screenshot the popup title for each — confirm it matches the card.

### 6. Commit
```bash
git add showcase/features/calendly/calendly.ts
git commit -m "Wire Deep Immersion and Four Sessions to their live Calendly events"
git push origin main
```

## Suggested subagent split

Tasks 1–3 are sequential clicks in one browser and share state — **one** agent, not three.
Task 5 verification is a clean second agent. Don't parallelise the dashboard edits.

## Context files
- `specs/calendly.md` — integration spec, has a session addendum to update when done
- `calendly-integration-plan.md` — older plan; its "D3" naming question is resolved by task 1
- `showcase/features/calendly/` — `calendly.ts` (slugs), `useCalendly.ts` (popup), `BookButton.tsx`
- `showcase/components/sections/H7.tsx` — the cards + FourPackBand
- `showcase/components/chrome/HeaderNav.tsx` — nav CTA, uses `menu`

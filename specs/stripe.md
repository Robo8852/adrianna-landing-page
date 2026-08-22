# stripe — payments (BLOCKED on bank account)

Last updated: 2026-08-18

## Decision record

**Chosen: Calendly's native Stripe integration + Stripe Payment Links. No custom code.**
This REVERSES the earlier decision (a custom Convex/Stripe build) recorded in the previous
version of this file — see `specs/stripe.md.bak` for that blueprint. The custom build is
demoted to the graduation path: revisit only if Calendly's payment features become
limiting. Requires Calendly Standard (~$10/mo billed annually); Stripe itself has no
monthly fee, only per-transaction cuts.

## Account facts (confirmed 2026-08-18 with the owner present)

- **Legal entity:** `M.A.J.U. CORP.` — a Florida corporation (Sunbiz).
  Business type in Stripe onboarding is **Corporation**, not individual/sole proprietor.
- **Legal business name** on Stripe must match Sunbiz exactly, punctuation included.
- **Representative / beneficial owner:** Judith Oscorima — her FULL legal name as it
  appears on Sunbiz and government ID (includes middle and maiden name). Decision: use the
  full legal name everywhere internal, for consistency across Sunbiz / IRS / ID / bank.
- **Public-facing name:** "The Altar Within" — the practice name clients recognize.
  NOTE: **not** filed as a fictitious name on Sunbiz.
- **EIN:** obtained. (Corporation cannot onboard on an SSN; her SSN is still required
  separately as the beneficial owner.)
- **US bank account:** NOT YET — in progress. **This is the only hard blocker.**
- Owner is US-licensed but resident in Peru. Peru is not a Stripe-supported country;
  the US entity is what makes the Stripe account possible. Bank account must be a US
  business account in M.A.J.U. CORP.'s name (a personal account will trigger payout holds).

## Duplicate Stripe accounts — resolve before connecting anything

Three accounts appear in Calendly's connect picker:

| Account | Created | Disposition |
|---|---|---|
| "The Altar Within." (trailing period) | Feb 6 | created first, then forgotten |
| "The Altar Within" | Jul 5 | created by mistake, not realizing Feb one existed |
| 1 ineligible account | — | not yet identified |

**Neither has bank info, so neither is activated** — there is no saved state to preserve.
**Decision: keep the Jul 5 account** (clean display name, recovery code on hand at
`~/Downloads/stripe_backup_code_2026-08-18_CURRENT.txt`), abandon the Feb 6 one and the
ineligible third. Connecting the wrong account would strand collected money in an
unactivated account.

## Critical path

1. **US business bank account for M.A.J.U. CORP.** ← blocker, in progress
2. File "The Altar Within" as a Sunbiz fictitious name (~$50) — otherwise the card
   statement descriptor reads `M.A.J.U. CORP.`, which clients won't recognize and will
   dispute. Banks often want this filing before accepting the DBA too.
3. Activate the Jul 5 Stripe account: Corporation, legal name `M.A.J.U. CORP.`, EIN,
   full legal name for the representative, bank account for payouts.
4. Close/ignore the duplicate accounts.
5. Upgrade Calendly to Standard; connect Stripe (Settings -> Payments); pick the Jul 5 account.
6. Set prices on each paid event type; create Payment Links for the package.

## Still unresolved

- Real prices for the three paid cards (`session`, `package`, `coaching`; `intro` free).
- Pay-then-book vs book-then-pay vs pay-at-booking.
- Whether the "ineligible account" is a sandbox or a third real account.
- Two-step authentication is not yet configured on the Stripe login (security settings are
  user-level, not per-environment — the sandbox banner does not sandbox them).

## Code status

**No Stripe code exists, and none is planned** under the chosen approach. Nothing in
`showcase/features/`, no API routes, no Convex tables, no env vars.

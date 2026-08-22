Stripe itself costs nothing to set up — no monthly fee, no setup fee. Stripe only makes money when she makes money: a per-transaction cut. Since you're on the Costa del Sol, the EU rates are the relevant ones — roughly 1.5% + €0.25 per transaction for European cards (higher for UK/international cards, around 2.5–3.25%). A €90 session costs her about €1.60 in fees. That's it.

So the full recurring cost of this whole payments plan is just the Calendly Standard plan (~$10/month billed annually, ~$12 month-to-month) — that's the only new subscription. Everything else is transaction fees she'd pay with any payment processor.

What she actually has to do to set up Stripe (one sitting, maybe 20–30 minutes):

1. Create the account at stripe.com — email, password.
2. Activate it: legal/business details (as a sole practitioner in Spain that's likely her autónomo details or personal info), plus ID verification.
3. Add her bank account (IBAN) for payouts — money lands there automatically, typically a few days after each charge.

Then the part you can drive from the back end: connect Stripe inside Calendly (Settings → Payments), upgrade her Calendly to Standard, set the price on each paid event type, and create Payment Links in the Stripe dashboard for the package. She only has to do steps 1–3 because Stripe needs to verify her identity and her bank account — everything after that is dashboard work you can do with her account access.

Pricing figures are from my training data — worth a 30-second check of stripe.com/es/pricing and calendly.com/pricing when she signs up, but I'd be surprised if they've moved much. Want me to rewrite specs/stripe.md to record this decision (integration + Payment Links, custom build demoted to the graduation path)?

✻ Baked for 20s

❯ She is licensed in the United States, but she lives in Peru right now.

That detail matters a lot — let me verify the current facts on Stripe's country support before answering, since this is exactly the kind of thing that changes.

● Web Search("Stripe supported countries Peru account availability 2026")
Did 1 search in 6s

● Web Search("Calendly collect payments integrations Stripe PayPal supported")
Did 1 search in 7s

Good thing you mentioned that — Peru is not a Stripe-supported country (Stripe supports ~46 countries; in Latin America it's essentially Mexico and Brazil), so she can't open a Peruvian Stripe account. But this probably isn't a blocker, because of the part you said first: she's licensed in the US.

Stripe accounts are tied to where the business is established, not where the owner happens to be sitting. A US-licensed practitioner serving US clients can legitimately run a US Stripe account from abroad — that's a normal setup for Americans overseas. What it requires:

1. SSN (or EIN if she has an LLC) — she'll have this as a US-licensed professional.
2. A US address — a real one she can use for the business (family address, registered agent if she has an entity — not just a mail-forwarding box, Stripe checks).
3. A US bank account for payouts — the big question. If she kept a US checking account when she moved, she's done. If she closed everything, that's the one thing to solve before signup.

If the US-account route doesn't work out, there's a clean fallback: Calendly's payment integration supports PayPal as well as Stripe, and PayPal operates in Peru. The trade-off is that coupon/discount codes only work with the Stripe integration, and PayPal's cross-border fees and PEN withdrawal path are clunkier. I'd treat it as plan B.

One more nice discovery from checking current docs: Calendly's Stripe payments are available on all paid plans, so the Standard plan we discussed is confirmed as the entry point — no additional Calendly fee on top of transaction fees.

So the checklist for her collapses to: confirm she still has a US bank account + usable US address → create the Stripe account with her SSN → done; you handle the Calendly connection and Payment Links from there. The tax side (US self-employment income while resident in Peru) is between her and her accountant — worth a one-line heads-up when you talk to her, but it doesn't change the technical plan.

Sources: Stripe global availability, Stripe supported countries guide, Calendly + Stripe, Calendly + PayPal, Calendly payments

✻ Brewed for 57s

※ recap: Payments plan for Adrianna's site: we chose Calendly's Stripe integration plus Payment Links over the custom Stripe build. Next action: confirm she has a US bank account and address so she can open a US Stripe account, then update specs/stripe.md. (disable recaps in /config)

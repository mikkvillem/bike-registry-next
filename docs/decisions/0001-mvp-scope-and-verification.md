# 0001 — MVP scope, market default, monetization posture, verification model

Date: 2026-09-15
Status: Accepted

## Context

Setting up the project's agent-led workflow (`CLAUDE.md`/`AGENTS.md`)
required a few foundational business decisions up front, so that future
sessions don't have to re-litigate them for every feature.

## Decision

1. **MVP scope**: registry + theft reporting/publishing ships first. The
   auto24-style for-sale marketplace (the `listing` table) is phase 2, not
   part of MVP.
2. **Market**: default to Estonia. Don't hardcode single-locale or
   single-currency assumptions in the architecture, so Baltics/EU expansion
   later doesn't require rework — but expansion itself is not committed to.
3. **Monetization**: none at MVP. No payments in the codebase yet. Optimize
   for growth and trust. Monetization options (paid QR tag fulfillment,
   premium verification, marketplace fees, B2B/insurer deals) get raised
   per-feature as they become relevant, rather than assumed to be "free
   forever."
4. **Verification**: self-attested registration, no proof-of-purchase
   required. Uniqueness enforced at the database level on (serial number,
   make, model) to block duplicate/fraudulent claims of the same physical
   bike. The registrant must supply a contact method, used to resolve
   disputes if a claim is contested.

## Consequences

- `bicycle` schema (`src/db/schema/schema.ts`) needs a `serialNumber` field,
  and likely structured `make`/`model` fields (currently there's no
  make/model at all, only `type`/specs), plus a unique constraint across
  the three. Not yet implemented — flagged as tedious follow-up work, not a
  business decision.
- No payments infrastructure (e.g. Stripe) should be added until a
  monetization decision is made for a specific feature.
- A dispute-resolution flow is implied but not designed — someone still
  needs to decide what happens when a registration/theft report is
  contested. Tracked as an open question in `docs/product-brief.md`.
- i18n-friendly routing/content structure is worth keeping in mind even
  though only Estonian (+ possibly English) ships at launch.

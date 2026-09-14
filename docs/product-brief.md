# Product Brief — Bike Registry (working title)

Living document. Update it whenever a business/market decision changes.
See `docs/decisions/` for the dated log of how we got here.

## The pitch

Estonia's ARK (the national vehicle register) for bicycles, eventually
paired with auto24-style classifieds — but the actual hook is speed and
trust: when a bike is stolen, its owner can publish it as stolen in minutes,
and anyone (a second-hand buyer, a finder, the police) can check a bike's
registration and theft status instantly by scanning a printed QR tag on the
bike itself.

## Problem

- Stolen bikes are hard to prove ownership of and hard to publicize quickly
  today — there's no fast, canonical way to say "this bike is stolen" that
  other people will actually see.
- Second-hand bike buyers (via classifieds, Facebook Marketplace, etc.) have
  no easy way to check whether a bike is stolen before handing over money.
- There's no trusted, canonical registry for bicycles in Estonia, unlike
  cars via ARK (the Estonian Road Administration's vehicle register).

## MVP scope (confirmed 2026-09-15)

1. Bike registration — self-attested, unique per (serial number, make,
   model).
2. Theft reporting — mark a registered bike stolen, publish a public
   stolen-bike listing.
3. Public stolen-bike lookup — search by serial number, or scan a QR code.
4. Printable QR tag per bike, linking to its public status page.

The auto24-style for-sale marketplace (already partially modeled via the
`listing` table) is explicitly **phase 2**, not MVP.

## Market

Default: Estonia. The app should not hardcode single-locale or
single-currency assumptions, so expanding to the rest of the Baltics or EU
later doesn't require rework — but there's no commitment yet to actually
expand beyond Estonia.

## Monetization

None in the MVP — no payment processing in the codebase. Priority is growth
and trust first. Revisit monetization per feature as it comes up, rather
than assuming everything stays free forever. Candidate levers to evaluate
later:

- Paid QR tag fulfillment (physical printing/shipping has a real marginal
  cost, unlike the software).
- Premium or "verified" listing tiers.
- Marketplace transaction/listing fees (phase 2, once for-sale listings
  exist).
- B2B deals — e.g. insurers offering discounts for registered + tagged
  bikes, or bike shops registering bikes at point of sale.

## Trust & verification model

Registration is self-attested — no proof-of-purchase required at MVP.
Fraud/duplicate protection comes from a database-level uniqueness
constraint on (serial number, make, model): the same physical bike can't be
claimed twice. Every registrant supplies a contact method. If a
registration or theft report is disputed (two people claim overlapping
details, or a report looks malicious), it gets resolved by contacting the
registrant — the actual dispute-resolution *process* is not designed yet.

## Personas (draft — refine as we learn more)

- **Proactive registrant** — registers a bike before anything happens, for
  peace of mind and a faster police report if it's ever stolen.
- **Theft victim** — just had a bike stolen, wants maximum visibility fast.
- **Second-hand buyer** — wants to check a bike isn't stolen before buying.
- **Police / finder** — scans a QR tag or looks up a serial number to check
  status.
- **(Phase 2) Seller** — lists an owned, registered bike for sale.

## Open questions

Kept in sync with the "Open business questions" section of `CLAUDE.md`:

- Product/brand name and domain.
- Legal entity, ToS and privacy-policy content.
- QR tag pricing (cost to produce/ship vs. what, if anything, to charge).
- Partnership targets: police (Politsei- ja Piirivalveamet), insurers, bike
  shops, cities/bike-share programs.
- Dispute-resolution process for contested registrations/theft reports.
- Takedown process for a published stolen listing (recovered, false
  report, resolved dispute).

## Changelog

- 2026-09-15 — Initial brief. MVP scope, market default, monetization
  posture, and verification model decided — see
  `docs/decisions/0001-mvp-scope-and-verification.md`.

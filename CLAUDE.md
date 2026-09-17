# CLAUDE.md

Instructions for Claude (and any other coding agent) working in this repo.

## What this is

An Estonian ARK-style official registry for bicycles, eventually paired with an
auto24-style marketplace — but the actual hook is speed and trust when a bike
is stolen: register a bike once, and if it's stolen you can publish it as
stolen in minutes. A printable QR tag stuck to the bike links straight to its
public registration/theft-status page, so a buyer, finder, or police officer
can check it instantly.

Full business context lives in [`docs/product-brief.md`](docs/product-brief.md).
Dated decisions live in [`docs/decisions/`](docs/decisions/).

## How we work together

This project is meant to be agent-led on the *execution* side, but the
business, and design direction is the user's call. Read this section before
starting any non-trivial change.

### Always stop and ask first

- **Business & monetization** — pricing, payment features, fees, anything
  that starts charging money or changes what's free.
- **Branding & marketing** — product/brand naming, public-facing copy tone,
  positioning, taglines, target-audience messaging, go-to-market sequencing.
- **Legal & compliance** — data retention, GDPR specifics, terms of service,
  privacy policy content, liability language, sharing data with law
  enforcement.
- **Trust & safety policy** — verification rigor, moderation rules, dispute
  handling, anything beyond what's already decided in "Confirmed decisions"
  below.
- **Data model changes with business implications** — e.g. new PII fields,
  a "verified" badge, anything that changes what's publicly visible.
- **Go-to-market & partnerships** — police, insurers, bike shops, cities,
  market expansion beyond Estonia.
- **Major architecture/vendor choices** — swapping DB/auth/hosting provider,
  adding a payments processor, choosing SMS/email providers, adding paid
  third-party APIs.
- **Design direction with brand impact** — visual identity, major UX pattern
  shifts (as opposed to small polish within the existing design system).

Ask concisely, propose a recommended option, and wait for an answer before
proceeding. Log the outcome as a new entry in `docs/decisions/`.

### Just do it — no need to ask

- Implementing features that are already decided (routes, server actions,
  schema migrations, forms, plumbing).
- Bug fixes, refactors, typing/lint fixes, dependency bumps.
- Tests, dev tooling, CI config.
- Small UX/visual polish consistent with the existing design system
  (`src/components/framing.tsx`, Tailwind conventions already in use).
- Writing/updating docs, decision log entries, and this file.
- Schema fields/constraints that operationalize a decision already logged
  in `docs/decisions/` (e.g. adding the serial-number uniqueness constraint
  described below — that's tedious execution, not a business decision).

When in doubt about which bucket something falls into, ask.

## Confirmed decisions so far

(Full detail: [`docs/decisions/0001-mvp-scope-and-verification.md`](docs/decisions/0001-mvp-scope-and-verification.md))

- **MVP scope**: registry + theft reporting/publishing ships first. The
  auto24-style for-sale marketplace (the existing `listing` table) is phase 2.
- **Market**: default to Estonia, but don't hardcode single-locale/single-
  currency assumptions — Baltics/EU expansion later shouldn't require rework.
- **Monetization**: none yet. No payments in the codebase. Optimize for
  growth and trust; raise monetization options (paid QR tag fulfillment,
  premium verification, marketplace fees, insurer/B2B deals) per-feature
  rather than assuming "free forever."
- **Verification**: self-attested at registration — no proof-of-purchase
  required. Fraud/duplicate protection comes from a DB-level uniqueness
  constraint on (serial number, make, model): the same physical bike can't
  be registered twice. Registrant must supply a contact method used to
  resolve disputes.

## Open business questions

Ask about these when they become relevant to the feature being built:

- Product/brand name and domain.
- Legal entity, ToS and privacy-policy content.
- Pricing for QR tags (production/shipping cost vs. what to charge, if
  anything).
- Partnership targets: police (Politsei- ja Piirivalveamet), insurers, bike
  shops, cities/bike-share programs.
- Dispute-resolution process when a registration or theft report is
  contested (no flow exists yet — someone has to decide what it looks like).
- How a published stolen listing gets taken down (recovered, false report,
  resolved dispute).

## Stack

Next.js 15 (App Router, Turbopack), React 19, Tailwind v4, Drizzle ORM +
Postgres (Neon), better-auth, Biome for lint/format. See `package.json`.

## Domain model (current state)

- `bicycle` (`src/db/schema/schema.ts`) — owner, specs (type/wheel/weight/
  gears/gender), photos, soft-delete. **No serial number field yet** — needed
  to enforce the uniqueness decision above.
- `listing` — for-sale marketplace listing tied to a bicycle (price,
  isForSale). Phase 2 feature; not part of MVP scope.
- `theft` — theft report tied to a bicycle (description, contact,
  `contactPublic` opt-in flag — see
  [`docs/decisions/0002-public-bike-page-contact-visibility.md`](docs/decisions/0002-public-bike-page-contact-visibility.md)).
  Still minimal: no theft-report creation UI exists yet, and no explicit
  status (active/recovered/resolved) beyond soft-delete — a non-deleted row
  is treated as "active" on the public page.

## QR code concept

Implemented: `src/app/b/[id]/page.tsx` is the public, no-auth bike status
page (registration specs + theft status; contact only shown if the theft
report opted in via `contactPublic`). `src/lib/qr.ts` generates the QR PNG
(`qrcode` package) and `src/app/bikes/[id]/label/route.ts` is an
owner-only, authenticated route that returns a printable PDF label
(`pdf-lib`) with the QR code linking to `/b/[id]`. Label branding is a
placeholder ("Bike Registry" text, no logo) pending the real brand/design
decision — see decision 0002. Base URL for the QR comes from
`NEXT_PUBLIC_SITE_URL` (falls back to the request host) via
`src/lib/site-url.ts`; set `NEXT_PUBLIC_SITE_URL` in production so printed
labels always resolve correctly.

## Where business context lives

- [`docs/product-brief.md`](docs/product-brief.md) — vision, market,
  personas, positioning. Living doc; update as decisions are made.
- [`docs/decisions/`](docs/decisions/) — dated, ADR-style decision log for
  both business and architectural calls. Add an entry whenever an open
  question above gets answered.

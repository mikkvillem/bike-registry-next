# 0002 — Public bike page: theft contact visibility & label branding placeholder

Date: 2026-09-17
Status: Accepted

## Context

Building the printable QR label (PDF export) required a public, no-auth bike
status page (`/b/[id]`) for the QR code to link to, per the QR concept in
`CLAUDE.md`. That page can show an active theft report, whose `contact`
field is PII (phone number/etc). Options considered: always show the
contact publicly, show it only via some in-app messaging system, or make it
owner opt-in per report.

In-app messaging was ruled out for now — it's a real feature (message
threading, notifications, spam/abuse handling) that doesn't exist yet and
is out of scope for a QR-label export task.

## Decision

Contact info on a theft report is owner opt-in, defaulting to hidden.
Added `theft.contactPublic` (boolean, default `false`) to
`src/db/schema/schema.ts`. The public bike page (`src/app/b/[id]/page.tsx`)
only renders `theft.contact` when `contactPublic` is `true`; otherwise it
shows the theft status only and points finders to local police.

No theft-report creation UI exists yet (schema only), so this field can't
be set from the app yet — it will default to `false`/hidden until that flow
is built and exposes the opt-in as a form control.

## Consequences

- Public bike page is safe to expose today: no PII leaks by default even
  once theft reports start getting created directly in the DB.
- Follow-up: when the theft-reporting flow is built, its form needs a
  "share my contact info publicly on this bike's page" checkbox wired to
  `contactPublic`.
- Follow-up: a real in-app messaging alternative to publishing raw contact
  info is still an open idea, not decided against long-term — just not
  built now.

Separately, the same feature needed label branding for the printable PDF
(no product/brand name is decided yet — open question in `CLAUDE.md`). The
label uses the plain placeholder title "Bike Registry", no logo or visual
identity, so it's trivial to swap once a real name/brand is chosen. Actual
branding/visual identity is still an open business question, not decided
here.

- Migration for the new column isn't generated/applied yet — no
  `DATABASE_URL`/migrations exist in this environment. Run
  `npm run db:generate` (and `db:push`/`db:migrate` per the project's usual
  flow) before this ships against a real database.

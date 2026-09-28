# Project Status

**Last updated:** 2026-09-28 — build fixed: restored `theft.contactPublic`, public page only shows published active thefts

Living doc. Every code change updates this file in the same commit/PR (see
the rule in [`../CLAUDE.md`](../CLAUDE.md)). Read top to bottom for a quick
check-in: health first, then what's next, then what's waiting on you.

## Health

- [x] **Builds** — ✅ `tsc` and `next build` pass (once this PR merges).
  Needs `npm run db:push` to add the `theft.contact_public` column.
- [ ] **Lint clean** (`npm run lint`) — ❌ 13 errors from before this PR,
  all in untouched files (formatting, import order, `!` non-null assertions
  on env vars, Tailwind `@theme` at-rule in `globals.css`).
- [ ] **CI** — none. Nothing checks typecheck/lint/build on PRs.
- [ ] **Tests** — none.
- [ ] **DB migrations committed** — ❌ removed in `3aa58c7`; schema only
  reaches the DB via `db:push`.

**MVP readiness:** ~50%. Registration + QR label exist; theft reporting —
the core of the product — has no UI yet.

## MVP scope progress

(Scope from [decision 0001](decisions/0001-mvp-scope-and-verification.md).)

| # | MVP item | State |
|---|----------|-------|
| 1 | Bike registration (self-attested, unique serial+make+model) | ✅ Done — create only; no edit/delete |
| 2 | Theft reporting + publishing | 🟡 Schema only (status, `publishedAt`); no UI |
| 3 | Public lookup by serial number / QR scan | 🟡 QR status page exists; no serial search |
| 4 | Printable QR tag | ✅ Done — PDF label, placeholder branding |

## What's built

- Google sign-in (better-auth), dashboard catalog grid, add-bike form with
  photos, owner-only bike detail page.
- `bicycle` has make/model/serial with a case-insensitive uniqueness index
  on non-deleted rows.
- `theft` has status (`active`/`recovered`/`resolved`), `publishedAt`, and a
  one-active-report-per-bike index.
- Public no-auth status page `/b/[id]`; owner-only PDF QR label
  `/bikes/[id]/label`.

## Next up (agent can do — already decided)

Ordered by priority.

1. [x] ~~**Fix the build**~~ — done 2026-09-28.
2. [ ] **Theft report flow** — owner marks bike stolen (description,
   date/place, contact, contact-public opt-in), publishes it, later marks
   recovered/resolved.
3. [ ] **Public serial-number lookup** for second-hand buyers.
4. [ ] **Public stolen-bikes feed** — recent-first list of published thefts.
5. [ ] **Edit / delete bike** — serial typos are currently unfixable.
6. [ ] **Form error handling** — duplicate serial etc. shown inline
   (`useActionState`) instead of a raw thrown error.
7. [ ] **Regenerate + commit DB migrations.**
8. [ ] **CI** (typecheck, lint, build) and a few tests (uniqueness,
   theft status transitions). Fix the old lint errors first so CI can
   start green.
9. [ ] **Polish basics** — 404 page, page metadata, OpenGraph cards on
   `/b/[id]` so shared stolen-bike links preview well.

## Design to hone

- [ ] **Public `/b/[id]` page** — highest-traffic page, least designed.
  Bring into the framed design system; phone-first, glanceable STOLEN /
  REGISTERED state, then photos, then identifying details (make, model are
  missing today).
- [ ] **Stolen-state treatment** — strong visual + an "I've seen this bike"
  action (who it contacts is a decision for you, see below).
- [ ] **Estonian UI** — all copy is hardcoded English; set up i18n (ET
  first, EN second) while it's cheap.
- [ ] **Add-bike form** — shorter, serial first with a "where to find it"
  hint (under the bottom bracket), optional specs collapsed.
- [ ] **QR label** — placeholder design; waiting on size/format + branding.

## Waiting on you (decisions)

- [ ] **Product name + domain** — blocks label, public copy, OG cards.
- [ ] **Show the full serial number publicly on `/b/[id]`?** — helps
  finders/buyers match the bike; it's a data-visibility call.
- [ ] **Theft report contact** — direct phone/email, relay via the app, or
  police only?
- [ ] **Theft takedown / disputes** — owner marks recovered; what about
  false reports and contested claims?
- [ ] **Photo storage vendor** — uploads currently go to local disk
  (`public/uploads`), which won't persist on Vercel/serverless. Options:
  Vercel Blob, S3, Cloudflare R2.
- [ ] **Email/notifications** — send any email at all (e.g. "your bike's page
  was scanned")? Which provider?
- [ ] **Privacy policy + ToS** — needed before real users (PII + theft
  claims).
- [ ] **QR label size/format and branding** (see decision 0002).

## Changelog

Newest first. One line per merged change.

- 2026-09-28 — Fixed build: restored `theft.contactPublic` (default
  hidden, decision 0002); `/b/[id]` shows "stolen" only for
  `status = 'active'` reports with `publishedAt` set, dated by publish date.
- 2026-09-28 — Added this status doc and the rule to keep it current.

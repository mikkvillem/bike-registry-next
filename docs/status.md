# Project Status

**Last updated:** 2026-09-28 — bike photos on Cloudflare R2 (direct browser uploads)

Living doc. Every code change updates this file in the same commit/PR (see
the rule in [`../CLAUDE.md`](../CLAUDE.md)). Read top to bottom for a quick
check-in: health first, then what's next, then what's waiting on you.

## Health

- [x] **Builds** — `tsc` + `next build` pass on the R2 photo branch
  (2026-09-28).
- [ ] **Photo storage configured** — ⚠️ R2 code is in, but the bucket,
  CORS, token and `R2_*` env vars need setting up — follow
  [`r2-setup.md`](r2-setup.md). Until then photos go to local disk.
- [ ] **DB schema applied** — ⚠️ the real DB still needs a push after this
  PR merges: adds `theft.contact_public`, `theft.stolen_on`,
  `theft.location` (additive, no data loss). Actions → **DB push** → Run
  workflow on `main`, type `push`. `DATABASE_URL` secret is set.
- [ ] **Lint clean** (`npm run lint`) — ❌ 13 errors from before this PR,
  all in untouched files (formatting, import order, `!` non-null assertions
  on env vars, Tailwind `@theme` at-rule in `globals.css`).
- [ ] **CI** — none. Nothing checks typecheck/lint/build on PRs.
- [ ] **Tests** — none.
- [ ] **DB migrations committed** — ❌ removed in `3aa58c7`; schema only
  reaches the DB via `db:push`.

**MVP readiness:** ~70%. Registration, QR label, and theft reporting
exist; missing public serial lookup and a stolen-bikes feed.

## MVP scope progress

(Scope from [decision 0001](decisions/0001-mvp-scope-and-verification.md).)

| # | MVP item | State |
|---|----------|-------|
| 1 | Bike registration (self-attested, unique serial+make+model) | ✅ Done — create only; no edit/delete |
| 2 | Theft reporting + publishing | ✅ Done — report, publish, recovered, withdraw; no edit yet |
| 3 | Public lookup by serial number / QR scan | 🟡 QR status page exists; no serial search |
| 4 | Printable QR tag | ✅ Done — PDF label, placeholder branding |

## What's built

- Google sign-in (better-auth), dashboard catalog grid, add-bike form with
  photos, owner-only bike detail page.
- Photos upload from the browser straight to Cloudflare R2 via presigned
  URLs (`src/lib/storage.ts`); max 8 × 10 MB; local-disk fallback in dev.
- `bicycle` has make/model/serial with a case-insensitive uniqueness index
  on non-deleted rows.
- `theft` has status (`active`/`recovered`/`resolved`), `publishedAt`,
  `stolenOn`, `location`, and a one-active-report-per-bike index.
- Theft flow: owner's bike page → **Report stolen** (`/bikes/[id]/theft/new`:
  date, place, details, contact + public opt-in, "publish now" on by
  default) → publish later if saved as draft → **Mark recovered** or
  **Withdraw** (soft-delete, for mistakes). Past reports listed on the bike
  page; dashboard shows a **Stolen** badge.
- Public no-auth status page `/b/[id]` (stolen banner shows date, place,
  details; contact only if opted in); owner-only PDF QR label
  `/bikes/[id]/label`.

## Next up (agent can do — already decided)

Ordered by priority.

1. [x] ~~**Fix the build**~~ — done 2026-09-28.
2. [x] ~~**Theft report flow**~~ — done 2026-09-28. Follow-ups: edit an
   open report; confirm step before "Mark recovered"/"Withdraw" (one click
   today).
3. [ ] **Public serial-number lookup** for second-hand buyers.
4. [ ] **Public stolen-bikes feed** — recent-first list of published thefts.
5. [ ] **Edit / delete bike** — serial typos are currently unfixable.
6. [ ] **Form error handling** — duplicate serial etc. shown inline
   (`useActionState`) instead of a raw thrown error.
7. [ ] **Regenerate + commit DB migrations.**
8. [ ] **CI** (typecheck, lint, build) and a few tests (uniqueness,
   theft status transitions). Fix the old lint errors first so CI can
   start green.
9. [ ] **Photo follow-ups** — clean up orphaned R2 uploads from abandoned
   forms; convert HEIC to JPEG (doesn't render outside Safari); add/remove
   photos on an existing bike.
10. [ ] **Polish basics** — 404 page, page metadata, OpenGraph cards on
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

- [ ] **Run the "DB push" workflow** once this PR is merged (see Health).
- [ ] **Theft date/place/details are public once published** — seemed
  implied by "publish it as stolen"; say if any of it should stay private.
  (Decision 0003.)
- [ ] **Product name + domain** — blocks label, public copy, OG cards.
- [ ] **Show the full serial number publicly on `/b/[id]`?** — helps
  finders/buyers match the bike; it's a data-visibility call.
- [ ] **Theft report contact** — direct phone/email, relay via the app, or
  police only?
- [ ] **Theft takedown / disputes** — owner marks recovered; what about
  false reports and contested claims?
- [ ] **Set up R2** — create bucket, public domain, CORS, API token, env
  vars ([`r2-setup.md`](r2-setup.md)). Send me the public URL if you want
  me to double-check config.
- [ ] **Email/notifications** — send any email at all (e.g. "your bike's page
  was scanned")? Which provider?
- [ ] **Privacy policy + ToS** — needed before real users (PII + theft
  claims).
- [ ] **QR label size/format and branding** (see decision 0002).

## Changelog

Newest first. One line per merged change.

- 2026-09-28 — Photos on Cloudflare R2 (decision 0004): presigned direct
  uploads, `src/lib/storage.ts`, `BikeForm` client wrapper, `.env.example`,
  `docs/r2-setup.md`. Adds `@aws-sdk/client-s3` + presigner.

- 2026-09-28 — Theft report flow (`/bikes/[id]/theft/new`, actions in
  `src/app/bikes/[id]/theft/actions.ts`); `theft.stolenOn` + `location`
  columns; stolen banner details on `/b/[id]`; dashboard Stolen badge.
  `DATABASE_URL` secret added by owner.

- 2026-09-28 — Added `.github/workflows/db-push.yml`: manually triggered
  `drizzle-kit push` using the `DATABASE_URL` secret; data-loss statements
  need an explicit opt-in. `drizzle.config.ts` skips the strict prompt in CI.

- 2026-09-28 — Fixed build: restored `theft.contactPublic` (default
  hidden, decision 0002); `/b/[id]` shows "stolen" only for
  `status = 'active'` reports with `publishedAt` set, dated by publish date.
- 2026-09-28 — Added this status doc and the rule to keep it current.

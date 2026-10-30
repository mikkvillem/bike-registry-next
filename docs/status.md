# Project Status

**Last updated:** 2026-10-30 — refreshed this branch onto `main`: infra is
live (R2, DB, production deploy, Google OAuth), and this branch adds the
stolen feed, CI, tests, migrations and inline form errors

Living doc. Every code change updates this file in the same commit/PR (see
the rule in [`../CLAUDE.md`](../CLAUDE.md)). Read top to bottom for a quick
check-in: health first, then what's next, then what's waiting on you.

**Working async?** [`rollout.md`](rollout.md) is the critical path to launch
and [`questions.md`](questions.md) is where the agent parks decisions it
needs from you — answer there, inline, whenever you have a minute.

## Health

- [x] **Builds** — `tsc` + `next build` pass (2026-10-17).
- [x] **Photo storage configured** — R2 bucket live, all five `R2_*` vars
      set locally and on Vercel.
- [x] **DB schema applied** — verified 2026-10-28 against the live Neon DB:
      `theft` has `contact_public`, `stolen_on`, `location`. All seven
      tables present.
- [x] **Lint clean** (`npm run lint`) — 0 errors (2026-10-17).
- [x] **CI** — `.github/workflows/ci.yml` runs lint, typecheck, tests and
      build on PRs and `main`. ⚠️ Consider making it a required check in
      branch protection.
- [x] **Tests** — `npm test` (vitest + in-memory Postgres via PGlite, applied
      from the committed migration): serial uniqueness and theft rules. No
      UI/server-action tests yet.
- [x] **DB migrations committed** — `src/db/migrations/0000_*.sql`, used by
      the tests. ⚠️ The real DB is still managed with `db:push`; don't run
      `db:migrate` against it (tables already exist). Regenerate with
      `npm run db:generate` whenever the schema changes.
- [ ] **Preview deploys work** — ❌ the Vercel check on PR #12 fails at
      build: the env vars are scoped to Production only, and since `requireEnv`
      landed a missing var fails `next build` outright. Production itself is
      unaffected. See [`questions.md`](questions.md).
- [x] **Production deploy works** — `https://bike-registry-next.vercel.app`
      serves 200 on `/` and `/search`, and the serial lookup queries the live
      Neon DB without error (verified 2026-10-28). Google OAuth redirect URI
      verified accepted by Google 2026-10-29; an actual signed-in round trip
      is still untested.

**MVP readiness:** all four scope items plus the public stolen feed are
built, and infra is live. Remaining blockers are your decisions
(privacy/ToS, product name) and the public-surface design work in
[`rollout.md`](rollout.md) stages 2–3.

## MVP scope progress

(Scope from [decision 0001](decisions/0001-mvp-scope-and-verification.md).)

| #   | MVP item                                                    | State                                                                |
| --- | ----------------------------------------------------------- | -------------------------------------------------------------------- |
| 1   | Bike registration (self-attested, unique serial+make+model) | ✅ Done — create, edit details, delete; photos editable on bike page |
| 2   | Theft reporting + publishing                                | ✅ Done — report, publish, recovered, withdraw; no edit yet          |
| 3   | Public lookup by serial number / QR scan                    | ✅ Done — `/search` page with theft status                           |
| 4   | Printable QR tag                                            | ✅ Done — PDF label, placeholder branding                            |

## What's built

- Google sign-in (better-auth), dashboard catalog grid, add-bike form with
  photos, owner-only bike detail page.
- Photos are converted to WebP in the browser (≤2560 px, EXIF/GPS
  stripped; `src/lib/image-convert.ts`), then upload straight to
  Cloudflare R2 via presigned URLs (`src/lib/storage.ts`); max 8 × 10 MB;
  local-disk fallback in dev. Photos are optional at registration; the
  owner's bike page can add/remove them any time (removal deletes the file).
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
3. [x] ~~**Public serial-number lookup**~~ — done 2026-10-05.
4. [x] ~~**Public stolen-bikes feed**~~ — done 2026-10-17 (`/stolen`, latest
       50; no pagination or location filter yet).
5. [x] ~~**Edit / delete bike**~~ — done 2026-10-07. Follow-up: edit
       re-checks uniqueness only via the DB index (raw error shown on clash
       until item 6).
6. [x] ~~**Form error handling**~~ — done 2026-10-17 for add/edit bike
       (actions return `{ error }`; thrown messages are hidden in
       production). Theft-report actions still throw — same fix needed.
7. [x] ~~**Commit DB migrations**~~ — done 2026-10-17 (see Health).
8. [x] ~~**CI + tests**~~ — done 2026-10-17. Follow-up: tests for server
       actions / UI.
9. [ ] **Photo follow-ups** — clean up orphaned R2 uploads from abandoned
       forms; reorder photos / pick the cover photo; HEIC picked on desktop
       Chrome/Firefox is rejected (can't decode) — add a WASM HEIC decoder if
       that turns out to matter.
10. [x] ~~**Polish basics**~~ — done 2026-10-17: 404 page, title template,
        OpenGraph/Twitter cards on `/b/[id]` ("STOLEN: make model" + first
        photo). Set `NEXT_PUBLIC_SITE_URL` in production so card URLs resolve.
11. [ ] **Theft-report form errors** — `reportTheft` validation errors
        (date etc.) are thrown, so production shows a generic message.

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

All open decisions now live in [`questions.md`](questions.md), with a
recommended default for each so the loop can keep moving while you think.
Answer them inline there. Summary of what's open:

- Q1 product name + domain · Q2 public serial visibility · Q3 "I've seen
  this bike" contact · Q4 email provider · Q5 privacy/ToS · Q6 disputes ·
  Q7 QR label format.
- Infrastructure is done: R2, DB schema, a working production deploy, and
  Google OAuth redirect URIs verified. Two by-hand items are left, both in
  [`questions.md`](questions.md): publish the OAuth consent screen before
  launch, and decide whether signed-in Vercel previews matter.

## Changelog

Newest first. One line per merged change.

- 2026-10-30 — Refreshed this branch onto `main` (docs conflict only) so it
  can be merged; no code changes since 2026-10-18. Also diagnosed the failing
  Vercel check: `requireEnv` makes `next build` fail when an env var is
  missing, and the Vercel vars are not scoped to Preview — see
  [`questions.md`](questions.md).

- 2026-10-18 — Regenerated `pnpm-lock.yaml` for the new dev deps (vitest, PGlite); fixes `ERR_PNPM_OUTDATED_LOCKFILE` on deploy. Both `package-lock.json` and `pnpm-lock.yaml` are committed — keep them in sync or drop one.

- 2026-10-17 — Public stolen-bikes feed (`/stolen`) + nav links; add/edit
  bike actions return inline errors; lint fixed (`requireEnv` helper, Biome
  CSS override) and CI added; vitest + PGlite tests; first migration
  committed; `not-found` page, title template, OG/Twitter cards on `/b/[id]`.

- 2026-10-29 — Google OAuth production URLs added and verified: the
  authorization URL carries the right `redirect_uri` and Google accepts it.

- 2026-10-28 — Production env vars set on Vercel; the deploy now serves
  `/` and `/search` and queries the live DB. Infra is no longer a blocker.

- 2026-10-28 — Verified live infra: R2 configured and Neon schema already
  pushed (both Health boxes ticked). Found the Vercel deployment 500s on
  every route because the env vars live only in the gitignored local `.env`.

- 2026-10-28 — Async rollout setup: `/advance` slash command (one unit of
  work per run, opens a PR, parks blocked decisions), `docs/rollout.md`
  (critical path to launch), `docs/questions.md` (answer-inline question
  inbox). No code changes.

- 2026-10-15 — Fix `BetterAuthError: Drizzle schema mismatch`: `drizzleAdapter` in `src/lib/auth.ts` now gets `schema: authSchema`.

- 2026-10-05 — Public serial-number lookup at `/search` — second-hand buyers
  can search bikes by serial number and see theft status before purchase;
  links to full bike details and public status page.

- 2026-09-29 — Add/remove photos on the owner's bike page
  (`src/app/bikes/[id]/photos/`); photo limit enforced atomically in SQL;
  removed photos deleted from R2. Shared photo pipeline split into
  `src/lib/photo-upload.ts` (browser) and `src/lib/bike-photos.ts` (server).

- 2026-09-29 — Photos converted to WebP client-side before upload
  (canvas, WASM fallback for Safari via `@jsquash/webp`); resized to
  2560 px, metadata stripped; server accepts WebP only.

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

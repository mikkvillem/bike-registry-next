# Project Status

**Last updated:** 2026-10-28 — async rollout loop set up; production is live and serving at bike-registry-next.vercel.app

Living doc. Every code change updates this file in the same commit/PR (see
the rule in [`../CLAUDE.md`](../CLAUDE.md)). Read top to bottom for a quick
check-in: health first, then what's next, then what's waiting on you.

**Working async?** [`rollout.md`](rollout.md) is the critical path to launch
and [`questions.md`](questions.md) is where the agent parks decisions it
needs from you — answer there, inline, whenever you have a minute.

## Health

- [x] **Builds** — `tsc` + `next build` pass on the R2 photo branch
      (2026-09-29).
- [x] **Photo storage configured** — R2 bucket live, all five `R2_*` vars
      set **in the local `.env` only**. Not yet set on Vercel.
- [x] **DB schema applied** — verified 2026-10-28 against the live Neon DB:
      `theft` has `contact_public`, `stolen_on`, `location`. All seven
      tables present.
- [ ] **Lint clean** (`npm run lint`) — ❌ 13 errors from before this PR,
      all in untouched files (formatting, import order, `!` non-null assertions
      on env vars, Tailwind `@theme` at-rule in `globals.css`).
- [ ] **CI** — none. Nothing checks typecheck/lint/build on PRs.
- [ ] **Tests** — none.
- [ ] **DB migrations committed** — ❌ removed in `3aa58c7`; schema only
      reaches the DB via `db:push`.
- [x] **Production deploy works** — `https://bike-registry-next.vercel.app`
      serves 200 on `/` and `/search`, and the serial lookup queries the live
      Neon DB without error (verified 2026-10-28). Google sign-in on
      production is untested — see **Next up**.

**MVP readiness:** ~80%. Registration, QR label, theft reporting, and public
serial lookup exist; missing a stolen-bikes feed.

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
4. [ ] **Public stolen-bikes feed** — recent-first list of published thefts.
5. [x] ~~**Edit / delete bike**~~ — done 2026-10-07. Follow-up: edit
       re-checks uniqueness only via the DB index (raw error shown on clash
       until item 6).
6. [ ] **Form error handling** — duplicate serial etc. shown inline
       (`useActionState`) instead of a raw thrown error.
7. [ ] **Regenerate + commit DB migrations.**
8. [ ] **CI** (typecheck, lint, build) and a few tests (uniqueness,
       theft status transitions). Fix the old lint errors first so CI can
       start green.
9. [ ] **Photo follow-ups** — clean up orphaned R2 uploads from abandoned
       forms; reorder photos / pick the cover photo; HEIC picked on desktop
       Chrome/Firefox is rejected (can't decode) — add a WASM HEIC decoder if
       that turns out to matter.
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

All open decisions now live in [`questions.md`](questions.md), with a
recommended default for each so the loop can keep moving while you think.
Answer them inline there. Summary of what's open:

- Q1 product name + domain · Q2 public serial visibility · Q3 "I've seen
  this bike" contact · Q4 email provider · Q5 privacy/ToS · Q6 disputes ·
  Q7 QR label format.
- Infrastructure is done: R2, DB schema, and a working production deploy.
  The only remaining by-hand item is the Google OAuth production callback,
  and only if sign-in turns out to be broken there.

## Changelog

Newest first. One line per merged change.

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

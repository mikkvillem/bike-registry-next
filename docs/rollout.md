# Rollout plan

The critical path from "~80% MVP" to a public URL real people in Estonia can
use. The agent loop (`/advance`) works top to bottom and ticks items here.

**Definition of rollout:** a stranger can scan a QR tag on a bike, or type a
serial into a search box, and learn whether that bike is registered and
whether it is stolen — on a page that loads on a phone, in Estonian, at a
real domain, without an account.

Note what that excludes. Owner-side polish, the marketplace, and email are
all off the critical path. A rollout where only strangers' flows are good is
a valid rollout.

---

## Stage 1 — Make it safe to ship (no user-visible change)

Nothing here needs a decision from you. This is the loop's first work.

- [x] **Fix the 13 existing lint errors** so CI can start green.
- [x] **CI workflow** — typecheck, lint, build on every PR. ⚠️ Not a
      required check in branch protection yet.
- [x] **Regenerate and commit DB migrations.** `src/db/migrations/0000_*.sql`
      is committed and the tests apply it. ⚠️ The live DB is still managed
      with `db:push`; moving it to `db:migrate` is a follow-up.
- [x] **Form error handling** — add/edit bike and the theft report all
      return `{ error }` and show it inline.
- [x] **A few tests** — vitest + PGlite cover serial uniqueness and theft
      status transitions, plus unit tests for theft-date validation.
- [x] **Server-action tests** — the four theft actions run against in-memory
      Postgres, including the authorization boundary (a stranger or a
      signed-out visitor cannot report, publish, recover or withdraw someone
      else's bike). 62 tests total. Found and fixed a bug: the duplicate
      theft-report message was never reached.

## Stage 2 — Make the public surface good

This is the product. Most of the remaining value is in these four items.

- [x] **Redesign `/b/[id]`** — phone-first. Full-width status band (red
      panel when stolen, the inverted neutral panel when not), then make and
      model, then a large cover photo plus thumbnails, then the theft report,
      then the registration specs. In the framed design system, dark-mode
      safe. Layout split into `src/app/b/[id]/bike-status.tsx` so it renders
      without a database. Serial number still absent, pending Q2.
- [x] **Landing page copy** — decision 0006. Says what the registry is, and
      the primary button is the serial check, which needs no account: the
      page used to offer a visitor nothing but a Google sign-in, shutting out
      the buyer and the finder.
- [ ] **Stolen-state treatment** — strong visual plus the "I've seen this
      bike" action. Behind Q3.
- [x] **Public stolen-bikes feed** — `/stolen`, latest 50 published thefts,
      recent-first. ⚠️ No pagination or location filter yet.
- [x] **404 page, page metadata, OpenGraph cards on `/b/[id]`** so a shared
      stolen-bike link previews with the bike's photo. Uses the placeholder
      name per Q1; renaming is a one-file change.

## Stage 3 — Make it Estonian

- [x] **i18n setup, ET first and EN second.** `src/lib/i18n.ts` +
      `src/lib/dictionaries/`, locale from a cookie then `Accept-Language`,
      ET default, ET/EN switcher in the header. URL-vs-cookie is Q8.
- [x] **Translate the public surface.** Header nav, 404, `/stolen`,
      `/b/[id]`, `/search`, the auth buttons and — since 2026-11-23 — the
      landing page, which was held back until its copy was settled (Q9,
      decision 0006). Owner-side screens stay English at launch.
      ⚠️ The Estonian throughout is an agent first pass and wants a native
      read-through.

## Stage 4 — Legal and launch

- [x] **`/privacy` and `/terms` routes** exist with clearly-marked
      placeholder content, `noindex`, and nothing linking to them yet. Behind
      Q5 for the real text and the legal entity — linking them from the UI is
      part of that follow-up.
- [x] **Deployed and serving** — Vercel, `bike-registry-next.vercel.app`,
      env vars set, querying the live DB. Stage 2 work can now be checked on
      the real site.
- [ ] **Smoke test on a real phone** — register a bike, print a label, scan
      it, report it stolen, find it by serial.

## Stage 5 — After launch

Explicitly not blocking. Listed so the loop doesn't drift into them.

- Owner-side polish: confirm steps before "Mark recovered" and "Withdraw",
  editing an open theft report, photo reordering and cover photo.
- Orphaned R2 upload cleanup.
- HEIC decoding on desktop Chrome and Firefox.
- The auto24-style marketplace (phase 2 per decision 0001).
- Email and notifications.

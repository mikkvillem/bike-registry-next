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

- [ ] **Fix the 13 existing lint errors** so CI can start green.
- [ ] **CI workflow** — typecheck, lint, build on every PR.
- [ ] **Regenerate and commit DB migrations.** Schema currently only reaches
      the DB via `db:push`, which is not a deploy story.
- [ ] **Form error handling** — duplicate serial and friends shown inline via
      `useActionState`, not as a raw thrown error page.
- [ ] **A few tests** — serial uniqueness, theft status transitions. These
      two are where a bug costs trust.

## Stage 2 — Make the public surface good

This is the product. Most of the remaining value is in these four items.

- [ ] **Redesign `/b/[id]`** — phone-first, glanceable STOLEN / REGISTERED
      state, then photos, then make/model/specs (make and model are missing
      from the page today). Bring into the framed design system.
- [ ] **Stolen-state treatment** — strong visual plus the "I've seen this
      bike" action. Behind Q3.
- [ ] **Public stolen-bikes feed** — recent-first list of published thefts.
      The shareable surface; this is what gets linked in Facebook groups.
- [ ] **404 page, page metadata, OpenGraph cards on `/b/[id]`** so a shared
      stolen-bike link previews with the bike's photo. Behind Q1 for the
      name.

## Stage 3 — Make it Estonian

- [ ] **i18n setup, ET first and EN second.** All copy is hardcoded English
      today. Doing this before Stage 2's copy is written saves redoing it, so
      the loop should land the i18n scaffolding early in Stage 2.
- [ ] **Translate the public surface.** Owner-side screens can stay English
      at launch.

## Stage 4 — Legal and launch

- [ ] **`/privacy` and `/terms` routes** with placeholder content. Behind Q5
      for the real text.
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

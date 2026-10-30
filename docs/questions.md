# Question inbox

**How this works.** The agent loop (`/advance`) writes questions here when it
hits something only you can decide. It does **not** wait for you — it picks a
provisional default and keeps building. Answer whenever you have a minute.

**To answer:** type on the `**Answer:**` line. That's it. Free text is fine —
"yes", "option B", "call it Velotser, grab the .ee". The next loop iteration
harvests every answered question, logs it in `docs/decisions/`, and reworks
anything that was built on a now-wrong default.

Questions are ordered by how hard they block the rollout.

---

## Open

### Q1 — Product name and domain

**Blocks:** public copy, QR label branding, OpenGraph cards, the domain you
deploy to. Everything a user sees. Cheap to change today, expensive after
launch and after any labels get printed.

**Recommended default:** keep "Bike Registry" as a placeholder; the loop will
route every user-facing name through one constant so a rename is a one-line
change.

**Answer:**

---

### Q2 — Show the full serial number on the public page?

**Blocks:** the `/b/[id]` public page design, which is the highest-traffic
page and the least designed.

**Options:** show it in full (best for finders and buyers matching a bike),
mask it partially (e.g. last 4 chars, enough to confirm but not to forge a
claim), or hide it entirely and only confirm a match via `/search`.

**Recommended default:** mask to the last 4 characters. A buyer can still
confirm the bike in front of them; a thief can't copy a serial off the page.

**Answer:**

---

### Q3 — Who does "I've seen this bike" contact?

**Blocks:** the stolen-state call to action, which is the point of the whole
product.

**Options:** the owner's contact directly (only if they opted in), a relay
through the app (needs email sending, see Q4), or a "report to police"
pointer with no messaging at all.

**Recommended default:** show the owner's contact when they opted in; show a
police pointer when they didn't. No relay until email exists.

**Answer:**

---

### Q4 — Email: send any at all, and via which provider?

**Blocks:** relayed contact, scan notifications, any account recovery.

**Recommended default:** none for MVP. Ship without email; it is not on the
critical path to a first public page.

**Answer:**

---

### Q5 — Privacy policy and terms of service

**Blocks:** taking real users. You are collecting PII and theft claims in the
EU. The loop will not write legal copy.

**Needed from you:** the legal entity (you personally, or an OÜ?) and either
the text or a decision to use a template service.

**Recommended default:** the loop builds the `/privacy` and `/terms` routes
with a clearly-marked placeholder, so the pages exist and the content slots
in later.

**Answer:**

---

### Q6 — Theft takedown and disputes

**Blocks:** nothing today, but it's the first thing that bites after a real
false report.

**Options:** owner self-serve only (mark recovered / withdraw — what exists
now), or add an appeal route where a contested registration gets flagged.

**Recommended default:** keep self-serve for MVP; log this as a known gap.

**Answer:**

---

### Q7 — QR label size, format, and branding

**Blocks:** printing real labels. Not the web rollout.

**Options:** keyring tag, small vinyl sticker (circle or square), or a
printable A4/Letter sheet of several.

**Recommended default:** A4 sheet of stickers, since it needs no fulfillment
and no money changing hands.

**Answer:**

---

## Infrastructure you need to do by hand

The loop can't do these — they need your accounts.

- [x] **Cloudflare R2** — done. Bucket live, all five `R2_*` vars in the
      local `.env`.
- [x] **DB schema pushed** — done. Verified against the live Neon DB on
      2026-10-28.
- [x] **Host picked** — Vercel, at `bike-registry-next.vercel.app`.
- [x] **Env vars set on Vercel** — done 2026-10-28. Production serves and
      queries the live DB.

- [x] **Google OAuth: production URLs added** — done 2026-10-29 and verified: Google Cloud console →
      APIs & Services → Credentials → your OAuth 2.0 Client ID.

      Authorized redirect URIs (keep the localhost one, add the first):
      ```
      https://bike-registry-next.vercel.app/api/auth/callback/google
      http://localhost:3000/api/auth/callback/google
      ```

      Authorized JavaScript origins:
      ```
      https://bike-registry-next.vercel.app
      http://localhost:3000
      ```

      Verified end to end without signing in: production's
      `/api/auth/sign-in/social` hands back an authorization URL whose
      `redirect_uri` is exactly the production callback above, and following
      that URL redirects to Google's sign-in page rather than an
      `Error 400: redirect_uri_mismatch` page. The URI is accepted.

- [ ] **Publish the OAuth consent screen before launch.** Still unverified —
      this one only shows itself *after* a successful login, so the checks
      above cannot see it. While it is in
      *Testing*, only accounts on the test-user list can sign in, and refresh
      tokens expire after 7 days. Going to *In production* with the
      non-sensitive scopes this app uses (email, profile) does not require
      Google review.

- [ ] **Scope the env vars to Preview, not just Production.** Found
      2026-10-30: the Vercel check on PR #12 fails at build, not at runtime.
      Since that PR, `DATABASE_URL`, `GOOGLE_CLIENT_ID`,
      `GOOGLE_CLIENT_SECRET` and `BETTER_AUTH_SECRET` are read through
      `requireEnv` (`src/lib/env.ts`), which throws when one is missing —
      and `next build` evaluates those modules while collecting page data,
      so a missing variable fails the build outright. Reproduced locally:
      building with the four vars blanked dies with
      `Error: DATABASE_URL is not set`. CI passes only because
      `.github/workflows/ci.yml` injects placeholder values.

      Fix: Vercel → Settings → Environment Variables, tick **Preview** (and
      Development, for convenience) on those four. A preview needs
      `DATABASE_URL` at runtime anyway, so there is no code change that
      makes previews genuinely work without it.

- [ ] **Decide about Vercel preview deployments.** Each PR gets a unique
      `*.vercel.app` host that will never match the redirect URI list, so
      Google sign-in is broken on previews by design. Fine if you only use
      previews to eyeball public pages; if you need signed-in previews, the
      fix is a stable staging domain.

---

## Answered

Nothing yet. Answered questions move here with a pointer to their entry in
`docs/decisions/`.

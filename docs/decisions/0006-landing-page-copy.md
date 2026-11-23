# 0006 — Landing page copy and primary action

Date: 2026-11-23
Status: Accepted

Answers [Q9](../questions.md) ("The landing page still sells the old
product").

## Context

The landing page was inherited from when this was a personal bike catalogue:
"Your bikes, catalogued" / "The bike registry system" / "Built in-house, no
spreadsheets required". Theft, serial checks and trust appeared nowhere.

The structural problem was bigger than the words. **The only action on the
page was a Google sign-in.** Two of the four personas in
[`product-brief.md`](../product-brief.md) — the second-hand buyer and the
police officer or finder — have no account and never will. The page offered
them nothing, even though `/search` already does exactly what they came for,
with no account needed.

Copy is in CLAUDE.md's ask-first bucket (branding & marketing), so it was
drafted for approval rather than shipped. The owner reviewed two drafts.

## Decision

Owner's calls, 2026-11-23:

- **The headline states what the registry is**, rather than leading with the
  theft deterrent. "A public register for bicycles", eyebrow "Register once.
  Check any time." A rejected alternative led with the deterrent ("Make your
  bike hard to sell stolen"); another led with the moment of loss ("Your bike
  is stolen. Now what?"). The calmer frame speaks to all four personas at
  once; the theft case moved into the body, where it still arrives in the
  first sentence and a half.
- **The serial check is the primary action.** `Check a bike's serial number`
  is the primary button; `Register your bike` is a secondary link into the
  existing Google sign-in. The case that won: letting someone use the thing
  before signing up builds the trust the whole product runs on, and it is the
  only way the non-account personas get a first action at all.
- **"How it works"** replaces "Discover the details", reordered to match the
  button order: *Anyone can check* / *Published in minutes* / *A tag on the
  frame*.
- **The site's meta description** is localized and rewritten too; "Keep track
  of our bikes" was the text a shared link and a search result showed.

## Deliberately not said

- **No claim of officialdom.** No "Estonia's bicycle register", no ARK
  comparison, no implied government or police endorsement. The brief frames
  this as ARK-*style*; claiming it on the page would be a trust problem, not
  a style preference. This matters more under the calm, institutional
  headline than it would have under the deterrent one — the wording slipping
  toward "the national register" is the risk to watch when the product name
  lands in [Q1](../questions.md).
- **No overclaiming.** No "impossible to sell", no recovery-rate figures. A
  registry makes a stolen bike harder to shift; it cannot stop a sale.
- **Nothing about insurance or police partnerships.** None of it is true yet.
- **No product name.** Still `PRODUCT_NAME` from `src/lib/brand.ts`, pending
  Q1.

## Consequences

- Strings live in `src/lib/dictionaries/{en,et}.ts` under `home`, so the
  landing page is translated for the first time (it was hardcoded English).
  **The Estonian is an agent first pass** and wants a native read-through,
  the same caveat as the rest of `et.ts`.
- `SignInButton` gained `variant` and `label` props so registering can be the
  secondary action and read as "Register your bike".
- The root layout's static `metadata` became `generateMetadata` so the
  description can be localized.
- **A trade the owner accepted:** the calm headline says what the site is but
  not why today. The body carries that load. If the page reads flat in
  practice, the fix is to put urgency back into the eyebrow, not to reopen the
  headline.

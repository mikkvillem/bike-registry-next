# 0003 — Theft report flow: what's public, how reports close

Date: 2026-09-28
Status: Accepted (public fields pending owner confirmation — see status.md)

## Context

Building the theft report flow (MVP item 2, decision 0001) needed a few
execution calls that weren't spelled out: which report fields appear on the
public `/b/[id]` page, whether publishing is immediate, and how an owner
closes a report.

## Decision

- **Fields**: date stolen (`theft.stolenOn`, a plain `date` — no timezone
  ambiguity), place (`theft.location`, free text), details
  (`description`), contact + `contactPublic` opt-in (decision 0002).
- **Public once published**: date, place, and details are shown on the
  stolen banner; the form says so next to the "Publish now" checkbox.
  Contact stays hidden unless opted in.
- **Publish now by default** — the product's hook is speed. Unchecking it
  saves a draft the owner can publish from the bike page.
- **Closing**: owner can **Mark recovered** (`status = 'recovered'`, kept
  in history) or **Withdraw** a report filed by mistake (soft-delete via
  `deletedAt`, kept in the DB for disputes). `resolved` is left unused by
  the owner UI — reserved for dispute/admin handling, which is still an
  open question.
- A `contactPublic` opt-in without a contact value is dropped.

## Consequences

- One click to publish, recover, or withdraw; no confirm step yet.
- No editing an open report yet — owner must withdraw and re-report.
- False-report / contested-claim handling is still undecided.

---
description: Run one iteration of autonomous work toward rollout. Designed for /loop.
---

# /advance — one iteration toward rollout

You are advancing this project toward a public rollout while the user is away.
Do **one** meaningful unit of work per invocation, then stop. Do not try to do
everything in one pass.

## Step 1 — Read state (always, every iteration)

Read in this order:

1. `docs/questions.md` — the question inbox. **Answers the user has written
   since the last iteration are your highest-priority input.**
2. `docs/rollout.md` — the critical path to launch. This defines "done".
3. `docs/status.md` — current health and progress.

## Step 2 — Harvest answers

For every question in `docs/questions.md` whose `**Answer:**` line is no longer
empty:

- Write a dated entry in `docs/decisions/` recording the decision.
- Move the question from **Open** to **Answered** in `docs/questions.md`.
- Remove the corresponding line from **Waiting on you** in `docs/status.md`.
- If the answer unblocks or changes work already shipped under a provisional
  default, note that in `docs/rollout.md` as a follow-up task.

Harvesting answers is itself a valid unit of work. If there were several
answers, doing the harvest plus the first unblocked task is enough.

## Step 3 — Pick the next task

Choose the highest item in `docs/rollout.md` that is **not blocked**. A task is
blocked only if shipping a wrong version of it would be expensive to undo
(public copy, legal text, brand, anything users see and remember, anything
that writes data you can't migrate).

If the top item is blocked:

- Add the question to `docs/questions.md` under **Open**, with a one-line
  recommended default and what it blocks.
- Pick a **provisional default** and keep building behind it, as long as the
  default is cheap to change later (one constant, one file, one component).
- Move down the list and take the next unblocked item.

Never halt the iteration just because something is blocked. There is always
unblocked work: tests, CI, error handling, migrations, refactors, docs.

## Step 4 — Do the work

Follow `CLAUDE.md`. In particular:

- Stay inside the "just do it" bucket. Anything in "always stop and ask"
  becomes a question in `docs/questions.md`, not a decision you make.
- Update `docs/status.md` in the same commit: bump **Last updated**, tick the
  relevant boxes, add one **Changelog** line.
- Tick the item in `docs/rollout.md`.

## Step 5 — Ship it

```
git checkout -b claude/<short-slug>
git add -A
git commit
gh pr create --fill
```

Commit message ends with the Co-Authored-By line; the PR body ends with the
Generated with Claude Code line. One PR per iteration. Keep PRs small enough
to review on a phone.

If the working tree is dirty from an earlier interrupted iteration, finish and
ship that first instead of starting something new.

## Step 6 — Notify, but only when it earns it

Send a push notification (PushNotification) **only** when:

- a **new question** landed in `docs/questions.md` that blocks the critical
  path, or
- a PR is open and the rollout is waiting on a merge, or
- something is broken that you cannot fix.

Do not notify for routine progress. One line, under 200 characters, lead with
what the user would act on. Example: `Blocked: need product name before
public copy. 2 PRs open. docs/questions.md`

## Step 7 — Report

End with a short recap: what you did, what shipped, what you're blocked on,
what's next. Assume the user reads only this.

## Guardrails

- Never merge your own PRs.
- Never push to `main`.
- Never add payments, change pricing, write legal or marketing copy, or pick
  the brand name. Those are questions.
- Never run destructive DB operations. Schema changes go through
  `drizzle-kit` migrations committed to the repo.
- If `npm run lint` or `tsc` fails because of your change, fix it before
  opening the PR.

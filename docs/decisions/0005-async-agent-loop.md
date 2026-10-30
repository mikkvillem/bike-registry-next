# 0005 — Async agent loop for the rollout push

**Date:** 2026-10-28
**Status:** Accepted

## Context

The owner wants the project to reach a public rollout as fast as possible but
is not reliably at the keyboard. The project is ~80% of the way to MVP on
code, but ten open business/design decisions sit in the way, and an agent
that stops at each one makes no progress overnight.

## Decision

Run the remaining work as a self-paced loop with these properties.

1. **Execution: local `/loop`.** The loop runs in a Claude Code session on
   the owner's machine (`/loop <interval> /advance`), not in the cloud. It
   only runs while the machine is on, which the owner accepted in exchange
   for no cloud scheduling.
2. **Handoff: one pull request per iteration.** The loop never pushes to
   `main` and never merges its own PRs. The owner reviews and merges, which
   can be done from a phone.
3. **Blocked decisions: park, default, notify.** Questions go to
   `docs/questions.md` with a recommended default and what they block. The
   loop picks the default when it is cheap to reverse and keeps building, and
   sends a push notification when a new question blocks the critical path.
   The owner answers inline in the file; the next iteration harvests the
   answers, logs them here, and reworks anything built on a wrong default.

Supporting artifacts: `.claude/commands/advance.md` (the iteration recipe),
`docs/rollout.md` (what "rollout" means and the ordered path to it),
`docs/questions.md` (the inbox).

## Consequences

- Throughput no longer depends on the owner's response time, except for the
  genuinely irreversible decisions (brand name, legal text).
- Some work will be built on defaults that later get overturned. The loop is
  instructed to keep defaults to one constant or one component so that rework
  stays cheap, and `rollout.md` tracks the follow-up.
- Because every iteration ships a PR, an unreviewed backlog of PRs is the
  likely failure mode rather than a broken `main`.

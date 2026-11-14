/**
 * Recognising a unique-index violation by name.
 *
 * Two layers get in the way of just reading `error.message`. Drizzle wraps
 * driver errors in a `DrizzleQueryError` whose own message is only the failed
 * SQL and its parameters — the constraint name is not in it. And the pg error
 * underneath carries the name in a `constraint` property rather than in its
 * message. So the name has to be looked for down the whole cause chain, in
 * both places.
 *
 * Getting this wrong is quiet: the duplicate is still rejected by the
 * database, but the owner sees a generic "something went wrong" instead of
 * being told their bike is already registered or already reported stolen.
 */

/** How far down the cause chain to look, so a cyclic cause can't hang this. */
const MAX_DEPTH = 10;

export function isUniqueViolation(error: unknown, constraint: string): boolean {
  let current: unknown = error;

  for (let depth = 0; depth < MAX_DEPTH && current != null; depth += 1) {
    if (typeof current !== "object") break;

    const candidate = current as { message?: unknown; constraint?: unknown };
    if (candidate.constraint === constraint) return true;
    if (
      typeof candidate.message === "string" &&
      candidate.message.includes(constraint)
    ) {
      return true;
    }

    current = (current as { cause?: unknown }).cause;
  }

  return false;
}

import { describe, expect, it } from "vitest";
import { isUniqueViolation } from "@/lib/db-errors";

const NAME = "theft_bicycle_active_idx";

describe("isUniqueViolation", () => {
  it("matches a pg error carrying the constraint name as a property", () => {
    expect(
      isUniqueViolation(
        Object.assign(new Error("boom"), { constraint: NAME }),
        NAME,
      ),
    ).toBe(true);
  });

  it("matches when the name is only in the message", () => {
    expect(
      isUniqueViolation(
        new Error(`violates unique constraint "${NAME}"`),
        NAME,
      ),
    ).toBe(true);
  });

  // The case that matters: drizzle's wrapper message is just the failed SQL,
  // so the constraint is only reachable through the cause.
  it("looks through a wrapper whose own message does not mention it", () => {
    const wrapped = new Error("Failed query: insert into theft ...", {
      cause: Object.assign(new Error("duplicate key"), { constraint: NAME }),
    });

    expect(isUniqueViolation(wrapped, NAME)).toBe(true);
  });

  it("does not match a different constraint", () => {
    expect(
      isUniqueViolation(
        Object.assign(new Error("boom"), {
          constraint: "bicycle_serial_make_model_idx",
        }),
        NAME,
      ),
    ).toBe(false);
  });

  it("is safe on non-errors and on a cyclic cause chain", () => {
    const a = new Error("a");
    const b = new Error("b", { cause: a });
    (a as { cause?: unknown }).cause = b;

    expect(isUniqueViolation(a, NAME)).toBe(false);
    expect(isUniqueViolation(null, NAME)).toBe(false);
    expect(isUniqueViolation("a string", NAME)).toBe(false);
  });
});

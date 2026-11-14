import { describe, expect, it } from "vitest";
import { parseStolenOn } from "../src/lib/theft-date";

// Fixed "now" so these never depend on the clock.
const now = new Date("2026-10-30T12:00:00Z");

describe("parseStolenOn", () => {
  it("accepts a past date", () => {
    expect(parseStolenOn("2026-10-01", now)).toEqual({ value: "2026-10-01" });
  });

  it("accepts today", () => {
    expect(parseStolenOn("2026-10-30", now)).toEqual({ value: "2026-10-30" });
  });

  // Owners in Estonia (UTC+2/+3) pick their local "today" just after
  // midnight, which is still "tomorrow" in UTC.
  it("accepts tomorrow, for owners ahead of UTC", () => {
    expect(parseStolenOn("2026-10-31", now)).toEqual({ value: "2026-10-31" });
  });

  it("rejects a date further in the future", () => {
    expect(parseStolenOn("2026-11-01", now).error).toMatch(/future/);
  });

  it.each([null, "", "   ", "not a date", "30.10.2026", "2026-13-40"])(
    "rejects %o",
    (input) => {
      expect(parseStolenOn(input, now).error).toMatch(/Enter the date/);
    },
  );

  it("trims surrounding whitespace", () => {
    expect(parseStolenOn("  2026-10-01  ", now)).toEqual({
      value: "2026-10-01",
    });
  });
});

export type ParsedStolenOn =
  | { value: string; error?: undefined }
  | { value?: undefined; error: string };

/**
 * Validates the "date stolen" field of a theft report. Returns the error
 * instead of throwing, so the server action can hand it back to the form:
 * a thrown message is replaced with a generic one in production.
 *
 * `today` is injectable so tests don't depend on the clock.
 */
export function parseStolenOn(
  value: FormDataEntryValue | null,
  now: Date = new Date(),
): ParsedStolenOn {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw) || Number.isNaN(Date.parse(raw))) {
    return { error: "Enter the date the bike was stolen." };
  }
  // One day of slack so owners ahead of UTC (Estonia is UTC+2/+3) can pick
  // their local "today" right after midnight.
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  if (raw > tomorrow) {
    return { error: "The theft date can't be in the future." };
  }
  return { value: raw };
}

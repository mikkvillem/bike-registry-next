import type { Dictionary } from "@/lib/dictionaries/en";
import { en } from "@/lib/dictionaries/en";
import { et } from "@/lib/dictionaries/et";

export type { Dictionary };

// Estonia first (decision 0001), English second. Adding a locale means
// adding a dictionary and one entry here.
export const LOCALES = ["et", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "et";
export const LOCALE_COOKIE = "locale";

const DICTIONARIES: Record<Locale, Dictionary> = { et, en };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && LOCALES.includes(value as Locale);
}

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

/**
 * Picks a locale from an explicit choice (cookie) first, then the browser's
 * Accept-Language, then the default. Pure, so it is unit-tested; the request
 * plumbing lives in `locale-server.ts`.
 */
export function resolveLocale(
  cookieValue: string | undefined,
  acceptLanguage: string | null,
): Locale {
  if (isLocale(cookieValue)) return cookieValue;

  for (const tag of parseAcceptLanguage(acceptLanguage)) {
    // "et-EE" and "en-GB" should match "et" and "en".
    const base = tag.split("-")[0]?.toLowerCase();
    if (isLocale(base)) return base;
  }

  return DEFAULT_LOCALE;
}

/** Language tags from an Accept-Language header, most-preferred first. */
function parseAcceptLanguage(header: string | null): string[] {
  if (!header) return [];
  return header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params
        .map((p) => p.trim())
        .find((p) => p.startsWith("q="))
        ?.slice(2);
      const quality = q === undefined ? 1 : Number.parseFloat(q);
      return {
        tag: tag?.trim() ?? "",
        quality: Number.isNaN(quality) ? 0 : quality,
      };
    })
    .filter(
      (entry) => entry.tag !== "" && entry.tag !== "*" && entry.quality > 0,
    )
    .sort((a, b) => b.quality - a.quality)
    .map((entry) => entry.tag);
}

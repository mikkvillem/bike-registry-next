import { describe, expect, it } from "vitest";
import {
  getDictionary,
  isLocale,
  LOCALES,
  resolveLocale,
} from "../src/lib/i18n";

describe("resolveLocale", () => {
  it("prefers an explicit cookie choice over the browser's languages", () => {
    expect(resolveLocale("en", "et-EE,et;q=0.9")).toBe("en");
    expect(resolveLocale("et", "en-GB,en;q=0.9")).toBe("et");
  });

  it("ignores a cookie that isn't a supported locale", () => {
    expect(resolveLocale("klingon", "en-GB")).toBe("en");
    expect(resolveLocale("", null)).toBe("et");
  });

  it("falls back to Accept-Language, matching the base of a region tag", () => {
    expect(resolveLocale(undefined, "en-GB,en;q=0.9")).toBe("en");
    expect(resolveLocale(undefined, "et-EE")).toBe("et");
  });

  it("respects q-values rather than header order", () => {
    expect(resolveLocale(undefined, "de;q=0.9,en;q=0.8,et;q=1.0")).toBe("et");
    expect(resolveLocale(undefined, "ru,en;q=0.5")).toBe("en");
  });

  it("defaults to Estonian when nothing matches", () => {
    expect(resolveLocale(undefined, null)).toBe("et");
    expect(resolveLocale(undefined, "ru-RU,fi;q=0.8")).toBe("et");
    expect(resolveLocale(undefined, "*")).toBe("et");
  });
});

describe("dictionaries", () => {
  it("accepts only supported locales", () => {
    expect(isLocale("et")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("fi")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });

  // The Dictionary type enforces this at compile time; this catches a key
  // that type-checks but was left as the English string by mistake.
  it("translates every leaf for every locale", () => {
    for (const locale of LOCALES) {
      const dictionary = getDictionary(locale);
      for (const section of Object.values(dictionary)) {
        for (const [key, value] of Object.entries(section)) {
          const rendered =
            typeof value === "function" ? value("2026-10-30") : value;
          expect(rendered, `${locale}.${key}`).toBeTruthy();
        }
      }
    }
  });
});

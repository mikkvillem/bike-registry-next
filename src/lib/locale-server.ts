import { cookies, headers } from "next/headers";
import {
  type Dictionary,
  getDictionary,
  LOCALE_COOKIE,
  type Locale,
  resolveLocale,
} from "@/lib/i18n";

/** The current request's locale: cookie choice, else Accept-Language. */
export async function getLocale(): Promise<Locale> {
  const [jar, headerList] = await Promise.all([cookies(), headers()]);
  return resolveLocale(
    jar.get(LOCALE_COOKIE)?.value,
    headerList.get("accept-language"),
  );
}

/** The current request's locale and its dictionary. */
export async function getT(): Promise<{ locale: Locale; t: Dictionary }> {
  const locale = await getLocale();
  return { locale, t: getDictionary(locale) };
}

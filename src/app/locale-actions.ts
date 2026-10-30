"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { isLocale, LOCALE_COOKIE } from "@/lib/i18n";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** Remembers the visitor's language choice for a year. */
export async function setLocale(formData: FormData) {
  const chosen = formData.get("locale");
  if (!isLocale(chosen)) return;

  const jar = await cookies();
  jar.set(LOCALE_COOKIE, chosen, {
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
}

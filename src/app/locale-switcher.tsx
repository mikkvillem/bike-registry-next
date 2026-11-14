import { setLocale } from "@/app/locale-actions";
import { LOCALES, type Locale } from "@/lib/i18n";

/** ET / EN toggle. Posts to a server action that sets the locale cookie. */
export function LocaleSwitcher({ locale }: { locale: Locale }) {
  return (
    <form action={setLocale} className="flex items-center gap-2 text-xs">
      {LOCALES.map((option) => (
        <button
          key={option}
          type="submit"
          name="locale"
          value={option}
          aria-current={option === locale ? "true" : undefined}
          className={
            option === locale
              ? "font-semibold underline"
              : "opacity-60 hover:underline"
          }
        >
          {option.toUpperCase()}
        </button>
      ))}
    </form>
  );
}

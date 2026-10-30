"use client";

import Link from "next/link";
import { useActionState } from "react";
import { PRODUCT_NAME } from "@/lib/brand";
import { getDictionary, type Locale } from "@/lib/i18n";
import { type SearchResult, searchBikes } from "./actions";

type State =
  | { results: SearchResult[]; query: string; error: null }
  | { results: null; query: string; error: string | null };

export function SearchForm({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);

  // Defined here so the fallback message can come from the dictionary.
  async function handleSearch(
    _prevState: State,
    formData: FormData,
  ): Promise<State> {
    const query = (formData.get("query") as string) || "";
    try {
      return { results: await searchBikes(query), query, error: null };
    } catch (error) {
      return {
        results: null,
        query,
        error: error instanceof Error ? error.message : t.search.failed,
      };
    }
  }

  const [state, formAction] = useActionState(handleSearch, {
    results: null,
    query: "",
    error: null,
  });

  return (
    <main className="mx-auto max-w-2xl p-6">
      <p className="text-sm opacity-60">{PRODUCT_NAME}</p>
      <h1 className="mt-1 text-2xl font-semibold">{t.search.title}</h1>
      <p className="mt-2 text-sm opacity-70">{t.search.intro}</p>

      <form action={formAction} className="mt-6 flex gap-2">
        <input
          type="text"
          name="query"
          placeholder={t.search.placeholder}
          defaultValue={state?.query || ""}
          className="flex-1 rounded border border-black/20 px-4 py-2 text-sm dark:border-white/20"
        />
        <button
          type="submit"
          className="rounded bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
        >
          {t.search.submit}
        </button>
      </form>

      {state?.error && (
        <div className="mt-4 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/20 dark:text-red-200">
          {state.error}
        </div>
      )}

      {state?.results !== null && state?.results !== undefined && (
        <div className="mt-8">
          {state.results.length === 0 ? (
            <p className="text-sm opacity-60">
              {state.query ? t.search.noResults : ""}
            </p>
          ) : (
            <div className="space-y-6">
              <p className="text-sm opacity-60">
                {t.search.found(state.results.length)}
              </p>
              {state.results.map((bike) => (
                <Link
                  key={bike.id}
                  href={`/b/${bike.id}`}
                  className="block rounded border border-black/10 p-4 transition-colors hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
                >
                  <div className="flex gap-4">
                    {bike.imageUrls && bike.imageUrls.length > 0 && (
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded">
                        {/* biome-ignore lint/performance/noImgElement: user uploads (R2 or local) */}
                        <img
                          src={bike.imageUrls[0]}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">
                            {bike.make}
                            {bike.model && ` ${bike.model}`}
                          </h3>
                          <p className="text-xs opacity-60">
                            {bike.type
                              ? t.bikeType[bike.type]
                              : t.bikeType.fallback}
                          </p>
                        </div>
                        {bike.stolen ? (
                          <div className="flex-shrink-0 rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-800 dark:bg-red-950 dark:text-red-200">
                            {t.search.badgeStolen}
                          </div>
                        ) : (
                          <div className="flex-shrink-0 rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-800 dark:bg-green-950 dark:text-green-200">
                            {t.search.badgeOk}
                          </div>
                        )}
                      </div>
                      <p className="mt-2 break-all text-xs opacity-60">
                        {t.search.serial(bike.serialNumber)}
                      </p>
                      {bike.stolen && (
                        <p className="mt-2 text-xs text-red-700 dark:text-red-300">
                          {t.search.reportedStolen(
                            bike.stolen.stolenOn,
                            bike.stolen.location,
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}

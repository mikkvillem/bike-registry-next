import { and, desc, eq, isNotNull, isNull } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import { bicycle, theft } from "@/db/schema/schema";
import { PRODUCT_NAME } from "@/lib/brand";
import { getDictionary } from "@/lib/i18n";
import { getLocale, getT } from "@/lib/locale-server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getLocale());
  return {
    title: t.stolen.metaTitle,
    description: t.stolen.metaDescription,
  };
}

const FEED_LIMIT = 50;

// Public, no-auth feed of published theft reports, newest first. Only shows
// what the public /b/[id] page already shows for a stolen bike (no serial
// number, no contact) — see decisions 0002 and 0003.
export default async function StolenFeedPage() {
  const { locale, t } = await getT();

  const rows = await db
    .select({
      id: bicycle.id,
      make: bicycle.make,
      model: bicycle.model,
      type: bicycle.type,
      imageUrls: bicycle.imageUrls,
      stolenOn: theft.stolenOn,
      location: theft.location,
      publishedAt: theft.publishedAt,
    })
    .from(theft)
    .innerJoin(bicycle, eq(bicycle.id, theft.bicycleId))
    .where(
      and(
        eq(theft.status, "active"),
        isNotNull(theft.publishedAt),
        isNull(theft.deletedAt),
        isNull(bicycle.deletedAt),
      ),
    )
    .orderBy(desc(theft.publishedAt))
    .limit(FEED_LIMIT);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <p className="text-sm opacity-60">{PRODUCT_NAME}</p>
      <h1 className="mt-1 text-2xl font-semibold">{t.stolen.title}</h1>
      <p className="mt-2 text-sm opacity-70">
        {t.stolen.intro}{" "}
        <Link href="/search" className="underline">
          {t.stolen.introLink}
        </Link>
        .
      </p>

      {rows.length === 0 ? (
        <p className="mt-8 text-sm opacity-60">{t.stolen.empty}</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {rows.map((bike) => (
            <li key={bike.id}>
              <Link
                href={`/b/${bike.id}`}
                className="flex gap-4 rounded border border-black/10 p-4 transition-colors hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
              >
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
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="font-semibold">
                        {bike.make}
                        {bike.model && ` ${bike.model}`}
                      </h2>
                      <p className="text-xs opacity-60">
                        {bike.type
                          ? t.bikeType[bike.type]
                          : t.bikeType.fallback}
                      </p>
                    </div>
                    <span className="flex-shrink-0 rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-800 dark:bg-red-950 dark:text-red-200">
                      {t.stolen.badge}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-red-700 dark:text-red-300">
                    {[
                      bike.stolenOn && t.stolen.stolenOn(bike.stolenOn),
                      bike.location,
                    ]
                      .filter(Boolean)
                      .join(" · ") ||
                      t.stolen.reportedOn(
                        bike.publishedAt?.toLocaleDateString(locale) ?? "",
                      )}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

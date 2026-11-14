import { and, desc, eq, isNotNull, isNull } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { bicycle, theft } from "@/db/schema/schema";
import { PRODUCT_NAME } from "@/lib/brand";
import { getDictionary } from "@/lib/i18n";
import { getLocale, getT } from "@/lib/locale-server";

async function getBike(id: string) {
  const [bike] = await db
    .select()
    .from(bicycle)
    .where(and(eq(bicycle.id, id), isNull(bicycle.deletedAt)))
    .limit(1);
  return bike;
}

async function getActiveTheft(bikeId: string) {
  const [activeTheft] = await db
    .select()
    .from(theft)
    .where(
      and(
        eq(theft.bicycleId, bikeId),
        eq(theft.status, "active"),
        isNotNull(theft.publishedAt),
        isNull(theft.deletedAt),
      ),
    )
    .orderBy(desc(theft.createdAt))
    .limit(1);
  return activeTheft;
}

// Share-card metadata: a stolen-bike link pasted in a chat or social post
// should preview as a clear STOLEN notice with the first photo.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const t = getDictionary(await getLocale());
  const bike = await getBike(id);
  if (!bike) return { title: t.bikePage.notFoundTitle };
  const activeTheft = await getActiveTheft(bike.id);

  const name = [bike.make, bike.model].filter(Boolean).join(" ");
  const title = activeTheft ? t.bikePage.stolenTitlePrefix(name) : name;
  const description = activeTheft
    ? t.bikePage.metaReportedStolen(activeTheft.stolenOn, activeTheft.location)
    : t.bikePage.metaRegistered;
  const image = bike.imageUrls?.[0];

  return {
    title,
    description,
    openGraph: { title, description, ...(image && { images: [image] }) },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
    },
  };
}

// Public, no-auth bike status page. Linked from the printable QR label so a
// finder, buyer, or police officer can check registration + theft status by
// scanning the tag. Keep this page free of PII beyond what the owner has
// explicitly opted into (see theft.contactPublic).
export default async function PublicBikePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { locale, t } = await getT();

  const bike = await getBike(id);
  if (!bike) notFound();
  const activeTheft = await getActiveTheft(bike.id);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <p className="text-sm opacity-60">{PRODUCT_NAME}</p>
      <h1 className="mt-1 text-2xl font-semibold">
        {bike.type ? t.bikeType[bike.type] : t.bikeType.fallback}
      </h1>

      {activeTheft ? (
        <div className="mt-4 rounded border border-red-600 bg-red-50 p-4 text-red-800">
          <p className="font-semibold">{t.bikePage.reportedStolen}</p>
          {(activeTheft.stolenOn || activeTheft.location) && (
            <p className="mt-1 text-sm">
              {[
                activeTheft.stolenOn &&
                  t.bikePage.stolenOn(activeTheft.stolenOn),
                activeTheft.location,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
          {activeTheft.description && (
            <p className="mt-1 whitespace-pre-wrap text-sm">
              {activeTheft.description}
            </p>
          )}
          <p className="mt-2 text-sm opacity-80">
            {t.bikePage.reportedOn(
              activeTheft.publishedAt?.toLocaleDateString(locale) ?? "",
            )}
            {activeTheft.contactPublic && activeTheft.contact
              ? t.bikePage.contact(activeTheft.contact)
              : t.bikePage.policeHint}
          </p>
        </div>
      ) : (
        <div className="mt-4 rounded border border-green-600 bg-green-50 p-4 text-green-800">
          <p className="font-semibold">{t.bikePage.registered}</p>
        </div>
      )}

      {bike.imageUrls && bike.imageUrls.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {bike.imageUrls.map((url) => (
            // biome-ignore lint/performance/noImgElement: user uploads (R2 or local), not optimized via next/image
            <img
              key={url}
              src={url}
              alt=""
              className="aspect-square w-full rounded object-cover"
            />
          ))}
        </div>
      )}

      <dl className="mt-6 grid grid-cols-2 gap-y-3 text-sm">
        <dt className="opacity-60">{t.bikePage.specs.type}</dt>
        <dd>{bike.type ? t.bikeType[bike.type] : t.bikePage.specs.empty}</dd>
        <dt className="opacity-60">{t.bikePage.specs.gender}</dt>
        <dd>{bike.gender ? t.gender[bike.gender] : t.bikePage.specs.empty}</dd>
        <dt className="opacity-60">{t.bikePage.specs.gearSystem}</dt>
        <dd>
          {bike.gearSystem
            ? t.gearSystem[bike.gearSystem]
            : t.bikePage.specs.empty}
        </dd>
        <dt className="opacity-60">{t.bikePage.specs.numGears}</dt>
        <dd>{bike.numGears ?? t.bikePage.specs.empty}</dd>
        <dt className="opacity-60">{t.bikePage.specs.wheelSize}</dt>
        <dd>{bike.wheelSize ?? t.bikePage.specs.empty}</dd>
        <dt className="opacity-60">{t.bikePage.specs.weight}</dt>
        <dd>
          {bike.weight
            ? t.bikePage.specs.kilograms(bike.weight)
            : t.bikePage.specs.empty}
        </dd>
      </dl>
    </main>
  );
}

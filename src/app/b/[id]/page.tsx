import { and, desc, eq, isNotNull, isNull } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BikeStatus, bikeName } from "@/app/b/[id]/bike-status";
import { db } from "@/db";
import { bicycle, theft } from "@/db/schema/schema";
import { getDictionary } from "@/lib/i18n";
import { getLocale, getT } from "@/lib/locale-server";

// Never serve this from a cache. A bike that was reported stolen a minute
// ago must not still read REGISTERED — that failure defeats the whole
// product. The route is already dynamic because the locale lookup reads
// cookies, but that is incidental; say it outright so a later refactor of
// the i18n plumbing can't quietly make this page static. `/stolen` declares
// the same thing for the same reason.
export const dynamic = "force-dynamic";

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

  const name = bikeName(bike, t);
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
//
// The layout lives in `bike-status.tsx`; this route only fetches.
export default async function PublicBikePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t } = await getT();

  const bike = await getBike(id);
  if (!bike) notFound();
  const activeTheft = await getActiveTheft(bike.id);

  return <BikeStatus bike={bike} activeTheft={activeTheft} t={t} />;
}

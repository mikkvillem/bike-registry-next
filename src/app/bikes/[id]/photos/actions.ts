"use server";

import { and, eq, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { bicycle } from "@/db/schema/schema";
import { deleteStoredPhoto, photoUrlsFromForm } from "@/lib/bike-photos";
import { getSession } from "@/lib/session";
import { MAX_IMAGES_PER_BIKE } from "@/lib/storage";

function ownedBike(bikeId: string, userId: string) {
  return and(
    eq(bicycle.id, bikeId),
    eq(bicycle.userId, userId),
    isNull(bicycle.deletedAt),
  );
}

function revalidateBike(bikeId: string) {
  revalidatePath(`/bikes/${bikeId}`);
  revalidatePath(`/b/${bikeId}`);
  revalidatePath("/dashboard");
}

/**
 * Appends photos (already uploaded by the browser) to an existing bike.
 * Returns an error message for the user instead of throwing, since thrown
 * messages are hidden in production.
 */
export async function addBikePhotos(
  bikeId: string,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session) redirect("/");

  let urls: string[];
  try {
    urls = await photoUrlsFromForm(session.user.id, bikeId, formData);
  } catch (error) {
    console.error("addBikePhotos", error);
    return { error: "A photo failed to upload. Please try again." };
  }
  if (urls.length === 0) return {};

  const newUrls = sql`array[${sql.join(
    urls.map((url) => sql`${url}`),
    sql`, `,
  )}]::text[]`;

  // The limit check lives in the UPDATE so two tabs adding photos at once
  // can't push a bike past the cap.
  const updated = await db
    .update(bicycle)
    .set({
      imageUrls: sql`array_cat(coalesce(${bicycle.imageUrls}, '{}'::text[]), ${newUrls})`,
    })
    .where(
      and(
        ownedBike(bikeId, session.user.id),
        sql`coalesce(cardinality(${bicycle.imageUrls}), 0) + ${urls.length} <= ${MAX_IMAGES_PER_BIKE}`,
      ),
    )
    .returning({ id: bicycle.id });

  if (updated.length === 0) {
    await Promise.all(urls.map(deleteStoredPhoto));
    return {
      error: `A bike can have up to ${MAX_IMAGES_PER_BIKE} photos. Remove one to add another.`,
    };
  }
  revalidateBike(bikeId);
  return {};
}

/** Detaches a photo from the bike and deletes the stored file. */
export async function removeBikePhoto(bikeId: string, url: string) {
  const session = await getSession();
  if (!session) redirect("/");

  const updated = await db
    .update(bicycle)
    .set({
      imageUrls: sql`nullif(array_remove(${bicycle.imageUrls}, ${url}), '{}'::text[])`,
    })
    .where(
      and(
        ownedBike(bikeId, session.user.id),
        sql`${url} = any(${bicycle.imageUrls})`,
      ),
    )
    .returning({ id: bicycle.id });

  if (updated.length > 0) await deleteStoredPhoto(url);
  revalidateBike(bikeId);
}

"use server";

import { and, eq, isNull } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { bicycle, theft } from "@/db/schema/schema";
import { getSession } from "@/lib/session";
import { parseStolenOn } from "@/lib/theft-date";

async function requireOwnedBike(bikeId: string) {
  const session = await getSession();
  if (!session) redirect("/");

  const [bike] = await db
    .select({ id: bicycle.id, userId: bicycle.userId })
    .from(bicycle)
    .where(and(eq(bicycle.id, bikeId), isNull(bicycle.deletedAt)))
    .limit(1);

  if (!bike || bike.userId !== session.user.id) notFound();
  return bike;
}

// The bike's current open report: `active` and not withdrawn. The
// theft_bicycle_active_idx index guarantees there's at most one.
async function requireActiveTheft(bikeId: string) {
  await requireOwnedBike(bikeId);

  const [report] = await db
    .select()
    .from(theft)
    .where(
      and(
        eq(theft.bicycleId, bikeId),
        eq(theft.status, "active"),
        isNull(theft.deletedAt),
      ),
    )
    .limit(1);

  if (!report) notFound();
  return report;
}

/**
 * Validation errors are returned, not thrown: a thrown message is replaced
 * with a generic one in production, so the owner would never learn what was
 * actually wrong with their input.
 */
export type TheftActionResult = { error: string } | undefined;

function optionalText(value: FormDataEntryValue | null): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function reportTheft(
  bikeId: string,
  formData: FormData,
): Promise<TheftActionResult> {
  await requireOwnedBike(bikeId);

  const stolenOn = parseStolenOn(formData.get("stolenOn"));
  if (stolenOn.error !== undefined) return { error: stolenOn.error };

  const contact = optionalText(formData.get("contact"));
  const publish = formData.get("publish") === "on";

  try {
    await db.insert(theft).values({
      id: crypto.randomUUID(),
      bicycleId: bikeId,
      status: "active",
      stolenOn: stolenOn.value,
      location: optionalText(formData.get("location")),
      description: optionalText(formData.get("description")),
      contact,
      // Nothing to show if there's no contact, so don't record an opt-in.
      contactPublic: Boolean(contact) && formData.get("contactPublic") === "on",
      publishedAt: publish ? new Date() : null,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("theft_bicycle_active_idx")
    ) {
      return { error: "This bike already has an open theft report." };
    }
    throw error;
  }

  redirect(`/bikes/${bikeId}`);
}

export async function publishTheft(bikeId: string) {
  const report = await requireActiveTheft(bikeId);
  if (!report.publishedAt) {
    await db
      .update(theft)
      .set({ publishedAt: new Date() })
      .where(eq(theft.id, report.id));
  }
  redirect(`/bikes/${bikeId}`);
}

export async function markTheftRecovered(bikeId: string) {
  const report = await requireActiveTheft(bikeId);
  await db
    .update(theft)
    .set({ status: "recovered" })
    .where(eq(theft.id, report.id));
  redirect(`/bikes/${bikeId}`);
}

// For reports filed by mistake. Soft-deletes so the record is kept for
// dispute handling, but it disappears from the public page and history.
export async function withdrawTheft(bikeId: string) {
  const report = await requireActiveTheft(bikeId);
  await db
    .update(theft)
    .set({ deletedAt: new Date() })
    .where(eq(theft.id, report.id));
  redirect(`/bikes/${bikeId}`);
}

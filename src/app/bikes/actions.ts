"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import {
  bicycle,
  bicycleGearSystemEnum,
  bicycleGenderEnum,
  bicycleTypeEnum,
  theft,
} from "@/db/schema/schema";
import { photoUrlsFromForm } from "@/lib/bike-photos";
import { getSession } from "@/lib/session";
import {
  ALLOWED_IMAGE_TYPES,
  createUploadUrl,
  isR2Configured,
  MAX_IMAGE_BYTES,
  MAX_IMAGES_PER_BIKE,
  newImageKey,
} from "@/lib/storage";

function asEnumValue<T extends readonly string[]>(
  values: T,
  value: FormDataEntryValue | null,
): T[number] | undefined {
  return values.includes(value as string) ? (value as T[number]) : undefined;
}

export type ImageUploadRequest = { contentType: string; size: number };

export type ImageUploadTargets =
  | { mode: "local" }
  | { mode: "r2"; uploads: { key: string; url: string }[] }
  | { mode: "error"; message: string };

/**
 * Step 1 of adding photos: the browser asks for presigned R2 upload URLs,
 * PUTs each file directly to R2, then submits the returned keys with the
 * form. Returns `local` when R2 isn't configured (dev), in which case the
 * form posts the files themselves. Pass `bikeId` when adding to an existing
 * bike so the photo limit counts the photos it already has.
 */
export async function requestImageUploads(
  files: ImageUploadRequest[],
  bikeId?: string,
): Promise<ImageUploadTargets> {
  const session = await getSession();
  if (!session) throw new Error("Not signed in.");

  let existing = 0;
  if (bikeId) {
    const [bike] = await db
      .select({ imageUrls: bicycle.imageUrls })
      .from(bicycle)
      .where(
        and(
          eq(bicycle.id, bikeId),
          eq(bicycle.userId, session.user.id),
          isNull(bicycle.deletedAt),
        ),
      )
      .limit(1);
    if (!bike) return { mode: "error", message: "Bike not found." };
    existing = bike.imageUrls?.length ?? 0;
  }
  const remaining = MAX_IMAGES_PER_BIKE - existing;
  if (files.length > remaining) {
    return {
      mode: "error",
      message:
        remaining > 0
          ? `A bike can have up to ${MAX_IMAGES_PER_BIKE} photos — you can add ${remaining} more.`
          : `A bike can have up to ${MAX_IMAGES_PER_BIKE} photos. Remove one to add another.`,
    };
  }
  if (!isR2Configured()) return { mode: "local" };
  for (const file of files) {
    if (!(file.contentType in ALLOWED_IMAGE_TYPES)) {
      return {
        mode: "error",
        message: "Photos must be converted to WebP before upload.",
      };
    }
    if (!(file.size > 0 && file.size <= MAX_IMAGE_BYTES)) {
      return {
        mode: "error",
        message: `Each photo must be under ${MAX_IMAGE_BYTES / 1024 / 1024} MB.`,
      };
    }
  }

  const uploads = await Promise.all(
    files.map(async (file) => {
      const key = newImageKey(session.user.id, file.contentType);
      const url = await createUploadUrl(key, file.contentType, file.size);
      return { key, url };
    }),
  );
  return { mode: "r2", uploads };
}

function parseBikeFields(formData: FormData) {
  const make = (formData.get("make") as string)?.trim();
  const serialNumber = (formData.get("serialNumber") as string)?.trim();
  if (!make || !serialNumber) {
    throw new Error("Make and serial number are required.");
  }
  const weightRaw = formData.get("weight");
  const numGearsRaw = formData.get("numGears");
  return {
    make,
    model: (formData.get("model") as string)?.trim() || null,
    serialNumber,
    type: asEnumValue(bicycleTypeEnum.enumValues, formData.get("type")),
    gender: asEnumValue(bicycleGenderEnum.enumValues, formData.get("gender")),
    gearSystem: asEnumValue(
      bicycleGearSystemEnum.enumValues,
      formData.get("gearSystem"),
    ),
    wheelSize: (formData.get("wheelSize") as string) || null,
    weight: weightRaw ? Number(weightRaw) : null,
    numGears: numGearsRaw ? Number(numGearsRaw) : null,
    description: (formData.get("description") as string) || null,
  };
}

function friendlyDuplicateError(error: unknown) {
  if (
    error instanceof Error &&
    // The driver may wrap the pg error, so check the cause chain too.
    [error.message, String((error as { cause?: unknown }).cause)].some((m) =>
      m.includes("bicycle_serial_make_model_idx"),
    )
  ) {
    return new Error(
      "A bike with this make, model, and serial number is already registered.",
    );
  }
  return error;
}

async function requireOwnedBike(bikeId: string) {
  const session = await getSession();
  if (!session) redirect("/");
  const [bike] = await db
    .select({ id: bicycle.id })
    .from(bicycle)
    .where(
      and(
        eq(bicycle.id, bikeId),
        eq(bicycle.userId, session.user.id),
        isNull(bicycle.deletedAt),
      ),
    )
    .limit(1);
  if (!bike) notFound();
}

/** Edits specs/identity only; photos are managed on the bike page. */
export async function updateBike(bikeId: string, formData: FormData) {
  await requireOwnedBike(bikeId);
  const fields = parseBikeFields(formData);
  try {
    await db.update(bicycle).set(fields).where(eq(bicycle.id, bikeId));
  } catch (error) {
    throw friendlyDuplicateError(error);
  }
  revalidatePath("/dashboard");
  redirect(`/bikes/${bikeId}`);
}

/**
 * Soft-delete: frees the serial for re-registration, and takes the public
 * page and QR label offline. Any open theft report is withdrawn with it so
 * no orphaned "active" report lingers.
 */
export async function deleteBike(bikeId: string) {
  await requireOwnedBike(bikeId);
  const now = new Date();
  await db.transaction(async (tx) => {
    await tx
      .update(theft)
      .set({ deletedAt: now })
      .where(and(eq(theft.bicycleId, bikeId), isNull(theft.deletedAt)));
    await tx
      .update(bicycle)
      .set({ deletedAt: now })
      .where(eq(bicycle.id, bikeId));
  });
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function createBike(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/");

  const fields = parseBikeFields(formData);

  const bikeId = crypto.randomUUID();
  const imageUrls = await photoUrlsFromForm(session.user.id, bikeId, formData);

  try {
    await db.insert(bicycle).values({
      id: bikeId,
      userId: session.user.id,
      ...fields,
      imageUrls: imageUrls.length > 0 ? imageUrls : null,
    });
  } catch (error) {
    throw friendlyDuplicateError(error);
  }

  redirect(`/bikes/${bikeId}`);
}

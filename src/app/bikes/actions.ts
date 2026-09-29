"use server";

import { and, eq, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  bicycle,
  bicycleGearSystemEnum,
  bicycleGenderEnum,
  bicycleTypeEnum,
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

export async function createBike(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/");

  const make = (formData.get("make") as string)?.trim();
  const serialNumber = (formData.get("serialNumber") as string)?.trim();
  if (!make || !serialNumber) {
    throw new Error("Make and serial number are required.");
  }
  const model = (formData.get("model") as string)?.trim() || null;

  const bikeId = crypto.randomUUID();
  const imageUrls = await photoUrlsFromForm(session.user.id, bikeId, formData);

  const weightRaw = formData.get("weight");
  const numGearsRaw = formData.get("numGears");

  try {
    await db.insert(bicycle).values({
      id: bikeId,
      userId: session.user.id,
      make,
      model,
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
      imageUrls: imageUrls.length > 0 ? imageUrls : null,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("bicycle_serial_make_model_idx")
    ) {
      throw new Error(
        "A bike with this make, model, and serial number is already registered.",
      );
    }
    throw error;
  }

  redirect(`/bikes/${bikeId}`);
}

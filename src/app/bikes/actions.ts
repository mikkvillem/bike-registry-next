"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  bicycle,
  bicycleGearSystemEnum,
  bicycleGenderEnum,
  bicycleTypeEnum,
} from "@/db/schema/schema";
import { getSession } from "@/lib/session";
import {
  ALLOWED_IMAGE_TYPES,
  createUploadUrl,
  isR2Configured,
  MAX_IMAGE_BYTES,
  MAX_IMAGES_PER_BIKE,
  newImageKey,
  objectExists,
  publicImageUrl,
  userUploadPrefix,
} from "@/lib/storage";

const uploadsDir = path.join(process.cwd(), "public", "uploads");

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
 * bike form. Returns `local` when R2 isn't configured (dev), in which case
 * the form posts the files themselves.
 */
export async function requestImageUploads(
  files: ImageUploadRequest[],
): Promise<ImageUploadTargets> {
  const session = await getSession();
  if (!session) throw new Error("Not signed in.");
  if (!isR2Configured()) return { mode: "local" };

  if (files.length > MAX_IMAGES_PER_BIKE) {
    return {
      mode: "error",
      message: `You can add up to ${MAX_IMAGES_PER_BIKE} photos.`,
    };
  }
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

/** Turns uploaded R2 keys from the form into public URLs, after checks. */
async function resolveUploadedImages(
  userId: string,
  keys: string[],
): Promise<string[]> {
  if (keys.length === 0) return [];
  if (keys.length > MAX_IMAGES_PER_BIKE) {
    throw new Error(`You can add up to ${MAX_IMAGES_PER_BIKE} photos.`);
  }
  const prefix = userUploadPrefix(userId);
  for (const key of keys) {
    if (!key.startsWith(prefix) || key.includes("..")) {
      throw new Error("Invalid photo reference.");
    }
  }
  const exists = await Promise.all(keys.map(objectExists));
  if (exists.includes(false)) {
    throw new Error("A photo failed to upload. Please try again.");
  }
  return keys.map(publicImageUrl);
}

// Local-dev fallback when R2 isn't configured. Files written here don't
// survive a serverless deploy.
async function saveImagesLocally(
  bikeId: string,
  files: File[],
): Promise<string[]> {
  const validFiles = files.filter((file) => file.size > 0);
  if (validFiles.length === 0) return [];

  const bikeDir = path.join(uploadsDir, bikeId);
  await mkdir(bikeDir, { recursive: true });

  const urls: string[] = [];
  for (const [index, file] of validFiles.entries()) {
    const ext = path.extname(file.name) || "";
    const filename = `${index}-${Date.now()}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(bikeDir, filename), buffer);
    urls.push(`/uploads/${bikeId}/${filename}`);
  }
  return urls;
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
  const imageKeys = formData
    .getAll("imageKeys")
    .filter((k): k is string => typeof k === "string" && k.length > 0);
  const images = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File);
  const imageUrls = isR2Configured()
    ? await resolveUploadedImages(session.user.id, imageKeys)
    : await saveImagesLocally(bikeId, images);

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

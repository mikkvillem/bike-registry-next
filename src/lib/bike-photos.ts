import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  deleteObject,
  isR2Configured,
  keyFromPublicUrl,
  MAX_IMAGES_PER_BIKE,
  objectExists,
  publicImageUrl,
  userUploadPrefix,
} from "@/lib/storage";

// Server-side half of the photo pipeline shared by "add bike" and "add
// photos to a bike". The browser converts and uploads first (see
// src/lib/photo-upload.ts), then posts either R2 keys (`imageKeys`) or, in
// local dev without R2, the files themselves (`images`).

const uploadsDir = path.join(process.cwd(), "public", "uploads");

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
  if (validFiles.length > MAX_IMAGES_PER_BIKE) {
    throw new Error(`You can add up to ${MAX_IMAGES_PER_BIKE} photos.`);
  }

  const bikeDir = path.join(uploadsDir, bikeId);
  await mkdir(bikeDir, { recursive: true });

  const urls: string[] = [];
  for (const file of validFiles) {
    const ext = path.extname(file.name) || "";
    const filename = `${crypto.randomUUID()}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(bikeDir, filename), buffer);
    urls.push(`/uploads/${bikeId}/${filename}`);
  }
  return urls;
}

/** Stores/verifies the photos posted with a form; returns their URLs. */
export async function photoUrlsFromForm(
  userId: string,
  bikeId: string,
  formData: FormData,
): Promise<string[]> {
  if (isR2Configured()) {
    const keys = formData
      .getAll("imageKeys")
      .filter((k): k is string => typeof k === "string" && k.length > 0);
    return resolveUploadedImages(userId, keys);
  }
  const files = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File);
  return saveImagesLocally(bikeId, files);
}

/** Best-effort removal of a stored photo; the DB is the source of truth. */
export async function deleteStoredPhoto(url: string): Promise<void> {
  try {
    const key = keyFromPublicUrl(url);
    if (key) {
      await deleteObject(key);
      return;
    }
    if (url.startsWith("/uploads/") && !url.includes("..")) {
      await unlink(path.join(process.cwd(), "public", url));
    }
  } catch (error) {
    console.error("Failed to delete photo", url, error);
  }
}

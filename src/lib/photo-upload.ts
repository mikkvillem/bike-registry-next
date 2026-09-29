import { requestImageUploads } from "@/app/bikes/actions";
import { convertToWebp } from "@/lib/image-convert";

/**
 * Browser half of the photo pipeline: converts picked files to WebP, uploads
 * them straight to R2, and appends the resulting `imageKeys` to `formData`
 * (or the converted files as `images` in local dev without R2). The server
 * half is src/lib/bike-photos.ts.
 */
export async function uploadPhotos(
  picked: File[],
  formData: FormData,
  options: { bikeId?: string; onStatus?: (status: string) => void } = {},
): Promise<void> {
  if (picked.length === 0) return;
  const files: File[] = [];

  options.onStatus?.("Preparing photos…");

  // One at a time: decoding several full-size phone photos at once can
  // exhaust memory on phones.
  for (const file of picked) files.push(await convertToWebp(file));

  const targets = await requestImageUploads(
    files.map((file) => ({ contentType: file.type, size: file.size })),
    options.bikeId,
  );
  if (targets.mode === "error") throw new Error(targets.message);
  if (targets.mode === "local") {
    for (const file of files) formData.append("images", file);
    return;
  }

  options.onStatus?.(`Uploading ${files.length} photo(s)…`);
  await Promise.all(
    targets.uploads.map(async ({ url }, i) => {
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": files[i].type },
        body: files[i],
      });
      if (!res.ok) throw new Error("A photo failed to upload.");
    }),
  );
  for (const { key } of targets.uploads) formData.append("imageKeys", key);
}

/** The non-empty files picked in a form's `images` input. */
export function takePickedFiles(formData: FormData): File[] {
  const picked = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0);
  formData.delete("images");
  return picked;
}

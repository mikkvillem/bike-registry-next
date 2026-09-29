// Browser-only: converts a picked photo to WebP before upload. Re-encoding
// also drops EXIF metadata (GPS location, camera serial), and large photos
// are scaled down so uploads stay small.

const MAX_DIMENSION = 2560;
const QUALITY = 0.82;

let canvasWebpSupport: Promise<boolean> | null = null;

// Safari's canvas can't encode WebP (it silently returns PNG), so check once
// and fall back to a WASM encoder there.
function canvasEncodesWebp(): Promise<boolean> {
  canvasWebpSupport ??= new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    canvas.toBlob((blob) => resolve(blob?.type === "image/webp"), "image/webp");
  });
  return canvasWebpSupport;
}

async function encodeWithWasm(canvas: HTMLCanvasElement): Promise<Blob> {
  const { default: encode } = await import("@jsquash/webp/encode");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable.");
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const buffer = await encode(data, { quality: QUALITY * 100 });
  return new Blob([buffer], { type: "image/webp" });
}

function encodeWithCanvas(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("WebP encoding failed.")),
      "image/webp",
      QUALITY,
    );
  });
}

export async function convertToWebp(file: File): Promise<File> {
  let bitmap: ImageBitmap;
  try {
    // Applies EXIF orientation, so portrait phone photos stay upright.
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(
      `Couldn't read "${file.name}". Try a JPEG or PNG version of the photo.`,
    );
  }

  const scale = Math.min(
    1,
    MAX_DIMENSION / Math.max(bitmap.width, bitmap.height),
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable.");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = (await canvasEncodesWebp())
    ? await encodeWithCanvas(canvas)
    : await encodeWithWasm(canvas);

  const name = `${file.name.replace(/\.[^.]*$/, "") || "photo"}.webp`;
  return new File([blob], name, { type: "image/webp" });
}

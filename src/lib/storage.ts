import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Bike photos live in Cloudflare R2 (S3-compatible API). The browser uploads
// straight to R2 with a short-lived presigned PUT URL, so large phone photos
// never pass through our server (serverless request bodies are capped at a
// few MB). When the R2_* env vars are missing, callers fall back to writing
// under public/uploads for local dev.

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGES_PER_BIKE = 8;

// The browser converts every photo to WebP before upload
// (src/lib/image-convert.ts), so that's all we accept.
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/webp": "webp",
};

const UPLOAD_URL_TTL_SECONDS = 10 * 60;

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicUrl: string;
};

function readConfig(): R2Config | null {
  const {
    R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_BUCKET,
    R2_PUBLIC_URL,
  } = process.env;
  if (
    !R2_ACCOUNT_ID ||
    !R2_ACCESS_KEY_ID ||
    !R2_SECRET_ACCESS_KEY ||
    !R2_BUCKET ||
    !R2_PUBLIC_URL
  ) {
    return null;
  }
  return {
    accountId: R2_ACCOUNT_ID,
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
    bucket: R2_BUCKET,
    publicUrl: R2_PUBLIC_URL.replace(/\/$/, ""),
  };
}

let cachedClient: S3Client | null = null;

function client(config: R2Config): S3Client {
  cachedClient ??= new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    // The SDK otherwise bakes a checksum of an empty body into presigned
    // URLs, which makes R2 reject the browser's real upload.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
  return cachedClient;
}

export function isR2Configured(): boolean {
  return readConfig() !== null;
}

function requireConfig(): R2Config {
  const config = readConfig();
  if (!config) throw new Error("Cloudflare R2 is not configured.");
  return config;
}

/** Key prefix a user's uploads must live under; used to check ownership. */
export function userUploadPrefix(userId: string): string {
  return `bikes/${userId}/`;
}

export function newImageKey(userId: string, contentType: string): string {
  const ext = ALLOWED_IMAGE_TYPES[contentType];
  if (!ext) throw new Error(`Unsupported image type: ${contentType}`);
  return `${userUploadPrefix(userId)}${crypto.randomUUID()}.${ext}`;
}

/**
 * Presigned PUT URL for one object. Content type and length are signed, so
 * the browser must upload exactly the file it declared.
 */
export async function createUploadUrl(
  key: string,
  contentType: string,
  contentLength: number,
): Promise<string> {
  const config = requireConfig();
  return getSignedUrl(
    client(config),
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      ContentType: contentType,
      ContentLength: contentLength,
    }),
    {
      expiresIn: UPLOAD_URL_TTL_SECONDS,
      signableHeaders: new Set(["content-type", "content-length"]),
    },
  );
}

/** True if the object was actually uploaded. */
export async function objectExists(key: string): Promise<boolean> {
  const config = requireConfig();
  try {
    await client(config).send(
      new HeadObjectCommand({ Bucket: config.bucket, Key: key }),
    );
    return true;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "NotFound" || error.name === "NoSuchKey")
    ) {
      return false;
    }
    throw error;
  }
}

export function publicImageUrl(key: string): string {
  return `${requireConfig().publicUrl}/${key}`;
}

/** The object key for a URL returned by publicImageUrl, or null. */
export function keyFromPublicUrl(url: string): string | null {
  const config = readConfig();
  if (!config) return null;
  const prefix = `${config.publicUrl}/`;
  return url.startsWith(prefix) ? url.slice(prefix.length) : null;
}

export async function deleteObject(key: string): Promise<void> {
  const config = requireConfig();
  await client(config).send(
    new DeleteObjectCommand({ Bucket: config.bucket, Key: key }),
  );
}

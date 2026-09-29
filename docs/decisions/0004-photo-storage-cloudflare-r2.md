# 0004 — Photo storage on Cloudflare R2

Date: 2026-09-28
Status: Accepted

## Context

Bike photos were written to `public/uploads` on local disk, which doesn't
persist on serverless hosting. The status doc listed Vercel Blob, S3 and
Cloudflare R2 as options.

## Decision

Owner chose **Cloudflare R2**. Implementation:

- S3-compatible API via `@aws-sdk/client-s3` + presigner (no Cloudflare
  lock-in in code; any S3-compatible store works by changing the endpoint).
- **Direct browser uploads** with presigned PUT URLs (10 min TTL, content
  type + length signed). Keeps large phone photos off our server, whose
  request bodies are capped (~1 MB for server actions, 4.5 MB on Vercel).
- **Public bucket** (custom domain or r2.dev) for reads. Photos are already
  public on `/b/[id]`, so no signed read URLs.
- Keys `bikes/<userId>/<uuid>.<ext>`; the server checks the prefix and that
  the object exists before saving a bike.
- **All photos converted to WebP in the browser** before upload (owner's
  call, 2026-09-29; `src/lib/image-convert.ts`): long edge capped at
  2560 px, quality 0.82. Canvas encoder where supported; Safari can't
  encode WebP on a canvas, so it lazy-loads a WASM encoder
  (`@jsquash/webp`). Re-encoding also strips EXIF metadata, including GPS
  location. The server only accepts `image/webp`.
- Limits: 8 photos per bike, 10 MB each (after conversion).
- Local-disk fallback stays for dev when `R2_*` env vars are unset.

## Consequences

- Setup steps in `docs/r2-setup.md` (bucket, public access, CORS, token,
  env vars).
- Follow-ups: clean up orphaned uploads from abandoned forms; delete photos
  when a bike is deleted (once delete exists). HEIC files can only be
  converted by browsers that can decode them (Safari/iOS); elsewhere the
  user is asked for a JPEG/PNG. iPhones mostly hand the browser a JPEG
  anyway.
- The limits above are defaults, not a product decision; change freely.

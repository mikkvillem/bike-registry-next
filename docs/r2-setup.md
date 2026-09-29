# Cloudflare R2 setup (bike photos)

Photos are uploaded by the browser straight to R2 with short-lived presigned
URLs, then served from the bucket's public URL. Code: `src/lib/storage.ts`,
`requestImageUploads` in `src/app/bikes/actions.ts`,
`src/app/bikes/new/bike-form.tsx`. Without the `R2_*` env vars the app falls
back to `public/uploads` (local dev only).

## 1. Create the bucket

Cloudflare dashboard → **R2** → **Create bucket**. Name e.g. `bike-photos`.
Location hint: **Eastern Europe (EEUR)** is closest to Estonia.

## 2. Make it publicly readable

Bucket → **Settings** → **Public access**:

- **Custom domain** (recommended for production), e.g. `img.<your-domain>`
  — needs the domain on Cloudflare. Gets caching and no rate limit.
- or **R2.dev subdomain** — fine for testing; rate-limited, not for prod.

That URL (no trailing slash) is `R2_PUBLIC_URL`.

Only bike photos go in this bucket; they're already shown on the public
`/b/[id]` page. Object keys are random UUIDs, so they're unguessable but
not secret.

## 3. CORS (required for browser uploads)

Bucket → **Settings** → **CORS policy** → paste, with your real origins:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://your-production-domain"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["content-type"],
    "MaxAgeSeconds": 3600
  }
]
```

## 4. API token

R2 overview → **Manage R2 API Tokens** → **Create API token**:

- Permission: **Object Read & Write**
- Scope: **Apply to specific buckets only** → the bucket above

Copy the **Access Key ID** and **Secret Access Key** (shown once). Your
**Account ID** is on the R2 overview page.

## 5. Env vars

Set in `.env` locally and in the hosting provider for production:

```
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=bike-photos
R2_PUBLIC_URL=https://img.your-domain
```

## Optional: clean up abandoned uploads

If someone uploads photos and then abandons the form, the objects stay in
the bucket unreferenced. Not handled yet (see `docs/status.md`).

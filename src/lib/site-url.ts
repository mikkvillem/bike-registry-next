import { headers } from "next/headers";

// Absolute base URL (no trailing slash), used for QR codes and printable
// labels that need to work outside of a request (e.g. a scanned code).
// Prefer an explicit env var in production; fall back to the current
// request's host during local/dev use.
export async function getSiteUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

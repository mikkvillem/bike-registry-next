import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <p className="text-sm opacity-60">Bike Registry</p>
      <h1 className="mt-1 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm opacity-70">
        This page doesn't exist, or the bike registration was removed.
      </p>
      <div className="mt-6 flex gap-4 text-sm">
        <Link href="/search" className="underline">
          Check a serial number
        </Link>
        <Link href="/stolen" className="underline">
          Stolen bikes
        </Link>
      </div>
    </main>
  );
}

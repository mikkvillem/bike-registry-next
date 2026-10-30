import Link from "next/link";

/**
 * Shared shell for /privacy and /terms. These routes exist so links have
 * somewhere to point and the real text can slot in later; the content is a
 * placeholder, not a policy. See Q5 in docs/questions.md — the legal entity
 * and the text itself are the owner's call, and the agent loop does not
 * write legal copy.
 *
 * Deliberately avoids the product name so this merges independently of the
 * i18n branch, which is where that constant lives.
 */
export function LegalPlaceholder({
  title,
  summary,
}: {
  title: string;
  summary: string;
}) {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">{title}</h1>

      <div className="mt-4 rounded border border-amber-600 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100">
        <p className="font-semibold">This page is not written yet.</p>
        <p className="mt-1">
          This site is not open to the public yet, and the text below is a
          placeholder rather than a legal document. Do not rely on it.
        </p>
      </div>

      <p className="mt-6 text-sm opacity-70">{summary}</p>

      <p className="mt-6 text-sm opacity-70">
        Until the real text is published, assume nothing about how your data is
        handled beyond what you can see on the site itself.
      </p>

      <div className="mt-8 flex gap-4 text-sm">
        <Link href="/" className="underline">
          Home
        </Link>
        <Link href="/search" className="underline">
          Check a serial number
        </Link>
      </div>
    </main>
  );
}

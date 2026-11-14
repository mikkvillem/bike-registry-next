import Link from "next/link";
import { PRODUCT_NAME } from "@/lib/brand";
import { getT } from "@/lib/locale-server";

export default async function NotFound() {
  const { t } = await getT();

  return (
    <main className="mx-auto max-w-2xl p-6">
      <p className="text-sm opacity-60">{PRODUCT_NAME}</p>
      <h1 className="mt-1 text-2xl font-semibold">{t.notFound.title}</h1>
      <p className="mt-2 text-sm opacity-70">{t.notFound.body}</p>
      <div className="mt-6 flex gap-4 text-sm">
        <Link href="/search" className="underline">
          {t.notFound.checkSerial}
        </Link>
        <Link href="/stolen" className="underline">
          {t.notFound.stolenBikes}
        </Link>
      </div>
    </main>
  );
}

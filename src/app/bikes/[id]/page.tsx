import { and, eq, isNull } from "drizzle-orm";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { bicycle } from "@/db/schema/schema";
import { getSession } from "@/lib/session";

export default async function BikePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/");

  const [bike] = await db
    .select()
    .from(bicycle)
    .where(and(eq(bicycle.id, id), isNull(bicycle.deletedAt)))
    .limit(1);

  if (!bike || bike.userId !== session.user.id) notFound();

  return (
    <main className="mx-auto max-w-2xl p-6">
      <Link href="/dashboard" className="text-sm opacity-70 hover:underline">
        &larr; Back to dashboard
      </Link>

      <div className="mt-4 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">
          {bike.make} {bike.model}
        </h1>
        <a
          href={`/bikes/${bike.id}/label`}
          className="shrink-0 rounded border px-3 py-1.5 text-sm hover:bg-black/5"
        >
          Download QR label (PDF)
        </a>
      </div>

      {bike.imageUrls && bike.imageUrls.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {bike.imageUrls.map((url) => (
            // biome-ignore lint/performance/noImgElement: local file uploads, not optimizable by next/image
            <img
              key={url}
              src={url}
              alt=""
              className="aspect-square w-full rounded object-cover"
            />
          ))}
        </div>
      )}

      <dl className="mt-6 grid grid-cols-2 gap-y-3 text-sm">
        <dt className="opacity-60">Serial number</dt>
        <dd>{bike.serialNumber}</dd>
        <dt className="opacity-60">Type</dt>
        <dd>{bike.type ?? "—"}</dd>
        <dt className="opacity-60">Gender</dt>
        <dd>{bike.gender ?? "—"}</dd>
        <dt className="opacity-60">Gear system</dt>
        <dd>{bike.gearSystem ?? "—"}</dd>
        <dt className="opacity-60">Number of gears</dt>
        <dd>{bike.numGears ?? "—"}</dd>
        <dt className="opacity-60">Wheel size</dt>
        <dd>{bike.wheelSize ?? "—"}</dd>
        <dt className="opacity-60">Weight</dt>
        <dd>{bike.weight ? `${bike.weight} kg` : "—"}</dd>
      </dl>

      {bike.description && (
        <p className="mt-6 whitespace-pre-wrap text-sm">{bike.description}</p>
      )}
    </main>
  );
}

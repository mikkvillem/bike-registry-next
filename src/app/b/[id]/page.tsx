import { and, desc, eq, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { bicycle, theft } from "@/db/schema/schema";

// Public, no-auth bike status page. Linked from the printable QR label so a
// finder, buyer, or police officer can check registration + theft status by
// scanning the tag. Keep this page free of PII beyond what the owner has
// explicitly opted into (see theft.contactPublic).
export default async function PublicBikePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [bike] = await db
    .select()
    .from(bicycle)
    .where(and(eq(bicycle.id, id), isNull(bicycle.deletedAt)))
    .limit(1);

  if (!bike) notFound();

  const [activeTheft] = await db
    .select()
    .from(theft)
    .where(and(eq(theft.bicycleId, bike.id), isNull(theft.deletedAt)))
    .orderBy(desc(theft.createdAt))
    .limit(1);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <p className="text-sm opacity-60">Bike Registry</p>
      <h1 className="mt-1 text-2xl font-semibold">{bike.type ?? "Bike"}</h1>

      {activeTheft ? (
        <div className="mt-4 rounded border border-red-600 bg-red-50 p-4 text-red-800">
          <p className="font-semibold">Reported stolen</p>
          <p className="text-sm opacity-80">
            Reported on {activeTheft.createdAt.toLocaleDateString()}.
            {activeTheft.contactPublic && activeTheft.contact
              ? ` Contact: ${activeTheft.contact}`
              : " If you have information about this bike, contact local police."}
          </p>
        </div>
      ) : (
        <div className="mt-4 rounded border border-green-600 bg-green-50 p-4 text-green-800">
          <p className="font-semibold">Registered — not reported stolen</p>
        </div>
      )}

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
    </main>
  );
}

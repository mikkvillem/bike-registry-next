import { and, eq, isNull } from "drizzle-orm";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { updateBike } from "@/app/bikes/actions";
import { BikeFields } from "@/app/bikes/bike-fields";
import { BikeForm } from "@/app/bikes/new/bike-form";
import { db } from "@/db";
import { bicycle } from "@/db/schema/schema";
import { getSession } from "@/lib/session";
import { DeleteBikeButton } from "./delete-bike-button";

export default async function EditBikePage({
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
    <main className="mx-auto max-w-lg p-6">
      <Link
        href={`/bikes/${id}`}
        className="text-sm opacity-70 hover:underline"
      >
        &larr; Back to bike
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">Edit bike</h1>

      <BikeForm
        action={updateBike.bind(null, id)}
        withPhotos={false}
        submitLabel="Save changes"
      >
        <BikeFields bike={bike} />
      </BikeForm>

      <section className="mt-10 rounded border border-red-600/40 p-4">
        <h2 className="text-sm font-semibold text-red-700">Delete bike</h2>
        <p className="mt-1 text-sm opacity-70">
          Removes the registration, its public QR page and any theft report. The
          serial number becomes available to register again.
        </p>
        <DeleteBikeButton bikeId={id} />
      </section>
    </main>
  );
}

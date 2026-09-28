import { and, eq, isNull } from "drizzle-orm";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { reportTheft } from "@/app/bikes/[id]/theft/actions";
import { db } from "@/db";
import { bicycle, theft } from "@/db/schema/schema";
import { getSession } from "@/lib/session";

export default async function ReportTheftPage({
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

  const [openReport] = await db
    .select({ id: theft.id })
    .from(theft)
    .where(
      and(
        eq(theft.bicycleId, bike.id),
        eq(theft.status, "active"),
        isNull(theft.deletedAt),
      ),
    )
    .limit(1);

  if (openReport) redirect(`/bikes/${bike.id}`);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="mx-auto max-w-lg p-6">
      <Link
        href={`/bikes/${bike.id}`}
        className="text-sm opacity-70 hover:underline"
      >
        &larr; Back to bike
      </Link>

      <h1 className="mt-4 text-2xl font-semibold">Report stolen</h1>
      <p className="mt-1 text-sm opacity-70">
        {bike.make} {bike.model} &middot; serial {bike.serialNumber}
      </p>

      <form
        action={reportTheft.bind(null, bike.id)}
        className="mt-6 flex flex-col gap-4"
      >
        <label className="flex flex-col gap-1 text-sm">
          Date stolen
          <input
            type="date"
            name="stolenOn"
            required
            defaultValue={today}
            className="rounded border border-black/20 p-2 dark:border-white/20"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Where it was stolen
          <input
            type="text"
            name="location"
            placeholder="e.g. Tallinn, outside Balti jaam"
            className="rounded border border-black/20 p-2 dark:border-white/20"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          What happened / distinguishing details
          <textarea
            name="description"
            rows={3}
            placeholder="Lock cut overnight. Red bell, scratch on top tube."
            className="rounded border border-black/20 p-2 dark:border-white/20"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Contact (phone or email)
          <input
            type="text"
            name="contact"
            className="rounded border border-black/20 p-2 dark:border-white/20"
          />
        </label>

        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="contactPublic" className="mt-1" />
          <span>
            Show my contact on the bike&apos;s public page so finders can reach
            me directly. If unchecked, finders are told to contact the police.
          </span>
        </label>

        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            name="publish"
            defaultChecked
            className="mt-1"
          />
          <span>
            Publish now — anyone scanning the bike&apos;s QR tag will see it
            marked as stolen, with the date, place, and details above.
          </span>
        </label>

        <button
          type="submit"
          className="mt-2 rounded bg-red-700 px-4 py-2 text-sm text-white"
        >
          Report stolen
        </button>
      </form>
    </main>
  );
}

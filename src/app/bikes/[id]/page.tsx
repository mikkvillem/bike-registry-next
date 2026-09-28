import { and, desc, eq, isNull } from "drizzle-orm";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  markTheftRecovered,
  publishTheft,
  withdrawTheft,
} from "@/app/bikes/[id]/theft/actions";
import { db } from "@/db";
import { bicycle, type Theft, theft } from "@/db/schema/schema";
import { getSession } from "@/lib/session";

function TheftDetails({ report }: { report: Theft }) {
  return (
    <dl className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
      <dt className="opacity-60">Date stolen</dt>
      <dd>{report.stolenOn ?? "—"}</dd>
      <dt className="opacity-60">Place</dt>
      <dd>{report.location ?? "—"}</dd>
      <dt className="opacity-60">Contact</dt>
      <dd>
        {report.contact ?? "—"}
        {report.contact && (
          <span className="opacity-60">
            {report.contactPublic ? " (public)" : " (private)"}
          </span>
        )}
      </dd>
      {report.description && (
        <>
          <dt className="opacity-60">Details</dt>
          <dd className="whitespace-pre-wrap">{report.description}</dd>
        </>
      )}
    </dl>
  );
}

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

  const reports = await db
    .select()
    .from(theft)
    .where(and(eq(theft.bicycleId, bike.id), isNull(theft.deletedAt)))
    .orderBy(desc(theft.createdAt));
  const openReport = reports.find((r) => r.status === "active");
  const pastReports = reports.filter((r) => r.status !== "active");

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

      {openReport ? (
        <section className="mt-4 rounded border border-red-600 bg-red-50 p-4 text-red-900">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold">
              {openReport.publishedAt
                ? `Reported stolen — public since ${openReport.publishedAt.toLocaleDateString()}`
                : "Theft report saved — not published yet"}
            </p>
            <Link
              href={`/b/${bike.id}`}
              className="text-sm underline opacity-80"
            >
              View public page
            </Link>
          </div>
          <TheftDetails report={openReport} />
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {!openReport.publishedAt && (
              <form action={publishTheft.bind(null, bike.id)}>
                <button
                  type="submit"
                  className="rounded bg-red-700 px-3 py-1.5 text-white"
                >
                  Publish as stolen
                </button>
              </form>
            )}
            <form action={markTheftRecovered.bind(null, bike.id)}>
              <button
                type="submit"
                className="rounded border border-red-700 px-3 py-1.5 hover:bg-red-100"
              >
                Mark recovered
              </button>
            </form>
            <form action={withdrawTheft.bind(null, bike.id)}>
              <button
                type="submit"
                className="rounded px-3 py-1.5 underline opacity-70 hover:opacity-100"
              >
                Withdraw report (filed by mistake)
              </button>
            </form>
          </div>
        </section>
      ) : (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded border border-black/10 p-4 text-sm dark:border-white/10">
          <p className="opacity-70">Not reported stolen.</p>
          <Link
            href={`/bikes/${bike.id}/theft/new`}
            className="rounded bg-red-700 px-3 py-1.5 text-white"
          >
            Report stolen
          </Link>
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

      {pastReports.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold opacity-70">
            Past theft reports
          </h2>
          <ul className="mt-2 flex flex-col gap-4">
            {pastReports.map((report) => (
              <li
                key={report.id}
                className="rounded border border-black/10 p-3 dark:border-white/10"
              >
                <p className="text-sm font-medium">
                  {report.status === "recovered" ? "Recovered" : "Resolved"}
                </p>
                <TheftDetails report={report} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

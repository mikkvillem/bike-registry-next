import { and, desc, eq, isNull } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { bicycle } from "@/db/schema/schema";
import { getSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const bikes = await db
    .select()
    .from(bicycle)
    .where(and(eq(bicycle.userId, session.user.id), isNull(bicycle.deletedAt)))
    .orderBy(desc(bicycle.createdAt));

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your bikes</h1>
        <Link
          href="/bikes/new"
          className="rounded bg-foreground px-4 py-2 text-sm text-background"
        >
          Add bike
        </Link>
      </div>

      {bikes.length === 0 ? (
        <p className="mt-8 text-sm opacity-70">
          You haven&apos;t added any bikes yet.
        </p>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {bikes.map((bike) => (
            <li key={bike.id}>
              <Link
                href={`/bikes/${bike.id}`}
                className="block rounded border border-black/10 p-4 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
              >
                {bike.imageUrls?.[0] && (
                  // biome-ignore lint/performance/noImgElement: local file uploads, not optimizable by next/image
                  <img
                    src={bike.imageUrls[0]}
                    alt=""
                    className="mb-3 h-40 w-full rounded object-cover"
                  />
                )}
                <p className="font-medium">{bike.type ?? "Unspecified type"}</p>
                <p className="text-sm opacity-70">
                  {bike.wheelSize
                    ? `${bike.wheelSize} wheels`
                    : "No details yet"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

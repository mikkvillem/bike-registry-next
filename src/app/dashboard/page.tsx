import { and, desc, eq, isNull } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BikeIllustration,
  CornerMarks,
  HorizontalDivider,
} from "@/components/framing";
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
    <main className="relative mx-3 my-3 border border-black/10 sm:mx-4 sm:my-4 dark:border-white/10">
      <CornerMarks tone="text-foreground/30" />

      <div className="flex items-center justify-between px-6 py-8 sm:px-12">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase opacity-60">
            Your collection
          </p>
          <h1 className="mt-1 text-2xl font-semibold">Your bikes</h1>
        </div>
        <Link
          href="/bikes/new"
          className="rounded bg-foreground px-4 py-2 text-sm whitespace-nowrap text-background"
        >
          Add bike
        </Link>
      </div>

      <HorizontalDivider className="h-4 w-full text-black/15 dark:text-white/15" />

      <div className="px-6 py-8 sm:px-12">
        {bikes.length === 0 ? (
          <p className="text-sm opacity-70">
            You haven&apos;t added any bikes yet.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-0">
            {bikes.map((bike, i) => {
              const isRightColumn = i % 2 === 1;
              const isFirstRow = i < 2;
              return (
                <li
                  key={bike.id}
                  className={`border-dotted border-black/15 dark:border-white/15 ${
                    isRightColumn ? "sm:border-l" : ""
                  } ${isFirstRow ? "" : "sm:border-t"}`}
                >
                  <Link
                    href={`/bikes/${bike.id}`}
                    className="block hover:bg-black/[0.03] sm:p-6 dark:hover:bg-white/[0.03]"
                  >
                    {bike.imageUrls?.[0] ? (
                      // biome-ignore lint/performance/noImgElement: local file uploads, not optimizable by next/image
                      <img
                        src={bike.imageUrls[0]}
                        alt=""
                        className="mb-4 h-48 w-full object-cover"
                      />
                    ) : (
                      <div className="mb-4 flex h-48 w-full items-center justify-center bg-foreground/5">
                        <BikeIllustration className="h-16 w-16 opacity-30" />
                      </div>
                    )}
                    <p className="text-xs font-semibold tracking-[0.15em] uppercase opacity-50">
                      {bike.gender ?? "Bike"}
                    </p>
                    <p className="mt-1 font-medium">
                      {bike.make} {bike.model}
                    </p>
                    <p className="text-sm opacity-70">
                      {bike.wheelSize
                        ? `${bike.wheelSize} wheels`
                        : "No details yet"}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}

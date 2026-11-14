import Link from "next/link";
import { CornerMarks, HorizontalDivider } from "@/components/framing";
import type { bicycle, theft } from "@/db/schema/schema";
import { PRODUCT_NAME } from "@/lib/brand";
import type { Dictionary } from "@/lib/i18n";

type Bike = typeof bicycle.$inferSelect;
type Theft = typeof theft.$inferSelect;

/** Make + model, or the generic bike-type word when neither is recorded. */
export function bikeName(
  bike: Pick<Bike, "make" | "model">,
  t: Dictionary,
): string {
  return (
    [bike.make, bike.model].filter(Boolean).join(" ") || t.bikeType.fallback
  );
}

/**
 * The public bike page's presentation, with no data fetching, so it can be
 * rendered against fixtures.
 *
 * Phone first: whoever opens this is standing next to a bike, outdoors, on a
 * phone. The theft status is the whole point, so it is a full-width band at
 * the top that needs no scrolling and no reading — then the bike's identity,
 * then photos to match against the bike in front of them, then the specs.
 *
 * Deliberately absent: the serial number. Showing it would let anyone who
 * scans a tag copy the serial and file a competing claim; whether to show it
 * masked is question Q2 in docs/questions.md.
 */
export function BikeStatus({
  bike,
  activeTheft,
  t,
}: {
  bike: Bike;
  activeTheft: Theft | undefined;
  t: Dictionary;
}) {
  const name = bikeName(bike, t);
  const typeLabel = bike.type ? t.bikeType[bike.type] : t.bikeType.fallback;
  const [coverPhoto, ...otherPhotos] = bike.imageUrls ?? [];

  return (
    <main className="relative mx-3 my-3 border border-black/10 sm:mx-4 sm:my-4 dark:border-white/10">
      <CornerMarks tone="text-foreground/30" />

      {/* The glanceable verdict. Red panel when stolen, the design system's
          inverted neutral panel when not. The status word carries the same
          meaning as the colour, so it does not rely on colour alone. */}
      <section
        className={`relative px-5 py-10 sm:px-10 sm:py-12 ${
          activeTheft
            ? "bg-red-700 text-white dark:bg-red-800"
            : "bg-foreground text-background"
        }`}
      >
        <CornerMarks
          tone={activeTheft ? "text-white/40" : "text-background/50"}
        />
        <p className="text-xs font-semibold tracking-[0.2em] uppercase opacity-70">
          {PRODUCT_NAME}
        </p>
        {/* Sized so the longest status word still fits a 375px phone:
            Estonian's "REGISTREERITUD" overflowed at text-4xl. */}
        <p className="mt-3 text-3xl leading-none font-semibold tracking-[0.04em] break-words uppercase sm:text-5xl sm:tracking-[0.06em]">
          {activeTheft ? t.bikePage.statusStolen : t.bikePage.statusRegistered}
        </p>
        <p className="mt-4 max-w-md text-sm opacity-80 sm:text-base">
          {activeTheft ? t.bikePage.stolenLead : t.bikePage.registeredLead}
        </p>
      </section>

      {/* Identity: make and model, which the old page never showed at all. */}
      <section className="px-5 py-8 sm:px-10">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase opacity-60">
          {typeLabel}
        </p>
        <h1 className="mt-2 text-3xl leading-tight font-semibold sm:text-4xl">
          {name}
        </h1>

        {coverPhoto && (
          <div className="mt-6">
            {/* biome-ignore lint/performance/noImgElement: user uploads (R2 or local), not optimized via next/image */}
            <img
              src={coverPhoto}
              alt={t.bikePage.photoAlt(name)}
              className="aspect-[4/3] w-full rounded object-cover"
            />
            {otherPhotos.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {otherPhotos.map((url) => (
                  // biome-ignore lint/performance/noImgElement: user uploads (R2 or local), not optimized via next/image
                  <img
                    key={url}
                    src={url}
                    alt={t.bikePage.photoAlt(name)}
                    className="aspect-square w-full rounded object-cover"
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {activeTheft && (
        <>
          <HorizontalDivider className="h-4 w-full text-black/15 dark:text-white/15" />

          <section className="px-5 py-8 sm:px-10">
            <h2 className="text-sm font-semibold tracking-[0.15em] uppercase opacity-60">
              {t.bikePage.theftHeading}
            </h2>

            <dl className="mt-4 text-sm">
              {activeTheft.stolenOn && (
                <SpecRow
                  label={t.bikePage.theft.stolenOn}
                  value={activeTheft.stolenOn}
                />
              )}
              {activeTheft.location && (
                <SpecRow
                  label={t.bikePage.theft.location}
                  value={activeTheft.location}
                />
              )}
              <SpecRow
                label={t.bikePage.theft.reportedOn}
                value={
                  activeTheft.publishedAt
                    ? isoDate(activeTheft.publishedAt)
                    : t.bikePage.specs.empty
                }
              />
            </dl>

            {activeTheft.description && (
              <div className="mt-5">
                <p className="text-xs font-semibold tracking-[0.15em] uppercase opacity-60">
                  {t.bikePage.theft.details}
                </p>
                <p className="mt-2 text-sm whitespace-pre-wrap opacity-80">
                  {activeTheft.description}
                </p>
              </div>
            )}

            {/* The action. Contact only when the owner opted in (decision
                0002); otherwise point at the police, per Q3's default. */}
            <div className="mt-6 border border-red-600/40 bg-red-50 p-4 text-red-900 dark:bg-red-950/40 dark:text-red-100">
              <p className="font-semibold">{t.bikePage.seenHeading}</p>
              {activeTheft.contactPublic && activeTheft.contact ? (
                <>
                  <p className="mt-1 text-sm">{t.bikePage.contactLead}</p>
                  <p className="mt-2 font-mono text-sm break-all">
                    {activeTheft.contact}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm">{t.bikePage.policeLead}</p>
              )}
            </div>
          </section>
        </>
      )}

      <HorizontalDivider className="h-4 w-full text-black/15 dark:text-white/15" />

      <section className="px-5 py-8 sm:px-10">
        <h2 className="text-sm font-semibold tracking-[0.15em] uppercase opacity-60">
          {t.bikePage.specsHeading}
        </h2>
        <dl className="mt-4 text-sm">
          <SpecRow
            label={t.bikePage.specs.make}
            value={bike.make ?? t.bikePage.specs.empty}
          />
          <SpecRow
            label={t.bikePage.specs.model}
            value={bike.model ?? t.bikePage.specs.empty}
          />
          <SpecRow
            label={t.bikePage.specs.type}
            value={bike.type ? t.bikeType[bike.type] : t.bikePage.specs.empty}
          />
          <SpecRow
            label={t.bikePage.specs.gender}
            value={bike.gender ? t.gender[bike.gender] : t.bikePage.specs.empty}
          />
          <SpecRow
            label={t.bikePage.specs.gearSystem}
            value={
              bike.gearSystem
                ? t.gearSystem[bike.gearSystem]
                : t.bikePage.specs.empty
            }
          />
          <SpecRow
            label={t.bikePage.specs.numGears}
            value={bike.numGears ?? t.bikePage.specs.empty}
          />
          <SpecRow
            label={t.bikePage.specs.wheelSize}
            value={bike.wheelSize ?? t.bikePage.specs.empty}
          />
          <SpecRow
            label={t.bikePage.specs.weight}
            value={
              bike.weight
                ? t.bikePage.specs.kilograms(bike.weight)
                : t.bikePage.specs.empty
            }
          />
        </dl>
      </section>

      <HorizontalDivider className="h-4 w-full text-black/15 dark:text-white/15" />

      <section className="px-5 py-6 sm:px-10">
        <p className="text-sm opacity-70">{t.bikePage.footerLead}</p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <Link href="/search" className="underline">
            {t.bikePage.checkAnother}
          </Link>
          <Link href="/stolen" className="underline">
            {t.bikePage.browseStolen}
          </Link>
        </div>
      </section>
    </main>
  );
}

/**
 * A date as YYYY-MM-DD, matching how `stolenOn` is stored and shown, so the
 * theft panel doesn't put two notations side by side.
 *
 * Deliberately not `toLocaleDateString`: this renders on the server, which
 * runs in UTC on Vercel, so a locale-formatted date silently shifts by a day
 * for a report published late in the Estonian evening. ISO at least says
 * plainly which calendar day it means. Picking a display timezone is a
 * market decision, not this component's — parked as a question.
 */
function isoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

/** One label/value row. Stacks on a narrow phone, two columns from `sm`. */
function SpecRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-0.5 border-t border-black/10 py-2.5 sm:flex-row sm:gap-4 dark:border-white/10">
      <dt className="shrink-0 opacity-60 sm:w-40">{label}</dt>
      <dd className="min-w-0 break-words">{value}</dd>
    </div>
  );
}

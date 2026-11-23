import Link from "next/link";
import { redirect } from "next/navigation";
import { SignInButton } from "@/app/auth-buttons";
import {
  BikeIllustration,
  CornerMarks,
  HorizontalDivider,
  VerticalDivider,
} from "@/components/framing";
import { getT } from "@/lib/locale-server";
import { getSession } from "@/lib/session";

// Copy and structure are decision 0006: say what the registry is, and make
// the serial check — the one action that needs no account — the primary
// button. The old page offered a visitor nothing but a Google sign-in, which
// shut out the second-hand buyer and the finder entirely.
export default async function Home() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  const { locale, t } = await getT();

  return (
    <main className="relative mx-3 my-3 border border-black/10 sm:mx-4 sm:my-4 dark:border-white/10">
      <CornerMarks tone="text-foreground/30" />

      <section className="grid lg:grid-cols-2">
        <div className="flex flex-col justify-center gap-6 px-6 py-16 sm:px-12 lg:px-16">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase opacity-60">
            {t.home.eyebrow}
          </p>
          <h1 className="text-4xl leading-tight font-semibold sm:text-5xl">
            {t.home.headline}
          </h1>
          <p className="max-w-md text-base opacity-70">{t.home.body}</p>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href="/search"
                className="rounded bg-foreground px-4 py-2 text-sm text-background"
              >
                {t.home.checkCta}
              </Link>
              <SignInButton
                locale={locale}
                variant="secondary"
                label={t.home.registerCta}
              />
            </div>
            <p className="max-w-md text-xs opacity-60">{t.home.ctaNote}</p>
          </div>
        </div>

        <div className="relative flex min-h-[320px] items-center justify-center bg-foreground px-8 py-16 text-background lg:min-h-[560px]">
          <CornerMarks />
          <BikeIllustration className="w-full max-w-sm" />
        </div>
      </section>

      <HorizontalDivider className="h-4 w-full text-black/15 dark:text-white/15" />

      <section className="px-6 py-12 sm:px-12 lg:px-16">
        <h2 className="text-sm font-semibold tracking-[0.15em] uppercase opacity-60">
          {t.home.howItWorks}
        </h2>
        <div className="relative mt-6 grid gap-8 sm:grid-cols-3 sm:gap-0">
          <VerticalDivider className="absolute inset-y-0 left-1/3 hidden w-4 -translate-x-1/2 text-black/15 sm:block dark:text-white/15" />
          <VerticalDivider className="absolute inset-y-0 left-2/3 hidden w-4 -translate-x-1/2 text-black/15 sm:block dark:text-white/15" />
          <Feature
            className="sm:pr-8"
            title={t.home.features.checkTitle}
            description={t.home.features.checkBody}
          />
          <Feature
            className="sm:px-8"
            title={t.home.features.publishTitle}
            description={t.home.features.publishBody}
          />
          <Feature
            className="sm:pl-8"
            title={t.home.features.tagTitle}
            description={t.home.features.tagBody}
          />
        </div>
      </section>
    </main>
  );
}

function Feature({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm opacity-70">{description}</p>
    </div>
  );
}

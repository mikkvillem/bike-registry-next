import { redirect } from "next/navigation";
import { SignInButton } from "@/app/auth-buttons";
import {
  BikeIllustration,
  CornerMarks,
  HorizontalDivider,
  VerticalDivider,
} from "@/components/framing";
import { getSession } from "@/lib/session";

export default async function Home() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <main className="relative mx-3 my-3 border border-black/10 sm:mx-4 sm:my-4 dark:border-white/10">
      <CornerMarks tone="text-foreground/30" />

      <section className="grid lg:grid-cols-2">
        <div className="flex flex-col justify-center gap-6 px-6 py-16 sm:px-12 lg:px-16">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase opacity-60">
            Your bikes, catalogued
          </p>
          <h1 className="text-4xl leading-tight font-semibold sm:text-5xl">
            The bike registry system
          </h1>
          <p className="max-w-md text-base opacity-70">
            Keep track of every bike you own — photos, specs, and details, all
            organized in one place. Built in-house, no spreadsheets required.
          </p>
          <div>
            <SignInButton />
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
          Discover the details
        </h2>
        <div className="relative mt-6 grid gap-8 sm:grid-cols-3 sm:gap-0">
          <VerticalDivider className="absolute inset-y-0 left-1/3 hidden w-4 -translate-x-1/2 text-black/15 sm:block dark:text-white/15" />
          <VerticalDivider className="absolute inset-y-0 left-2/3 hidden w-4 -translate-x-1/2 text-black/15 sm:block dark:text-white/15" />
          <Feature
            className="sm:pr-8"
            title="Full specs"
            description="Type, gearing, wheel size, weight — recorded once, never forgotten."
          />
          <Feature
            className="sm:px-8"
            title="Photos included"
            description="Attach photos to every bike so you always have proof of what you own."
          />
          <Feature
            className="sm:pl-8"
            title="One dashboard"
            description="Every bike you register, in a single list you can search anytime."
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

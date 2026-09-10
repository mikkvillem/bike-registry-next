import { redirect } from "next/navigation";
import { SignInButton } from "@/app/auth-buttons";
import { getSession } from "@/lib/session";

export default async function Home() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <main>
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
          <BikeIllustration className="w-full max-w-sm" />
        </div>
      </section>

      <section className="border-t border-black/10 px-6 py-12 sm:px-12 lg:px-16 dark:border-white/10">
        <h2 className="text-sm font-semibold tracking-[0.15em] uppercase opacity-60">
          Discover the details
        </h2>
        <div className="mt-6 grid gap-8 sm:grid-cols-3">
          <Feature
            title="Full specs"
            description="Type, gearing, wheel size, weight — recorded once, never forgotten."
          />
          <Feature
            title="Photos included"
            description="Attach photos to every bike so you always have proof of what you own."
          />
          <Feature
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
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm opacity-70">{description}</p>
    </div>
  );
}

function BikeIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-label="Illustration of a bicycle"
    >
      <circle cx="40" cy="90" r="24" />
      <circle cx="160" cy="90" r="24" />
      <path d="M40 90 L85 45 L120 45 L160 90" />
      <path d="M85 45 L70 90" />
      <path d="M120 45 L100 90" />
      <path d="M100 90 L40 90" />
      <path d="M120 45 L135 30 L150 30" />
      <path d="M85 45 L75 25 L95 25" />
      <circle cx="100" cy="90" r="4" fill="currentColor" stroke="none" />
    </svg>
  );
}

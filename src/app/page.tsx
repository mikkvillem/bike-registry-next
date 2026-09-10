import { redirect } from "next/navigation";
import { SignInButton } from "@/app/auth-buttons";
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

function CornerMarks({ tone = "text-background/50" }: { tone?: string }) {
  return (
    <>
      <CornerMark
        className={`top-0 left-0 -translate-x-1/2 -translate-y-1/2 ${tone}`}
      />
      <CornerMark
        className={`top-0 right-0 translate-x-1/2 -translate-y-1/2 ${tone}`}
      />
      <CornerMark
        className={`bottom-0 left-0 -translate-x-1/2 translate-y-1/2 ${tone}`}
      />
      <CornerMark
        className={`right-0 bottom-0 translate-x-1/2 translate-y-1/2 ${tone}`}
      />
    </>
  );
}

function CornerMark({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      className={`pointer-events-none absolute h-8 w-8 overflow-visible ${className}`}
    >
      <line
        x1="0"
        y1="16"
        x2="32"
        y2="16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="0.5 4"
      />
      <line
        x1="16"
        y1="0"
        x2="16"
        y2="32"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="0.5 4"
      />
      <circle cx="16" cy="16" r="1.5" fill="currentColor" />
    </svg>
  );
}

function HorizontalDivider({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none block ${className ?? ""}`}
    >
      <line
        x1="0"
        y1="50%"
        x2="100%"
        y2="50%"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="0.5 6"
      />
    </svg>
  );
}

function VerticalDivider({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none block ${className ?? ""}`}
    >
      <line
        x1="50%"
        y1="0"
        x2="50%"
        y2="100%"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="0.5 6"
      />
    </svg>
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

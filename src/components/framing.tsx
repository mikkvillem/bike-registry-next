export function CornerMarks({
  tone = "text-background/50",
}: {
  tone?: string;
}) {
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

export function HorizontalDivider({ className }: { className?: string }) {
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

export function VerticalDivider({ className }: { className?: string }) {
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

export function BikeIllustration({ className }: { className?: string }) {
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

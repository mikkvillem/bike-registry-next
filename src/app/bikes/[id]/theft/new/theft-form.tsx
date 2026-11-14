"use client";

import { unstable_rethrow } from "next/navigation";
import { type ReactNode, useState } from "react";
import type { TheftActionResult } from "@/app/bikes/[id]/theft/actions";

/**
 * Wraps the report-stolen form so validation errors from the action show up
 * inline instead of as an error page. Mirrors `BikeForm`, minus the photo
 * upload step.
 */
export function TheftForm({
  children,
  action,
  submitLabel,
  pendingLabel,
}: {
  children: ReactNode;
  action: (formData: FormData) => Promise<TheftActionResult>;
  submitLabel: string;
  pendingLabel: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(formData: FormData) {
    setError(null);
    setPending(true);
    try {
      const result = await action(formData);
      if (result?.error) {
        setPending(false);
        setError(result.error);
      }
    } catch (e) {
      unstable_rethrow(e); // let Next handle redirect() from the action
      setPending(false);
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  return (
    <form action={submit} className="mt-6 flex flex-col gap-4">
      {children}
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded bg-red-700 px-4 py-2 text-sm text-white disabled:opacity-60"
      >
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}

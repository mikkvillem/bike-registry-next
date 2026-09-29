"use client";

import { unstable_rethrow } from "next/navigation";
import { type ReactNode, useState } from "react";
import { createBike } from "@/app/bikes/actions";
import { takePickedFiles, uploadPhotos } from "@/lib/photo-upload";

// Wraps the add-bike form: photos are converted to WebP in the browser, then
// go straight to R2 (presigned PUTs) before the rest of the form is
// submitted with their keys.
export function BikeForm({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(formData: FormData) {
    setError(null);
    try {
      await uploadPhotos(takePickedFiles(formData), formData, {
        onStatus: setStatus,
      });

      setStatus("Saving…");
      await createBike(formData);
    } catch (e) {
      unstable_rethrow(e); // let Next handle redirect() from the action
      setStatus(null);
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
        disabled={status !== null}
        className="mt-2 rounded bg-foreground px-4 py-2 text-sm text-background disabled:opacity-60"
      >
        {status ?? "Save bike"}
      </button>
    </form>
  );
}

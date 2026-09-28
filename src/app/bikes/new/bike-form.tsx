"use client";

import { unstable_rethrow } from "next/navigation";
import { type ReactNode, useState } from "react";
import { createBike, requestImageUploads } from "@/app/bikes/actions";

// Wraps the add-bike form so photos go straight from the browser to R2
// (presigned PUTs) before the rest of the form is submitted with their keys.
export function BikeForm({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(formData: FormData) {
    setError(null);
    try {
      const files = formData
        .getAll("images")
        .filter((f): f is File => f instanceof File && f.size > 0);

      if (files.length > 0) {
        const targets = await requestImageUploads(
          files.map((file) => ({ contentType: file.type, size: file.size })),
        );
        if (targets.mode === "error") throw new Error(targets.message);
        if (targets.mode === "r2") {
          setStatus(`Uploading ${files.length} photo(s)…`);
          await Promise.all(
            targets.uploads.map(async ({ url }, i) => {
              const res = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": files[i].type },
                body: files[i],
              });
              if (!res.ok) throw new Error("A photo failed to upload.");
            }),
          );
          formData.delete("images");
          for (const { key } of targets.uploads) {
            formData.append("imageKeys", key);
          }
        }
      }

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

"use client";

import { useState, useTransition } from "react";
import {
  addBikePhotos,
  removeBikePhoto,
} from "@/app/bikes/[id]/photos/actions";
import { uploadPhotos } from "@/lib/photo-upload";

// Owner-side photo manager on the bike page: add photos any time after
// registering, remove individual ones.
export function BikePhotos({
  bikeId,
  urls,
  max,
}: {
  bikeId: string;
  urls: string[];
  max: number;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [removing, startRemove] = useTransition();
  const busy = status !== null || removing;
  const remaining = max - urls.length;

  async function add(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const picked = Array.from(input.files ?? []).filter((f) => f.size > 0);
    input.value = "";
    if (picked.length === 0) return;

    setError(null);
    try {
      const formData = new FormData();
      await uploadPhotos(picked, formData, { bikeId, onStatus: setStatus });
      setStatus("Saving…");
      const result = await addBikePhotos(bikeId, formData);
      if (result.error) setError(result.error);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setStatus(null);
    }
  }

  function remove(url: string) {
    if (!window.confirm("Remove this photo? This can't be undone.")) return;
    setError(null);
    startRemove(async () => {
      try {
        await removeBikePhoto(bikeId, url);
      } catch {
        setError("Couldn't remove the photo. Please try again.");
      }
    });
  }

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold opacity-70">
          Photos ({urls.length}/{max})
        </h2>
        {remaining > 0 && (
          <label
            className={`rounded border px-3 py-1.5 text-sm ${
              busy
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer hover:bg-black/5"
            }`}
          >
            {status ?? "Add photos"}
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={busy}
              onChange={add}
              className="sr-only"
            />
          </label>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {urls.length > 0 ? (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {urls.map((url) => (
            <div key={url} className="relative">
              {/* biome-ignore lint/performance/noImgElement: user uploads (R2 or local), not optimized via next/image */}
              <img
                src={url}
                alt=""
                className="aspect-square w-full rounded object-cover"
              />
              <button
                type="button"
                onClick={() => remove(url)}
                disabled={busy}
                className="absolute top-1.5 right-1.5 rounded bg-black/70 px-2 py-1 text-xs text-white hover:bg-black disabled:opacity-60"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 rounded border border-dashed border-black/20 p-4 text-sm opacity-70 dark:border-white/20">
          No photos yet. Clear photos of the frame, serial number and any
          distinctive marks help people recognise your bike if it's stolen.
        </p>
      )}
    </section>
  );
}

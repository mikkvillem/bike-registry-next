"use client";

import { deleteBike } from "@/app/bikes/actions";

export function DeleteBikeButton({ bikeId }: { bikeId: string }) {
  return (
    <form
      action={deleteBike.bind(null, bikeId)}
      onSubmit={(e) => {
        if (!confirm("Delete this bike? This can't be undone.")) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="mt-3 rounded bg-red-700 px-3 py-1.5 text-sm text-white"
      >
        Delete bike
      </button>
    </form>
  );
}

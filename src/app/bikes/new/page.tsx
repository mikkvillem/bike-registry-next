import { redirect } from "next/navigation";
import { createBike } from "@/app/bikes/actions";
import {
  bicycleGearSystemEnum,
  bicycleGenderEnum,
  bicycleTypeEnum,
} from "@/db/schema/schema";
import { getSession } from "@/lib/session";

export default async function NewBikePage() {
  const session = await getSession();
  if (!session) redirect("/");

  return (
    <main className="mx-auto max-w-lg p-6">
      <h1 className="text-2xl font-semibold">Add a bike</h1>

      <form action={createBike} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Make
          <input
            type="text"
            name="make"
            required
            placeholder="e.g. Trek"
            className="rounded border border-black/20 p-2 dark:border-white/20"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Model
          <input
            type="text"
            name="model"
            placeholder="e.g. Marlin 7"
            className="rounded border border-black/20 p-2 dark:border-white/20"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Serial number
          <input
            type="text"
            name="serialNumber"
            required
            placeholder="Stamped on the frame, usually under the bottom bracket"
            className="rounded border border-black/20 p-2 dark:border-white/20"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Type
          <select
            name="type"
            className="rounded border border-black/20 p-2 dark:border-white/20"
          >
            <option value="">Select type</option>
            {bicycleTypeEnum.enumValues.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Gender
          <select
            name="gender"
            className="rounded border border-black/20 p-2 dark:border-white/20"
          >
            <option value="">Select gender</option>
            {bicycleGenderEnum.enumValues.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Gear system
          <select
            name="gearSystem"
            className="rounded border border-black/20 p-2 dark:border-white/20"
          >
            <option value="">Select gear system</option>
            {bicycleGearSystemEnum.enumValues.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Number of gears
          <input
            type="number"
            name="numGears"
            min={0}
            className="rounded border border-black/20 p-2 dark:border-white/20"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Wheel size
          <input
            type="text"
            name="wheelSize"
            placeholder={'e.g. 28"'}
            className="rounded border border-black/20 p-2 dark:border-white/20"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Weight (kg)
          <input
            type="number"
            name="weight"
            min={0}
            className="rounded border border-black/20 p-2 dark:border-white/20"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Description
          <textarea
            name="description"
            rows={3}
            className="rounded border border-black/20 p-2 dark:border-white/20"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Photos
          <input
            type="file"
            name="images"
            accept="image/*"
            multiple
            className="rounded border border-black/20 p-2 dark:border-white/20"
          />
        </label>

        <button
          type="submit"
          className="mt-2 rounded bg-foreground px-4 py-2 text-sm text-background"
        >
          Save bike
        </button>
      </form>
    </main>
  );
}

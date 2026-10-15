import { redirect } from "next/navigation";
import { BikeFields } from "@/app/bikes/bike-fields";
import { getSession } from "@/lib/session";
import { BikeForm } from "./bike-form";

export default async function NewBikePage() {
  const session = await getSession();
  if (!session) redirect("/");

  return (
    <main className="mx-auto max-w-lg p-6">
      <h1 className="text-2xl font-semibold">Add a bike</h1>

      <BikeForm>
        <BikeFields />

        <label className="flex flex-col gap-1 text-sm">
          Photos (optional)
          <span className="text-xs opacity-60">
            You can add or change photos later from the bike's page.
          </span>
          <input
            type="file"
            name="images"
            accept="image/*"
            multiple
            className="rounded border border-black/20 p-2 dark:border-white/20"
          />
        </label>
      </BikeForm>
    </main>
  );
}

import { redirect } from "next/navigation";
import { SignInButton } from "@/app/auth-buttons";
import { getSession } from "@/lib/session";

export default async function Home() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <main className="mx-auto flex max-w-lg flex-col items-center gap-4 p-12 text-center">
      <h1 className="text-3xl font-semibold">Bike Registry</h1>
      <p className="opacity-70">
        Keep track of your bikes, their photos, and details in one place.
      </p>
      <SignInButton />
    </main>
  );
}

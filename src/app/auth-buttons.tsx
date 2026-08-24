"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignInButton() {
  return (
    <button
      type="button"
      onClick={() =>
        authClient.signIn.social({
          provider: "google",
          callbackURL: "/dashboard",
        })
      }
      className="rounded bg-foreground px-4 py-2 text-sm text-background"
    >
      Sign in with Google
    </button>
  );
}

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() =>
        authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              router.push("/");
              router.refresh();
            },
          },
        })
      }
      className="text-sm opacity-70 hover:underline"
    >
      Sign out
    </button>
  );
}

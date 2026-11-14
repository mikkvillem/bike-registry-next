"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getDictionary, type Locale } from "@/lib/i18n";

export function SignInButton({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
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
      {t.auth.signIn}
    </button>
  );
}

export function SignOutButton({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
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
      {t.auth.signOut}
    </button>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getDictionary, type Locale } from "@/lib/i18n";

/**
 * `variant`/`label` exist for the landing page, where registering is the
 * secondary action next to the no-account serial check and reads as
 * "Register your bike" rather than "Sign in with Google" (decision 0006).
 */
export function SignInButton({
  locale,
  variant = "primary",
  label,
}: {
  locale: Locale;
  variant?: "primary" | "secondary";
  label?: string;
}) {
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
      className={
        variant === "primary"
          ? "rounded bg-foreground px-4 py-2 text-sm text-background"
          : "text-sm font-medium underline underline-offset-4 hover:no-underline"
      }
    >
      {label ?? t.auth.signIn}
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

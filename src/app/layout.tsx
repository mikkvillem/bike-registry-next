import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { SignOutButton } from "@/app/auth-buttons";
import { LocaleSwitcher } from "@/app/locale-switcher";
import { PRODUCT_NAME } from "@/lib/brand";
import { getT } from "@/lib/locale-server";
import { getSession } from "@/lib/session";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: { default: PRODUCT_NAME, template: `%s — ${PRODUCT_NAME}` },
  description: "Keep track of our bikes",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [session, { locale, t }] = await Promise.all([getSession(), getT()]);

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Wraps to two rows on a phone — brand and controls on the first,
            links on the second — because the Estonian labels ("Kontrolli
            ratast", "Varastatud rattad") are long enough to break mid-phrase
            at 375px and eat the top of every page. One row from `sm`. */}
        <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-black/10 p-4 dark:border-white/10">
          <Link href="/" className="font-semibold whitespace-nowrap">
            {PRODUCT_NAME}
          </Link>

          <nav className="order-last flex w-full flex-wrap items-center gap-x-4 gap-y-2 sm:order-none sm:w-auto">
            <Link
              href="/search"
              className="text-sm whitespace-nowrap hover:underline"
            >
              {t.nav.checkBike}
            </Link>
            <Link
              href="/stolen"
              className="text-sm whitespace-nowrap hover:underline"
            >
              {t.nav.stolenBikes}
            </Link>
            {session && (
              <Link
                href="/dashboard"
                className="text-sm whitespace-nowrap hover:underline"
              >
                {t.nav.dashboard}
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <LocaleSwitcher locale={locale} />
            {session && <SignOutButton locale={locale} />}
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}

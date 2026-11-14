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
        <header className="flex items-center justify-between border-b border-black/10 p-4 dark:border-white/10">
          <Link href="/" className="font-semibold">
            {PRODUCT_NAME}
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/search" className="text-sm hover:underline">
              {t.nav.checkBike}
            </Link>
            <Link href="/stolen" className="text-sm hover:underline">
              {t.nav.stolenBikes}
            </Link>
            <LocaleSwitcher locale={locale} />
            {session && (
              <>
                <Link href="/dashboard" className="text-sm hover:underline">
                  {t.nav.dashboard}
                </Link>
                <SignOutButton locale={locale} />
              </>
            )}
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}

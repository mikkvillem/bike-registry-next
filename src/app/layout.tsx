import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { SignOutButton } from "@/app/auth-buttons";
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
  title: "Bike Registry",
  description: "Keep track of our bikes",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="flex items-center justify-between border-b border-black/10 p-4 dark:border-white/10">
          <Link href="/" className="font-semibold">
            Bike Registry
          </Link>
          {session && (
            <nav className="flex items-center gap-4">
              <Link href="/dashboard" className="text-sm hover:underline">
                Dashboard
              </Link>
              <SignOutButton />
            </nav>
          )}
        </header>
        {children}
      </body>
    </html>
  );
}

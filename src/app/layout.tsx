import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SessionProvider } from "@/components/providers/session-provider";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ORBIT — Opportunities Around You | RVCE",
  description:
    "A centralized platform for RV College of Engineering students to discover, save, and track hackathons, CTFs, coding contests, workshops, and internships.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-screen flex flex-col bg-orbit-ivory text-orbit-brown antialiased selection:bg-orbit-gold-light selection:text-orbit-brown">
        <SessionProvider>
          <Navbar />
          <main className="flex-1 flex flex-col pb-16 md:pb-0">{children}</main>
          <footer className="border-t border-orbit-border bg-orbit-paper/40 py-8 text-center text-xs text-orbit-muted">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-orbit-brown">ORBIT</span>
                <span>— RVCE Campus Opportunities & Hackathons</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-orbit-subtle">
                <Link href="/" className="hover:text-orbit-brown transition-colors">
                  Feed
                </Link>
                <span>•</span>
                <Link href="/calendar" className="hover:text-orbit-brown transition-colors">
                  Calendar
                </Link>
                <span>•</span>
                <Link href="/saved" className="hover:text-orbit-brown transition-colors">
                  Saved
                </Link>
                <span>•</span>
                <Link href="/club-dashboard" className="hover:text-orbit-brown transition-colors">
                  Club Portal
                </Link>
                <span>•</span>
                <Link href="/admin" className="hover:text-orbit-brown transition-colors">
                  Admin Console
                </Link>
              </div>
            </div>
          </footer>
          <MobileNav />
        </SessionProvider>
      </body>
    </html>
  );
}

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
          <footer className="border-t border-[#1D3A5C] bg-[#0D2238] text-white/80 py-12 text-xs">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
              {/* Top Row: Brand, Nav, Socials */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <Link href="/" className="flex items-center gap-2.5 group">
                  <svg
                    className="h-5 w-5 text-orbit-gold transition-transform group-hover:rotate-12"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z" />
                  </svg>
                  <span className="font-serif text-2xl font-bold tracking-tight text-white">
                    ORBIT
                  </span>
                </Link>

                <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-white/70">
                  <Link href="/" className="hover:text-white transition-colors">
                    Feed
                  </Link>
                  <Link href="/calendar" className="hover:text-white transition-colors">
                    Calendar
                  </Link>
                  <Link href="/saved" className="hover:text-white transition-colors">
                    Saved
                  </Link>
                  <Link href="/#clubs" className="hover:text-white transition-colors">
                    Clubs
                  </Link>
                  <Link href="/#about" className="hover:text-white transition-colors">
                    About
                  </Link>
                  <Link href="/club-dashboard" className="hover:text-white transition-colors text-orbit-gold">
                    Club Portal
                  </Link>
                  <Link href="/admin" className="hover:text-white transition-colors text-red-400">
                    Admin
                  </Link>
                </div>

                <div className="flex items-center gap-3 text-white/60">
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 hover:border-white/50 hover:text-white transition-colors"
                    title="GitHub"
                  >
                    <span className="font-bold text-xs">GH</span>
                  </a>
                  <a
                    href="https://rvce.edu.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 hover:border-white/50 hover:text-white transition-colors"
                    title="RVCE Portal"
                  >
                    <span className="font-bold text-xs">RV</span>
                  </a>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[#1D3A5C]/60" />

              {/* Bottom Row */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-white/50">
                <p>RV College of Engineering • Mysuru Road, RV Vidyaniketan, Bengaluru, Karnataka 560059</p>
                <p>© {new Date().getFullYear()} ORBIT Campus Platform. All rights reserved.</p>
              </div>
            </div>
          </footer>
          <MobileNav />
        </SessionProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { SessionProvider } from "@/components/providers/session-provider";

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
          <main className="flex-1 flex flex-col">{children}</main>
          <footer className="border-t border-orbit-border bg-orbit-paper/40 py-8 text-center text-xs text-orbit-muted">
            <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-serif font-semibold text-orbit-brown">ORBIT</span>
                <span>— Designed for RVCE Students & Clubs</span>
              </div>
              <p className="text-[11px] text-orbit-muted">
                Built with precision. Classic beige editorial aesthetic.
              </p>
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}

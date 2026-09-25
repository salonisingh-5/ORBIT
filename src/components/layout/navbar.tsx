import Link from "next/link";
import { Sparkles, Calendar, Bookmark, Compass } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-orbit-border bg-orbit-ivory/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-orbit-border bg-orbit-paper text-orbit-gold shadow-sm transition-transform duration-300 group-hover:scale-105">
              <Sparkles className="h-5 w-5 text-orbit-gold" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold tracking-tight text-orbit-brown">
                ORBIT
              </span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-orbit-muted">
                RVCE Campus Hub
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-orbit-subtle transition-colors hover:bg-orbit-paper hover:text-orbit-brown"
            >
              <Compass className="h-4 w-4 text-orbit-muted" />
              Opportunities
            </Link>
            <Link
              href="/calendar"
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-orbit-subtle transition-colors hover:bg-orbit-paper hover:text-orbit-brown"
            >
              <Calendar className="h-4 w-4 text-orbit-muted" />
              Calendar
            </Link>
            <Link
              href="/saved"
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-orbit-subtle transition-colors hover:bg-orbit-paper hover:text-orbit-brown"
            >
              <Bookmark className="h-4 w-4 text-orbit-muted" />
              Saved
            </Link>
          </nav>
        </div>

        {/* Right CTA / Auth Slot */}
        <div id="navbar-auth-slot" className="flex items-center gap-3">
          <div className="hidden sm:flex items-center rounded-full border border-orbit-border bg-orbit-paper/60 px-3 py-1 text-xs text-orbit-muted">
            <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-600"></span>
            @rvce.edu.in
          </div>
        </div>
      </div>
    </header>
  );
}

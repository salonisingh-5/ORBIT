"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu } from "@/components/auth/user-menu";
import { NotificationBell } from "@/components/notifications/notification-bell";

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { label: "Feed", href: "/" },
    { label: "Calendar", href: "/calendar" },
    { label: "Saved", href: "/saved" },
    { label: "Clubs", href: "/#clubs" },
    { label: "About", href: "/#about" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-orbit-border bg-orbit-ivory/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center">
          <Link href="/" className="group flex items-center gap-2.5">
            <svg
              className="h-6 w-6 text-orbit-gold transition-transform duration-300 group-hover:rotate-12"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z" />
            </svg>
            <span className="font-serif text-2xl font-bold tracking-tight text-orbit-navy">
              ORBIT
            </span>
          </Link>
        </div>

        {/* Centered Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : link.href.startsWith("/#")
                ? false
                : pathname?.startsWith(link.href);

            return (
              <Link
                key={link.label}
                href={link.href}
                className={`relative py-1 text-xs sm:text-sm font-medium transition-colors ${
                  isActive
                    ? "text-orbit-navy font-semibold"
                    : "text-orbit-subtle hover:text-orbit-navy"
                }`}
              >
                <span>{link.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orbit-navy rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA / Auth Slot */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center rounded-full border border-orbit-border bg-orbit-card px-3 py-1 text-xs text-orbit-muted">
            <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-600"></span>
            @rvce.edu.in
          </div>
          <NotificationBell />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

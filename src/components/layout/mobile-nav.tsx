"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Calendar, Bookmark } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Feed",
      href: "/",
      icon: Compass,
      isActive: pathname === "/",
    },
    {
      label: "Calendar",
      href: "/calendar",
      icon: Calendar,
      isActive: pathname.startsWith("/calendar"),
    },
    {
      label: "Saved",
      href: "/saved",
      icon: Bookmark,
      isActive: pathname.startsWith("/saved"),
    },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-orbit-border bg-orbit-ivory/95 backdrop-blur-md md:hidden"
    >
      <div className="mx-auto flex h-14 max-w-md items-center justify-around px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1 transition-colors ${
                item.isActive
                  ? "text-orbit-brown font-semibold"
                  : "text-orbit-muted hover:text-orbit-brown"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${
                  item.isActive ? "text-orbit-gold-dark" : "text-orbit-muted"
                }`}
              />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

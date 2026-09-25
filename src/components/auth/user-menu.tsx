"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  LogIn,
  LogOut,
  Bookmark,
  Building2,
  ShieldAlert,
  ChevronDown,
  User,
  GraduationCap,
} from "lucide-react";
import { SignInModal } from "@/components/auth/sign-in-modal";

export function UserMenu() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading") {
    return (
      <div className="h-8 w-20 animate-pulse rounded-lg bg-orbit-paper border border-orbit-border" />
    );
  }

  if (!session || !session.user) {
    return (
      <>
        <button
          onClick={() => setIsSignInOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-orbit-border-strong bg-orbit-card px-3.5 py-1.5 text-xs font-semibold text-orbit-brown shadow-sm transition-all hover:bg-orbit-paper hover:shadow"
        >
          <LogIn className="h-3.5 w-3.5 text-orbit-gold" />
          <span>Sign In</span>
        </button>

        <SignInModal isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
      </>
    );
  }

  const role = session.user.role || "STUDENT";
  const userInitials =
    session.user.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "RV";

  const roleBadge = () => {
    switch (role) {
      case "ADMIN":
        return { label: "Main Admin", bg: "bg-red-50 text-red-800 border-red-200" };
      case "CLUB_OWNER":
        return { label: "Club Owner", bg: "bg-amber-50 text-amber-800 border-amber-200" };
      default:
        return { label: "Student", bg: "bg-orbit-paper text-orbit-brown border-orbit-border" };
    }
  };

  const badge = roleBadge();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl border border-orbit-border bg-orbit-card p-1.5 pr-2.5 transition hover:bg-orbit-paper"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orbit-gold-light text-xs font-bold text-orbit-gold-dark border border-orbit-gold/30">
          {userInitials}
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-semibold text-orbit-brown line-clamp-1 max-w-[120px]">
            {session.user.name || "Student"}
          </span>
          <span className="text-[10px] text-orbit-muted">{session.user.email}</span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-orbit-muted" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl border border-orbit-border bg-orbit-card p-2 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in slide-in-from-top-1">
          {/* User info & role badge header */}
          <div className="border-b border-orbit-border px-3 py-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orbit-brown line-clamp-1">
                {session.user.name}
              </span>
              <span
                className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold tracking-wide ${badge.bg}`}
              >
                {badge.label}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-orbit-muted truncate font-mono">
              {session.user.email}
            </p>
          </div>

          {/* Links */}
          <div className="py-1 text-xs">
            <Link
              href="/saved"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-orbit-subtle hover:bg-orbit-paper hover:text-orbit-brown"
            >
              <Bookmark className="h-4 w-4 text-orbit-gold" />
              <span>Saved Opportunities</span>
            </Link>

            {(role === "CLUB_OWNER" || role === "ADMIN") && (
              <Link
                href="/club-dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-orbit-subtle hover:bg-orbit-paper hover:text-orbit-brown"
              >
                <Building2 className="h-4 w-4 text-amber-600" />
                <span>Club Owner Portal</span>
              </Link>
            )}

            {role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-orbit-subtle hover:bg-orbit-paper hover:text-orbit-brown"
              >
                <ShieldAlert className="h-4 w-4 text-red-600" />
                <span>Admin Moderation Console</span>
              </Link>
            )}
          </div>

          {/* Sign Out */}
          <div className="border-t border-orbit-border pt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50/60"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

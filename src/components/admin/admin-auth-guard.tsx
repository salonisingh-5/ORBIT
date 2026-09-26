"use client";

import { useState } from "react";
import { LogIn, ShieldAlert, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { SignInModal } from "@/components/auth/sign-in-modal";

interface AdminAuthGuardProps {
  reason: "unauthenticated" | "forbidden";
  userEmail?: string | null;
  userRole?: string;
}

export function AdminAuthGuard({ reason, userEmail, userRole }: AdminAuthGuardProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (reason === "forbidden") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-700 shadow-sm mb-6">
          <ShieldAlert className="h-8 w-8 text-red-600" />
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50/80 px-3 py-1 text-xs font-semibold text-red-800 mb-4">
          <span>HTTP 403 — Main Admin Access Required</span>
        </div>

        <h1 className="font-serif text-3xl font-bold tracking-tight text-orbit-brown">
          Campus Administrator Console Restricted
        </h1>

        <p className="mx-auto mt-3 max-w-lg text-sm text-orbit-subtle leading-relaxed">
          Your authenticated institutional account (<span className="font-mono text-orbit-brown font-semibold">{userEmail}</span>) holds the <span className="font-semibold text-orbit-brown">{userRole || "STUDENT"}</span> role. Opportunity moderation, club directory provisioning, and user role assignments require verified Administrator privileges.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-xl bg-orbit-brown px-5 py-2.5 text-xs font-semibold text-orbit-ivory shadow-sm transition hover:bg-black"
          >
            Explore Opportunities Feed
          </Link>
          <Link
            href="/calendar"
            className="rounded-xl border border-orbit-border bg-orbit-paper px-5 py-2.5 text-xs font-semibold text-orbit-brown transition hover:bg-orbit-paper-dark"
          >
            View Campus Calendar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-orbit-border bg-orbit-paper text-orbit-gold shadow-sm mb-6">
        <ShieldCheck className="h-8 w-8 text-orbit-gold" />
      </div>

      <h1 className="font-serif text-3xl font-bold tracking-tight text-orbit-brown">
        Administrator Console
      </h1>

      <p className="mx-auto mt-3 max-w-lg text-sm text-orbit-subtle leading-relaxed">
        Sign in with your verified RVCE campus administrator account to access club management, opportunity moderation queues, and user provisioning.
      </p>

      <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-orbit-border bg-orbit-paper/60 px-3.5 py-1 text-xs text-orbit-muted">
        <ShieldCheck className="h-4 w-4 text-emerald-600" />
        <span>Strictly restricted to verified @rvce.edu.in admin accounts</span>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-orbit-brown px-6 py-3 text-xs font-bold text-orbit-ivory shadow-sm transition hover:bg-black hover:shadow-md"
        >
          <LogIn className="h-4 w-4 text-orbit-gold" />
          <span>Sign In with Admin Account</span>
        </button>
      </div>

      <SignInModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}

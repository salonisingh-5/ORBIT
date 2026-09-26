"use client";

import { useState } from "react";
import { LogIn, Bookmark, ShieldCheck } from "lucide-react";
import { SignInModal } from "@/components/auth/sign-in-modal";

export function SavedAuthCta() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-10 rounded-2xl border border-orbit-border bg-orbit-card p-10 sm:p-14 text-center shadow-sm max-w-2xl mx-auto">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-orbit-border bg-orbit-paper text-orbit-gold shadow-sm mb-5">
        <Bookmark className="h-7 w-7 text-orbit-gold" />
      </div>

      <h2 className="font-serif text-2xl font-bold tracking-tight text-orbit-brown">
        Sign in to view your saved opportunities
      </h2>

      <p className="mx-auto mt-3 max-w-md text-xs sm:text-sm text-orbit-subtle leading-relaxed">
        Save hackathons, coding contests, and internships across RVCE. Receive automated deadline alerts and access registration links in one place.
      </p>

      <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-orbit-border bg-orbit-paper/60 px-3.5 py-1 text-xs text-orbit-muted">
        <ShieldCheck className="h-4 w-4 text-emerald-600" />
        <span>Strictly restricted to @rvce.edu.in institutional accounts</span>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-orbit-brown px-6 py-3 text-xs font-bold text-orbit-ivory shadow-sm transition hover:bg-black hover:shadow-md"
        >
          <LogIn className="h-4 w-4 text-orbit-gold" />
          <span>Sign In with RVCE Account</span>
        </button>
      </div>

      <SignInModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}

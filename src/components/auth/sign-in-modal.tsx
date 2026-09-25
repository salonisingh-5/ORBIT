"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { X, Sparkles, ShieldCheck, GraduationCap, Building2, UserCog, LogIn } from "lucide-react";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = () => {
    setLoadingRole("google");
    signIn("google", { callbackUrl: "/" });
  };

  const handleDevSignIn = async (email: string, role: string) => {
    setLoadingRole(role);
    try {
      await signIn("dev-login", {
        email,
        role,
        callbackUrl: "/",
      });
      onClose();
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-orbit-brown/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-orbit-border bg-orbit-ivory p-6 sm:p-8 shadow-2xl transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-orbit-muted hover:bg-orbit-paper hover:text-orbit-brown"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl border border-orbit-gold/40 bg-orbit-gold-light text-orbit-gold-dark shadow-sm">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-serif text-2xl font-bold tracking-tight text-orbit-brown">
            Enter ORBIT
          </h2>
          <p className="mt-1.5 text-xs text-orbit-subtle leading-relaxed">
            Centralized opportunities, deadlines, and tracking for RVCE students and club organizers.
          </p>
        </div>

        {/* Institutional Domain Banner */}
        <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-orbit-border bg-orbit-paper/70 p-3.5 text-left">
          <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-700" />
          <div className="text-xs">
            <p className="font-semibold text-orbit-brown">Institutional Domain Lock</p>
            <p className="text-orbit-subtle mt-0.5 leading-normal">
              Authentication is strictly limited to verified <span className="font-mono font-medium text-orbit-brown">@rvce.edu.in</span> Google Workspace accounts.
            </p>
          </div>
        </div>

        {/* Primary Google Login Button */}
        <div className="mt-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={loadingRole !== null}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-orbit-border-strong bg-orbit-card px-4 py-3 text-sm font-medium text-orbit-brown shadow-sm transition-all hover:bg-orbit-paper hover:shadow focus:outline-none focus:ring-2 focus:ring-orbit-gold/30 disabled:opacity-60"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{loadingRole === "google" ? "Connecting..." : "Sign in with RVCE Google Account"}</span>
          </button>
        </div>

        {/* Development Quick-Login Role Switcher */}
        <div className="mt-6 border-t border-orbit-border pt-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-orbit-muted">
              Quick Dev Roles (Local Testing)
            </span>
            <span className="rounded bg-orbit-gold-light/60 px-1.5 py-0.5 text-[10px] font-medium text-orbit-gold-dark">
              Dev Mode
            </span>
          </div>

          <div className="mt-2.5 grid grid-cols-3 gap-2">
            <button
              onClick={() => handleDevSignIn("student.demo@rvce.edu.in", "STUDENT")}
              disabled={loadingRole !== null}
              className="flex flex-col items-center gap-1 rounded-lg border border-orbit-border bg-orbit-card p-2 text-center text-xs font-medium text-orbit-subtle transition hover:border-orbit-gold hover:bg-orbit-paper hover:text-orbit-brown disabled:opacity-50"
            >
              <GraduationCap className="h-4 w-4 text-orbit-gold" />
              <span>Student</span>
            </button>

            <button
              onClick={() => handleDevSignIn("club.lead@rvce.edu.in", "CLUB_OWNER")}
              disabled={loadingRole !== null}
              className="flex flex-col items-center gap-1 rounded-lg border border-orbit-border bg-orbit-card p-2 text-center text-xs font-medium text-orbit-subtle transition hover:border-orbit-gold hover:bg-orbit-paper hover:text-orbit-brown disabled:opacity-50"
            >
              <Building2 className="h-4 w-4 text-orbit-gold" />
              <span>Club Owner</span>
            </button>

            <button
              onClick={() => handleDevSignIn("admin.lead@rvce.edu.in", "ADMIN")}
              disabled={loadingRole !== null}
              className="flex flex-col items-center gap-1 rounded-lg border border-orbit-border bg-orbit-card p-2 text-center text-xs font-medium text-orbit-subtle transition hover:border-orbit-gold hover:bg-orbit-paper hover:text-orbit-brown disabled:opacity-50"
            >
              <UserCog className="h-4 w-4 text-orbit-gold" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

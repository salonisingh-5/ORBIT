import { Bookmark, Sparkles } from "lucide-react";

export default function SavedPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="border-b border-orbit-border pb-6">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-orbit-gold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Personal Collection</span>
        </div>
        <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-orbit-brown">
          Saved Opportunities
        </h1>
        <p className="mt-2 text-sm text-orbit-subtle">
          Your bookmarked hackathons, workshops, and contests with active deadline alerts.
        </p>
      </div>

      <div className="mt-12 rounded-2xl border border-dashed border-orbit-border bg-orbit-paper/30 p-16 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orbit-paper text-orbit-gold mb-4 border border-orbit-border">
          <Bookmark className="h-6 w-6" />
        </div>
        <h3 className="font-serif text-lg font-semibold text-orbit-brown">
          Saved Opportunities List (Scheduled for Phase 2)
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-orbit-subtle">
          Sign in with your @rvce.edu.in account to bookmark events and receive automated deadline notifications.
        </p>
      </div>
    </div>
  );
}

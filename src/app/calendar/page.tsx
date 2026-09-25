import { Calendar as CalendarIcon, Sparkles } from "lucide-react";

export default function CalendarPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="border-b border-orbit-border pb-6">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-orbit-gold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Timeline View</span>
        </div>
        <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-orbit-brown">
          Campus Opportunity Calendar
        </h1>
        <p className="mt-2 text-sm text-orbit-subtle">
          Visualize registration deadlines, submission windows, and event dates across all RVCE clubs.
        </p>
      </div>

      <div className="mt-12 rounded-2xl border border-dashed border-orbit-border bg-orbit-paper/30 p-16 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orbit-paper text-orbit-gold mb-4 border border-orbit-border">
          <CalendarIcon className="h-6 w-6" />
        </div>
        <h3 className="font-serif text-lg font-semibold text-orbit-brown">
          Interactive Calendar (Scheduled for Phase 3)
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-orbit-subtle">
          This central calendar view with All vs. Saved opportunity deadline filtering will activate in Phase 3.
        </p>
      </div>
    </div>
  );
}

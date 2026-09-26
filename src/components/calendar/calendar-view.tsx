"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  LayoutGrid,
  List,
  Sparkles,
  Bookmark,
  Clock,
} from "lucide-react";
import { SerializedOpportunity } from "@/components/opportunities/opportunity-card";
import { CalendarMonthGrid } from "@/components/calendar/calendar-month-grid";
import { CalendarAgendaList } from "@/components/calendar/calendar-agenda-list";
import { CalendarDateInspector } from "@/components/calendar/calendar-date-inspector";
import { SavedAuthCta } from "@/components/auth/saved-auth-cta";
import { SignInModal } from "@/components/auth/sign-in-modal";
import { getCalendarDays, formatDateKey } from "@/lib/calendar";

interface CalendarViewProps {
  initialOpportunities: SerializedOpportunity[];
  bookmarkedOpportunityIds?: string[];
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function CalendarView({
  initialOpportunities,
  bookmarkedOpportunityIds = [],
}: CalendarViewProps) {
  const { data: session } = useSession();

  // Find a default date based on opportunities (e.g. October 2026 or current date)
  const initialDate = useMemo(() => {
    // If opportunities exist, default to the month of the first upcoming opportunity
    if (initialOpportunities.length > 0) {
      const first = new Date(initialOpportunities[0].deadline);
      return first;
    }
    return new Date();
  }, [initialOpportunities]);

  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth()); // 0-indexed
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<"ALL" | "SAVED">("ALL");
  const [viewMode, setViewMode] = useState<"MONTH" | "AGENDA">("MONTH");
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDateKey(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDateKey(null);
  };

  const handleGoToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDateKey(formatDateKey(today));
  };

  const handleFilterClick = (mode: "ALL" | "SAVED") => {
    if (mode === "SAVED" && !session?.user) {
      setIsSignInOpen(true);
      return;
    }
    setFilterMode(mode);
    setSelectedDateKey(null);
  };

  // Filter opportunities based on "ALL" vs "SAVED"
  const visibleOpportunities = useMemo(() => {
    if (filterMode === "SAVED") {
      return initialOpportunities.filter((opp) =>
        bookmarkedOpportunityIds.includes(opp.id)
      );
    }
    return initialOpportunities;
  }, [initialOpportunities, filterMode, bookmarkedOpportunityIds]);

  // Compute calendar days for current month
  const calendarDays = useMemo(() => {
    return getCalendarDays(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  // Calculate statistics for this active month
  const monthStats = useMemo(() => {
    let deadlinesThisMonth = 0;
    let eventsThisMonth = 0;

    for (const opp of visibleOpportunities) {
      const d = new Date(opp.deadline);
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        deadlinesThisMonth++;
      }
      if (opp.startDate) {
        const s = new Date(opp.startDate);
        if (s.getFullYear() === currentYear && s.getMonth() === currentMonth) {
          eventsThisMonth++;
        }
      }
    }

    return { deadlinesThisMonth, eventsThisMonth };
  }, [visibleOpportunities, currentYear, currentMonth]);

  return (
    <div className="w-full space-y-8">
      {/* Top Toolbar: Filter Toggle & View Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* All vs Saved Segmented Filter */}
        <div className="inline-flex rounded-xl border border-orbit-border bg-orbit-card p-1 shadow-xs">
          <button
            type="button"
            onClick={() => handleFilterClick("ALL")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
              filterMode === "ALL"
                ? "bg-orbit-paper border border-orbit-gold text-orbit-brown shadow-xs"
                : "text-orbit-subtle hover:text-orbit-brown"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-orbit-gold-dark" />
            <span>All Opportunities</span>
            <span className="rounded-full bg-orbit-paper px-2 py-0.5 text-[10px] font-bold text-orbit-brown border border-orbit-border">
              {initialOpportunities.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleFilterClick("SAVED")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
              filterMode === "SAVED"
                ? "bg-orbit-paper border border-orbit-gold text-orbit-brown shadow-xs"
                : "text-orbit-subtle hover:text-orbit-brown"
            }`}
          >
            <Bookmark className="h-3.5 w-3.5 text-orbit-gold" />
            <span>My Saved Only</span>
            <span className="rounded-full bg-orbit-paper px-2 py-0.5 text-[10px] font-bold text-orbit-brown border border-orbit-border">
              {bookmarkedOpportunityIds.length}
            </span>
          </button>
        </div>

        {/* Month Navigation & View Mode Toggles */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          {/* Month / Year Navigator */}
          <div className="flex items-center rounded-xl border border-orbit-border bg-orbit-card p-1 shadow-xs">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="rounded-lg p-1.5 text-orbit-muted hover:bg-orbit-paper hover:text-orbit-brown transition"
              title="Previous month"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="px-3 text-xs sm:text-sm font-serif font-bold text-orbit-brown min-w-[130px] text-center">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="rounded-lg p-1.5 text-orbit-muted hover:bg-orbit-paper hover:text-orbit-brown transition"
              title="Next month"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleGoToday}
            className="rounded-xl border border-orbit-border bg-orbit-card px-3 py-2 text-xs font-semibold text-orbit-brown hover:bg-orbit-paper transition shadow-xs"
          >
            Today
          </button>

          {/* Grid vs Agenda Mode Switch */}
          <div className="inline-flex rounded-xl border border-orbit-border bg-orbit-card p-1 shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode("MONTH")}
              className={`rounded-lg p-1.5 transition ${
                viewMode === "MONTH"
                  ? "bg-orbit-paper text-orbit-brown shadow-xs"
                  : "text-orbit-muted hover:text-orbit-brown"
              }`}
              title="Month Grid View"
              aria-label="Month Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setViewMode("AGENDA")}
              className={`rounded-lg p-1.5 transition ${
                viewMode === "AGENDA"
                  ? "bg-orbit-paper text-orbit-brown shadow-xs"
                  : "text-orbit-muted hover:text-orbit-brown"
              }`}
              title="Timeline Agenda View"
              aria-label="Timeline Agenda View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Month Statistics Banner */}
      <div className="flex items-center justify-between rounded-xl border border-orbit-border bg-orbit-paper/40 px-4 py-2.5 text-xs text-orbit-subtle">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span>
              <strong className="font-semibold text-orbit-brown">
                {monthStats.deadlinesThisMonth}
              </strong>{" "}
              {monthStats.deadlinesThisMonth === 1 ? "deadline" : "deadlines"} in{" "}
              {MONTH_NAMES[currentMonth]}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-orbit-gold" />
            <span>
              <strong className="font-semibold text-orbit-brown">
                {monthStats.eventsThisMonth}
              </strong>{" "}
              events
            </span>
          </div>
        </div>

        <span className="text-[11px] text-orbit-muted hidden sm:inline">
          Click any date to inspect full schedule
        </span>
      </div>

      {/* Main View Area */}
      {filterMode === "SAVED" && !session?.user ? (
        <SavedAuthCta />
      ) : filterMode === "SAVED" && bookmarkedOpportunityIds.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-orbit-border bg-orbit-paper/40 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-orbit-border bg-orbit-card text-orbit-gold shadow-sm mb-4">
            <Bookmark className="h-6 w-6 text-orbit-gold" />
          </div>
          <h3 className="font-serif text-lg font-bold text-orbit-brown">
            No Saved Opportunities
          </h3>
          <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-orbit-subtle leading-relaxed">
            You haven't bookmarked any opportunities yet. Bookmark hackathons, contests, and workshops from the feed to track their deadlines here.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setFilterMode("ALL")}
              className="rounded-lg bg-orbit-brown px-4 py-2 text-xs font-semibold text-orbit-ivory hover:bg-black transition"
            >
              View All Opportunities Calendar
            </button>
          </div>
        </div>
      ) : viewMode === "MONTH" ? (
        <div className="space-y-6">
          <CalendarMonthGrid
            days={calendarDays}
            selectedDateKey={selectedDateKey}
            onSelectDate={setSelectedDateKey}
            opportunities={visibleOpportunities}
          />

          {selectedDateKey && (
            <CalendarDateInspector
              dateKey={selectedDateKey}
              opportunities={visibleOpportunities}
              bookmarkedOpportunityIds={bookmarkedOpportunityIds}
              onClose={() => setSelectedDateKey(null)}
            />
          )}
        </div>
      ) : (
        <CalendarAgendaList
          opportunities={visibleOpportunities}
          bookmarkedOpportunityIds={bookmarkedOpportunityIds}
        />
      )}

      {/* Sign In Modal prompt */}
      <SignInModal isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
    </div>
  );
}

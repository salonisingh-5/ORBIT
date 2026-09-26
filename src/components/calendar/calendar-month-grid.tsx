"use client";

import { useMemo } from "react";
import {
  CalendarDay,
  formatDateKey,
  getOpportunitiesForDate,
} from "@/lib/calendar";
import { SerializedOpportunity } from "@/components/opportunities/opportunity-card";
import { Clock, Calendar as CalendarIcon, Sparkles } from "lucide-react";

interface CalendarMonthGridProps {
  days: CalendarDay[];
  selectedDateKey: string | null;
  onSelectDate: (dateKey: string) => void;
  opportunities: SerializedOpportunity[];
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarMonthGrid({
  days,
  selectedDateKey,
  onSelectDate,
  opportunities,
}: CalendarMonthGridProps) {
  // Pre-index opportunities by date for fast lookup in grid cells
  const daySchedules = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getOpportunitiesForDate>>();
    for (const day of days) {
      map.set(day.dateKey, getOpportunitiesForDate(day.dateKey, opportunities));
    }
    return map;
  }, [days, opportunities]);

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-orbit-border bg-orbit-card shadow-sm">
      {/* Weekday Header */}
      <div className="grid grid-cols-7 border-b border-orbit-border bg-orbit-paper/60 text-center text-[11px] font-bold uppercase tracking-wider text-orbit-muted py-3">
        {WEEKDAYS.map((day, idx) => (
          <div key={day} className={idx === 0 || idx === 6 ? "text-orbit-muted/70" : ""}>
            {day}
          </div>
        ))}
      </div>

      {/* Grid of Days */}
      <div className="grid grid-cols-7 auto-rows-[minmax(90px,1fr)] sm:auto-rows-[minmax(115px,1fr)] divide-x divide-y divide-orbit-border/70 border-b border-orbit-border/70">
        {days.map((day) => {
          const schedule = daySchedules.get(day.dateKey);
          const deadlines = schedule?.deadlines || [];
          const events = schedule?.events || [];
          const hasDeadlines = deadlines.length > 0;
          const hasEvents = events.length > 0;
          const isSelected = selectedDateKey === day.dateKey;

          return (
            <button
              key={day.dateKey}
              type="button"
              onClick={() => onSelectDate(day.dateKey)}
              className={`group relative flex flex-col p-1.5 sm:p-2.5 text-left transition-all duration-150 focus:outline-none ${
                day.isCurrentMonth
                  ? "bg-orbit-card hover:bg-orbit-paper/40"
                  : "bg-orbit-paper/30 text-orbit-muted/60 hover:bg-orbit-paper/60"
              } ${
                isSelected
                  ? "ring-2 ring-inset ring-orbit-gold bg-orbit-gold-light/20 z-10"
                  : ""
              }`}
            >
              {/* Day Number Header */}
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                    day.isToday
                      ? "bg-orbit-brown text-orbit-ivory font-bold shadow-sm"
                      : isSelected
                      ? "text-orbit-gold-dark font-bold"
                      : day.isCurrentMonth
                      ? "text-orbit-brown group-hover:text-black"
                      : "text-orbit-muted/50"
                  }`}
                >
                  {day.dayNumber}
                </span>

                {/* Badges count if multiple */}
                {(deadlines.length + events.length > 0) && (
                  <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-medium text-orbit-muted">
                    {deadlines.length > 0 && (
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" title={`${deadlines.length} deadline(s)`} />
                    )}
                    {events.length > 0 && (
                      <span className="h-1.5 w-1.5 rounded-full bg-orbit-gold" title={`${events.length} active event(s)`} />
                    )}
                  </span>
                )}
              </div>

              {/* Event indicators in Cell */}
              <div className="mt-1 flex-1 flex flex-col gap-1 overflow-hidden">
                {/* 1. Deadlines (High priority) */}
                {deadlines.slice(0, 2).map((opp) => (
                  <div
                    key={`d-${opp.id}`}
                    className="truncate rounded px-1.5 py-0.5 text-[10px] font-medium border border-red-200 bg-red-50 text-red-800 transition"
                    title={`Registration Deadline: ${opp.title}`}
                  >
                    <span className="font-semibold text-red-900">Due: </span>
                    {opp.title}
                  </div>
                ))}

                {/* 2. Events Running */}
                {deadlines.length < 2 &&
                  events.slice(0, 2 - deadlines.length).map((opp) => (
                    <div
                      key={`e-${opp.id}`}
                      className="truncate rounded px-1.5 py-0.5 text-[10px] font-medium border border-orbit-border bg-orbit-paper text-orbit-brown transition"
                      title={`Event Active: ${opp.title}`}
                    >
                      <span className="font-semibold text-orbit-gold-dark">Event: </span>
                      {opp.title}
                    </div>
                  ))}

                {/* Overflow indicator */}
                {deadlines.length + events.length > 2 && (
                  <span className="text-[9px] font-bold text-orbit-muted pl-1">
                    +{deadlines.length + events.length - 2} more
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

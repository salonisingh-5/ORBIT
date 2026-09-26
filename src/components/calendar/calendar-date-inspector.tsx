"use client";

import Link from "next/link";
import {
  X,
  Clock,
  Calendar as CalendarIcon,
  MapPin,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { SerializedOpportunity } from "@/components/opportunities/opportunity-card";
import { BookmarkButton } from "@/components/opportunities/bookmark-button";
import { formatDeadlineCountdown, formatEventDate, formatEventTime } from "@/lib/date-utils";
import { getOpportunitiesForDate } from "@/lib/calendar";

interface CalendarDateInspectorProps {
  dateKey: string;
  opportunities: SerializedOpportunity[];
  bookmarkedOpportunityIds?: string[];
  onClose: () => void;
}

export function CalendarDateInspector({
  dateKey,
  opportunities,
  bookmarkedOpportunityIds = [],
  onClose,
}: CalendarDateInspectorProps) {
  const schedule = getOpportunitiesForDate(dateKey, opportunities);

  return (
    <div className="rounded-2xl border border-orbit-gold/50 bg-orbit-paper/60 p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-orbit-border/80 pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-orbit-gold-dark">
            Schedule for Selected Date
          </span>
          <h3 className="font-serif text-xl font-bold text-orbit-brown mt-0.5">
            {formatEventDate(schedule.date)}
          </h3>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-orbit-muted hover:bg-orbit-paper hover:text-orbit-brown transition"
          title="Close date details"
          aria-label="Close date details"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      {schedule.totalCount === 0 ? (
        <div className="py-6 text-center text-xs text-orbit-muted">
          No registration deadlines or active events on this date.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Deadlines Section */}
          {schedule.deadlines.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-900 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-red-700" />
                <span>Registration Deadlines ({schedule.deadlines.length})</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schedule.deadlines.map((opp) => {
                  const countdown = formatDeadlineCountdown(opp.deadline);
                  const isBookmarked = bookmarkedOpportunityIds.includes(opp.id);

                  return (
                    <div
                      key={`insp-d-${opp.id}`}
                      className="rounded-xl border border-red-200/90 bg-orbit-card p-4 shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-red-700 block">
                            Due at {formatEventTime(opp.deadline)}
                          </span>
                          <Link
                            href={`/opportunities/${opp.slug}`}
                            className="font-serif text-base font-bold text-orbit-brown hover:text-orbit-gold-dark transition"
                          >
                            {opp.title}
                          </Link>
                          <p className="text-xs text-orbit-muted mt-0.5">
                            {opp.club?.name || "RVCE Club"}
                          </p>
                        </div>

                        <BookmarkButton
                          opportunityId={opp.id}
                          initialBookmarked={isBookmarked}
                        />
                      </div>

                      <div className="flex items-center justify-between border-t border-orbit-border/60 pt-2 text-xs">
                        {opp.location ? (
                          <div className="flex items-center gap-1 text-[11px] text-orbit-muted">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate max-w-[130px]">{opp.location}</span>
                          </div>
                        ) : (
                          <div />
                        )}

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/opportunities/${opp.slug}`}
                            className="font-semibold text-orbit-brown hover:underline text-xs"
                          >
                            Details
                          </Link>
                          <a
                            href={opp.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-orbit-brown px-2.5 py-1 text-xs font-semibold text-orbit-ivory hover:bg-black transition"
                          >
                            <span>Apply</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Events Section */}
          {schedule.events.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-orbit-brown flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5 text-orbit-gold" />
                <span>Active Event Sessions ({schedule.events.length})</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schedule.events.map((opp) => {
                  const isBookmarked = bookmarkedOpportunityIds.includes(opp.id);

                  return (
                    <div
                      key={`insp-e-${opp.id}`}
                      className="rounded-xl border border-orbit-border bg-orbit-card p-4 shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-orbit-gold-dark block">
                            {opp.category}
                          </span>
                          <Link
                            href={`/opportunities/${opp.slug}`}
                            className="font-serif text-base font-bold text-orbit-brown hover:text-orbit-gold-dark transition"
                          >
                            {opp.title}
                          </Link>
                          <p className="text-xs text-orbit-muted mt-0.5">
                            {opp.club?.name || "RVCE Club"}
                          </p>
                        </div>

                        <BookmarkButton
                          opportunityId={opp.id}
                          initialBookmarked={isBookmarked}
                        />
                      </div>

                      <div className="flex items-center justify-between border-t border-orbit-border/60 pt-2 text-xs">
                        {opp.location ? (
                          <div className="flex items-center gap-1 text-[11px] text-orbit-muted">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate max-w-[130px]">{opp.location}</span>
                          </div>
                        ) : (
                          <div />
                        )}

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/opportunities/${opp.slug}`}
                            className="font-semibold text-orbit-brown hover:underline text-xs"
                          >
                            Details
                          </Link>
                          <a
                            href={opp.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-orbit-paper border border-orbit-border px-2.5 py-1 text-xs font-semibold text-orbit-brown hover:bg-orbit-paper/80 transition"
                          >
                            <span>Portal</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

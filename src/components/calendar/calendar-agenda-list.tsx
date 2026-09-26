"use client";

import Link from "next/link";
import {
  Clock,
  Calendar as CalendarIcon,
  MapPin,
  ExternalLink,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { SerializedOpportunity } from "@/components/opportunities/opportunity-card";
import { BookmarkButton } from "@/components/opportunities/bookmark-button";
import { formatDeadlineCountdown, formatEventDate, formatEventTime } from "@/lib/date-utils";
import { getAgendaItems } from "@/lib/calendar";

interface CalendarAgendaListProps {
  opportunities: SerializedOpportunity[];
  bookmarkedOpportunityIds?: string[];
}

export function CalendarAgendaList({
  opportunities,
  bookmarkedOpportunityIds = [],
}: CalendarAgendaListProps) {
  const agendaItems = getAgendaItems(opportunities);

  if (agendaItems.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-orbit-border bg-orbit-paper/40 p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-orbit-border bg-orbit-card text-orbit-gold shadow-sm mb-4">
          <CalendarIcon className="h-6 w-6 text-orbit-gold" />
        </div>
        <h3 className="font-serif text-lg font-bold text-orbit-brown">
          No Scheduled Deadlines Found
        </h3>
        <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-orbit-subtle leading-relaxed">
          No registration deadlines or active event dates match your current calendar filter.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {agendaItems.map((group) => {
        const isPastDate = group.date.getTime() < new Date().setHours(0, 0, 0, 0);

        return (
          <div key={group.dateKey} className="space-y-3">
            {/* Date Group Heading */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-orbit-paper px-3 py-1 text-xs font-bold text-orbit-brown border border-orbit-border shadow-xs">
                <CalendarIcon className="h-3.5 w-3.5 text-orbit-gold-dark" />
                <span>{formatEventDate(group.date)}</span>
              </div>
              <div className="h-px flex-1 bg-orbit-border/80" />
            </div>

            {/* List of cards on this date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Deadlines first */}
              {group.deadlines.map((opp) => {
                const countdown = formatDeadlineCountdown(opp.deadline);
                const isBookmarked = bookmarkedOpportunityIds.includes(opp.id);

                return (
                  <div
                    key={`d-${opp.id}`}
                    className="flex flex-col justify-between rounded-xl border border-orbit-border bg-orbit-card p-5 shadow-xs transition hover:border-orbit-gold/60 hover:shadow-sm"
                  >
                    <div>
                      {/* Top status */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[10px] font-bold tracking-tight text-red-900">
                          <Clock className="h-3 w-3 text-red-700" />
                          <span>Registration Deadline</span>
                        </span>

                        <BookmarkButton
                          opportunityId={opp.id}
                          initialBookmarked={isBookmarked}
                        />
                      </div>

                      {/* Title */}
                      <h4 className="mt-3 font-serif text-base font-bold text-orbit-brown hover:text-orbit-gold-dark transition">
                        <Link href={`/opportunities/${opp.slug}`}>
                          {opp.title}
                        </Link>
                      </h4>

                      <div className="mt-1 flex items-center gap-2 text-xs text-orbit-muted">
                        <span>{opp.club?.name || "RVCE Club"}</span>
                        <span>•</span>
                        <span className="font-semibold text-red-700">{countdown.label}</span>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-4 flex items-center justify-between border-t border-orbit-border/60 pt-3 text-xs">
                      {opp.location ? (
                        <div className="flex items-center gap-1 text-[11px] text-orbit-muted">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate max-w-[140px]">{opp.location}</span>
                        </div>
                      ) : (
                        <div />
                      )}

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/opportunities/${opp.slug}`}
                          className="font-medium text-orbit-brown hover:underline text-xs"
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

              {/* Events active second */}
              {group.events.map((opp) => {
                const isBookmarked = bookmarkedOpportunityIds.includes(opp.id);

                return (
                  <div
                    key={`e-${opp.id}`}
                    className="flex flex-col justify-between rounded-xl border border-orbit-border bg-orbit-card p-5 shadow-xs transition hover:border-orbit-gold/60 hover:shadow-sm"
                  >
                    <div>
                      {/* Top status */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full border border-orbit-border bg-orbit-paper px-2.5 py-0.5 text-[10px] font-bold tracking-tight text-orbit-brown">
                          <CalendarIcon className="h-3 w-3 text-orbit-gold" />
                          <span>Event Active</span>
                        </span>

                        <BookmarkButton
                          opportunityId={opp.id}
                          initialBookmarked={isBookmarked}
                        />
                      </div>

                      {/* Title */}
                      <h4 className="mt-3 font-serif text-base font-bold text-orbit-brown hover:text-orbit-gold-dark transition">
                        <Link href={`/opportunities/${opp.slug}`}>
                          {opp.title}
                        </Link>
                      </h4>

                      <div className="mt-1 flex items-center gap-2 text-xs text-orbit-muted">
                        <span>{opp.club?.name || "RVCE Club"}</span>
                        {opp.startDate && (
                          <>
                            <span>•</span>
                            <span>Starts {formatEventTime(opp.startDate)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-4 flex items-center justify-between border-t border-orbit-border/60 pt-3 text-xs">
                      {opp.location ? (
                        <div className="flex items-center gap-1 text-[11px] text-orbit-muted">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate max-w-[140px]">{opp.location}</span>
                        </div>
                      ) : (
                        <div />
                      )}

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/opportunities/${opp.slug}`}
                          className="font-medium text-orbit-brown hover:underline text-xs"
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
        );
      })}
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  Sparkles,
  ExternalLink,
  MapPin,
  Clock,
  Trash2,
  Calendar,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { SerializedOpportunity } from "@/components/opportunities/opportunity-card";
import { formatDeadlineCountdown, formatEventDate } from "@/lib/date-utils";

interface SavedFeedProps {
  initialOpportunities: SerializedOpportunity[];
}

export function SavedFeed({ initialOpportunities }: SavedFeedProps) {
  const [items, setItems] = useState<SerializedOpportunity[]>(initialOpportunities);
  const [isRemovingId, setIsRemovingId] = useState<string | null>(null);

  const handleUnsave = async (opportunityId: string) => {
    // Optimistic removal
    setItems((prev) => prev.filter((opp) => opp.id !== opportunityId));
    setIsRemovingId(opportunityId);

    try {
      await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId }),
      });
    } catch (err) {
      console.error("[SavedFeed] Failed to unsave:", err);
    } finally {
      setIsRemovingId(null);
    }
  };

  // Find the soonest upcoming deadline
  const nextDeadline = [...items]
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .find((opp) => new Date(opp.deadline).getTime() > Date.now());

  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-orbit-border bg-orbit-paper/40 p-12 sm:p-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-orbit-border bg-orbit-card text-orbit-gold shadow-sm mb-4">
          <Bookmark className="h-6 w-6 text-orbit-gold" />
        </div>
        <h3 className="font-serif text-xl font-bold text-orbit-brown">
          Your saved list is empty
        </h3>
        <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-orbit-subtle leading-relaxed">
          Bookmark hackathons, CTFs, workshops, and internships from the discovery feed to monitor deadlines and receive timely reminders.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-orbit-brown px-5 py-2.5 text-xs font-semibold text-orbit-ivory shadow-sm transition hover:bg-black"
          >
            <span>Explore Opportunities</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-orbit-border bg-orbit-card p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orbit-gold-light/60 border border-orbit-gold/30 text-orbit-gold-dark font-bold text-sm">
            {items.length}
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-orbit-brown">
              Active Bookmarks
            </h2>
            <p className="text-xs text-orbit-muted">
              Monitoring {items.length} {items.length === 1 ? "opportunity" : "opportunities"}
            </p>
          </div>
        </div>

        {nextDeadline && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-200/80 bg-amber-50/70 px-3.5 py-1.5 text-xs text-amber-900">
            <AlertCircle className="h-3.5 w-3.5 text-amber-700 flex-shrink-0" />
            <span>
              Next deadline: <strong className="font-semibold">{nextDeadline.title}</strong> (
              {formatDeadlineCountdown(nextDeadline.deadline).label})
            </span>
          </div>
        )}
      </div>

      {/* Saved Opportunities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((opp) => {
          const countdown = formatDeadlineCountdown(opp.deadline);
          const clubName = opp.club?.name || "RVCE Campus Club";
          const clubInitials = clubName
            .split(" ")
            .map((w) => w[0])
            .filter(Boolean)
            .slice(0, 2)
            .join("")
            .toUpperCase();

          return (
            <article
              key={opp.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-orbit-border bg-orbit-card p-6 shadow-sm transition-all duration-300 hover:border-orbit-gold/60 hover:shadow-md"
            >
              <div>
                {/* Header: Club + Category + Unsave button */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-orbit-border bg-orbit-paper text-[10px] font-bold text-orbit-brown">
                      {clubInitials}
                    </div>
                    <span className="truncate text-xs font-medium text-orbit-subtle">
                      {clubName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full border border-orbit-border bg-orbit-paper px-2 py-0.5 text-[10px] font-medium text-orbit-brown uppercase tracking-wider">
                      {opp.category}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleUnsave(opp.id)}
                      disabled={isRemovingId === opp.id}
                      className="rounded-lg p-1.5 text-orbit-muted hover:bg-red-50 hover:text-red-600 transition"
                      title="Remove from saved list"
                      aria-label="Remove from saved list"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div className="mt-4">
                  <Link
                    href={`/opportunities/${opp.slug}`}
                    className="group/link block"
                  >
                    <h3 className="font-serif text-lg font-bold tracking-tight text-orbit-brown transition-colors group-hover/link:text-orbit-gold-dark">
                      {opp.title}
                    </h3>
                  </Link>
                </div>

                {/* Short Description */}
                <p className="mt-2 text-xs text-orbit-subtle line-clamp-2 leading-relaxed">
                  {opp.description}
                </p>
              </div>

              {/* Footer */}
              <div className="mt-6 border-t border-orbit-border/80 pt-4 space-y-3">
                {/* Key Deadline */}
                <div className="flex items-center justify-between text-xs">
                  <div
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${
                      countdown.isUrgent
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : countdown.isPassed
                        ? "bg-zinc-100 text-zinc-500 border border-zinc-200"
                        : "bg-orbit-paper text-orbit-brown border border-orbit-border"
                    }`}
                  >
                    <Clock className="h-3 w-3" />
                    <span>{countdown.label}</span>
                  </div>

                  {opp.location && (
                    <div className="flex items-center gap-1 text-[11px] text-orbit-muted">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate max-w-[120px]">{opp.location}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <Link
                    href={`/opportunities/${opp.slug}`}
                    className="text-xs font-semibold text-orbit-brown hover:underline"
                  >
                    View Details
                  </Link>

                  <a
                    href={opp.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg bg-orbit-brown px-3 py-1.5 text-xs font-medium text-orbit-ivory transition hover:bg-black"
                  >
                    <span>Apply Now</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

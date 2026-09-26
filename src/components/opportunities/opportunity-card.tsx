"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ExternalLink,
  MapPin,
  Clock,
  Bookmark,
  Calendar,
  Sparkles,
  Trophy,
  Terminal,
  Code,
  BookOpen,
  Briefcase,
  Award,
} from "lucide-react";
import { formatDeadlineCountdown } from "@/lib/date-utils";
import { BookmarkButton } from "@/components/opportunities/bookmark-button";

export interface SerializedOpportunity {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  officialUrl: string;
  deadline: string;
  startDate: string | null;
  endDate: string | null;
  location: string | null;
  status: string;
  clubId: string | null;
  createdAt: string;
  club: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface OpportunityCardProps {
  opportunity: SerializedOpportunity;
  isBookmarked?: boolean;
  onToggleBookmark?: (id: string) => void;
}

const CATEGORY_STYLES: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; badge: string }
> = {
  HACKATHON: {
    label: "Hackathon",
    icon: Trophy,
    badge: "border-amber-200/80 bg-amber-50/80 text-amber-900",
  },
  CTF: {
    label: "CTF & Security",
    icon: Terminal,
    badge: "border-emerald-200/80 bg-emerald-50/80 text-emerald-900",
  },
  CODING_CONTEST: {
    label: "Coding Contest",
    icon: Code,
    badge: "border-purple-200/80 bg-purple-50/80 text-purple-900",
  },
  WORKSHOP: {
    label: "Workshop",
    icon: BookOpen,
    badge: "border-sky-200/80 bg-sky-50/80 text-sky-900",
  },
  INTERNSHIP: {
    label: "Internship",
    icon: Briefcase,
    badge: "border-rose-200/80 bg-rose-50/80 text-rose-900",
  },
  COMPETITION: {
    label: "Competition",
    icon: Award,
    badge: "border-orange-200/80 bg-orange-50/80 text-orange-900",
  },
  OTHER: {
    label: "Opportunity",
    icon: Sparkles,
    badge: "border-orbit-border bg-orbit-paper text-orbit-brown",
  },
};

export function OpportunityCard({
  opportunity,
  isBookmarked = false,
  onToggleBookmark,
}: OpportunityCardProps) {
  const countdown = formatDeadlineCountdown(opportunity.deadline);
  const categoryMeta = CATEGORY_STYLES[opportunity.category] || CATEGORY_STYLES.OTHER;
  const CategoryIcon = categoryMeta.icon;

  const clubName = opportunity.club?.name || "RVCE Campus Club";
  const clubInitials = clubName
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <article className="group relative flex flex-col justify-between rounded-2xl border border-orbit-border bg-orbit-card p-6 shadow-sm transition-all duration-300 hover:border-orbit-gold/60 hover:shadow-md">
      <div>
        {/* Top Header: Club Pill + Category Badge + Bookmark */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-orbit-border bg-orbit-paper text-[10px] font-bold text-orbit-brown">
              {clubInitials}
            </div>
            <span className="truncate text-xs font-medium text-orbit-subtle" title={clubName}>
              {clubName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-tight ${categoryMeta.badge}`}
            >
              <CategoryIcon className="h-3 w-3" />
              <span>{categoryMeta.label}</span>
            </span>

            {/* Bookmark button */}
            <BookmarkButton
              opportunityId={opportunity.id}
              initialBookmarked={isBookmarked}
              onToggle={() => onToggleBookmark?.(opportunity.id)}
            />
          </div>
        </div>

        {/* Opportunity Title */}
        <div className="mt-4">
          <Link
            href={`/opportunities/${opportunity.slug}`}
            className="group/link block"
          >
            <h3 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-orbit-brown transition-colors group-hover/link:text-orbit-gold-dark">
              {opportunity.title}
            </h3>
          </Link>
        </div>

        {/* Short Description */}
        <p className="mt-2.5 text-xs sm:text-sm text-orbit-subtle line-clamp-2 leading-relaxed">
          {opportunity.description}
        </p>
      </div>

      {/* Footer: Metadata & Actions */}
      <div className="mt-6 border-t border-orbit-border/80 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Location & Deadline countdown */}
          <div className="flex flex-wrap items-center gap-3">
            {opportunity.location && (
              <div className="flex items-center gap-1 text-orbit-muted" title={opportunity.location}>
                <MapPin className="h-3.5 w-3.5 text-orbit-muted" />
                <span className="truncate max-w-[150px]">{opportunity.location}</span>
              </div>
            )}

            <div
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-medium ${
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
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            <Link
              href={`/opportunities/${opportunity.slug}`}
              className="inline-flex items-center rounded-lg border border-orbit-border bg-orbit-paper/60 px-3 py-1.5 text-xs font-medium text-orbit-brown transition-colors hover:bg-orbit-paper hover:border-orbit-border-strong"
            >
              Details
            </Link>

            <a
              href={opportunity.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg bg-orbit-brown px-3 py-1.5 text-xs font-medium text-orbit-ivory transition-colors hover:bg-black"
            >
              <span>Apply</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

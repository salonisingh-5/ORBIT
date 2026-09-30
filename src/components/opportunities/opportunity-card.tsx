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

  const cardDate = (() => {
    const raw = opportunity.startDate || opportunity.deadline;
    const d = new Date(raw);
    if (isNaN(d.getTime())) return { day: "15", month: "MAR" };
    return {
      day: d.getDate().toString().padStart(2, "0"),
      month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    };
  })();

  // Editorial pattern / banner theme based on category
  const bannerGradients: Record<string, string> = {
    HACKATHON: "from-[#F2EDE4] via-[#E8DFD1] to-[#D9CCBA]",
    CTF: "from-[#E6EEF4] via-[#D5E3EE] to-[#BFD3E4]",
    CODING_CONTEST: "from-[#F1EDF5] via-[#E4DCEB] to-[#D4C6DF]",
    WORKSHOP: "from-[#E8F1F5] via-[#D7E6ED] to-[#C3D9E4]",
    INTERNSHIP: "from-[#F6ECEB] via-[#EED8D6] to-[#DFC1BE]",
    COMPETITION: "from-[#F5EFE6] via-[#ECDFD0] to-[#DECBB5]",
    OTHER: "from-[#F4EFEA] via-[#E9E2D8] to-[#DDD4C7]",
  };

  const bannerBg = bannerGradients[opportunity.category] || bannerGradients.OTHER;

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-orbit-border bg-orbit-card shadow-sm transition-all duration-300 hover:border-orbit-gold/60 hover:shadow-lg">
      {/* Top Banner Area with Category & Date Box */}
      <div className={`relative h-32 w-full bg-gradient-to-br ${bannerBg} p-3.5 flex items-start justify-between border-b border-orbit-border/60 overflow-hidden`}>
        {/* Subtle decorative architectural/orbital lines in background */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <svg className="h-full w-full" viewBox="0 0 200 100" preserveAspectRatio="none" fill="none" stroke="currentColor">
            <ellipse cx="100" cy="50" rx="80" ry="35" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="100" cy="50" r="25" strokeWidth="1" />
            <path d="M0 100 Q 100 20 200 100" strokeWidth="1" />
          </svg>
        </div>

        {/* Floating Category Pill */}
        <span
          className={`relative z-10 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-tight shadow-sm backdrop-blur-md ${categoryMeta.badge}`}
        >
          <CategoryIcon className="h-3 w-3" />
          <span>{categoryMeta.label}</span>
        </span>

        {/* Floating Date Badge Box */}
        <div className="relative z-10 flex flex-col items-center justify-center rounded-xl border border-orbit-border/80 bg-white/95 px-2.5 py-1 text-center shadow-sm backdrop-blur-sm">
          <span className="font-serif text-base font-bold text-orbit-navy leading-none">
            {cardDate.day}
          </span>
          <span className="text-[9px] font-bold tracking-wider text-orbit-muted uppercase mt-0.5 leading-none">
            {cardDate.month}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          {/* Organizer / Club Pill */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-orbit-muted line-clamp-1">
              {clubName}
            </span>
          </div>

          {/* Title */}
          <Link href={`/opportunities/${opportunity.slug}`} className="group/title block">
            <h3 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-orbit-navy transition-colors group-hover/title:text-orbit-gold">
              {opportunity.title}
            </h3>
          </Link>

          {/* Description */}
          <p className="mt-2 text-xs sm:text-sm text-orbit-subtle line-clamp-2 leading-relaxed">
            {opportunity.description}
          </p>
        </div>

        {/* Meta Row & Footer */}
        <div className="mt-5 space-y-3.5 pt-3.5 border-t border-orbit-border/60">
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-orbit-muted">
            {opportunity.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3 text-orbit-muted" />
                <span className="truncate max-w-[140px]">{opportunity.location}</span>
              </span>
            )}

            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-medium ${
                countdown.isUrgent
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : countdown.isPassed
                  ? "bg-zinc-100 text-zinc-500 border border-zinc-200"
                  : "bg-orbit-paper text-orbit-subtle border border-orbit-border"
              }`}
            >
              <Clock className="h-3 w-3" />
              <span>{countdown.label}</span>
            </span>
          </div>

          {/* Bottom Action Bar: Bookmark on Left, Apply / Details on Right */}
          <div className="flex items-center justify-between pt-1">
            <BookmarkButton
              opportunityId={opportunity.id}
              initialBookmarked={isBookmarked}
              onToggle={() => onToggleBookmark?.(opportunity.id)}
            />

            <div className="flex items-center gap-2">
              <Link
                href={`/opportunities/${opportunity.slug}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-orbit-navy hover:text-orbit-gold transition-colors"
              >
                <span>Details</span>
                <span className="text-sm">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

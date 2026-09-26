"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Share2,
  Bookmark,
  CheckCircle2,
  Sparkles,
  Building2,
  Globe,
  Trophy,
  Terminal,
  Code,
  BookOpen,
  Briefcase,
  Award,
} from "lucide-react";
import { formatDeadlineCountdown, formatEventDate, formatEventTime } from "@/lib/date-utils";
import { SerializedOpportunity } from "@/components/opportunities/opportunity-card";
import { BookmarkButton } from "@/components/opportunities/bookmark-button";

interface OpportunityDetailProps {
  opportunity: SerializedOpportunity;
  clubDetails?: {
    name: string;
    description: string | null;
    websiteUrl: string | null;
  } | null;
  isBookmarked?: boolean;
}

const CATEGORY_META: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; badge: string }
> = {
  HACKATHON: { label: "Hackathon", icon: Trophy, badge: "border-amber-200 bg-amber-50 text-amber-900" },
  CTF: { label: "CTF & Security", icon: Terminal, badge: "border-emerald-200 bg-emerald-50 text-emerald-900" },
  CODING_CONTEST: { label: "Coding Contest", icon: Code, badge: "border-purple-200 bg-purple-50 text-purple-900" },
  WORKSHOP: { label: "Workshop", icon: BookOpen, badge: "border-sky-200 bg-sky-50 text-sky-900" },
  INTERNSHIP: { label: "Internship", icon: Briefcase, badge: "border-rose-200 bg-rose-50 text-rose-900" },
  COMPETITION: { label: "Competition", icon: Award, badge: "border-orange-200 bg-orange-50 text-orange-900" },
  OTHER: { label: "Opportunity", icon: Sparkles, badge: "border-orbit-border bg-orbit-paper text-orbit-brown" },
};

export function OpportunityDetail({
  opportunity,
  clubDetails,
  isBookmarked = false,
}: OpportunityDetailProps) {
  const [copied, setCopied] = useState(false);

  const countdown = formatDeadlineCountdown(opportunity.deadline);
  const categoryInfo = CATEGORY_META[opportunity.category] || CATEGORY_META.OTHER;
  const CategoryIcon = categoryInfo.icon;

  const clubName = opportunity.club?.name || clubDetails?.name || "RVCE Campus Club";
  const clubInitials = clubName
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <article className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Top Breadcrumb Navigation */}
      <nav className="flex items-center justify-between border-b border-orbit-border pb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-orbit-subtle transition hover:text-orbit-brown"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Opportunities</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Share Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 rounded-lg border border-orbit-border bg-orbit-card px-3 py-1.5 text-xs font-medium text-orbit-subtle transition hover:bg-orbit-paper hover:text-orbit-brown"
            title="Copy shareable link"
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 text-orbit-muted" />
                <span>Share</span>
              </>
            )}
          </button>

          {/* Bookmark Button */}
          <BookmarkButton
            opportunityId={opportunity.id}
            initialBookmarked={isBookmarked}
            showLabel={true}
          />
        </div>
      </nav>

      {/* Main Content Layout */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column (2 cols): Title, Category, Description */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            {/* Category and Deadline Tag */}
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${categoryInfo.badge}`}
              >
                <CategoryIcon className="h-3.5 w-3.5" />
                <span>{categoryInfo.label}</span>
              </span>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                  countdown.isUrgent
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : countdown.isPassed
                    ? "bg-zinc-100 text-zinc-500 border border-zinc-200"
                    : "bg-orbit-paper text-orbit-brown border border-orbit-border"
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>{countdown.label}</span>
              </span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-orbit-brown leading-[1.15]">
              {opportunity.title}
            </h1>

            {/* Club metadata */}
            <div className="mt-4 flex items-center gap-3 text-xs text-orbit-muted">
              <span>Organized by <strong className="text-orbit-brown font-semibold">{clubName}</strong></span>
              <span>•</span>
              <span>Verified RVCE Opportunity</span>
            </div>
          </div>

          {/* Description Section */}
          <div className="rounded-2xl border border-orbit-border bg-orbit-card p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="font-serif text-xl font-bold text-orbit-brown border-b border-orbit-border pb-3">
              About This Opportunity
            </h2>
            <div className="text-sm sm:text-base text-orbit-subtle leading-relaxed whitespace-pre-line">
              {opportunity.description}
            </div>
          </div>

          {/* Organizing Club Card */}
          <div className="rounded-2xl border border-orbit-border bg-orbit-paper/40 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-orbit-border bg-orbit-card text-base font-bold text-orbit-brown shadow-sm">
                {clubInitials}
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-orbit-brown">{clubName}</h3>
                <p className="text-xs text-orbit-muted">Official RV College of Engineering Student Club</p>
              </div>
            </div>

            {clubDetails?.description && (
              <p className="text-xs sm:text-sm text-orbit-subtle leading-relaxed">
                {clubDetails.description}
              </p>
            )}

            {clubDetails?.websiteUrl && (
              <div className="pt-2">
                <a
                  href={clubDetails.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-orbit-gold-dark hover:underline"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>Visit Club Website</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col): Key Dates & Application Card */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-orbit-border bg-orbit-card p-6 shadow-sm sticky top-24 space-y-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-orbit-muted">
                Registration & Schedule
              </span>
              <h3 className="font-serif text-lg font-bold text-orbit-brown mt-1">
                Key Deadlines
              </h3>
            </div>

            {/* Dates List */}
            <div className="space-y-4 border-t border-orbit-border pt-4 text-xs">
              {/* Registration Deadline */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-700 border border-red-100">
                  <Clock className="h-3.5 w-3.5" />
                </div>
                <div>
                  <span className="text-orbit-muted block text-[11px] font-semibold uppercase">
                    Registration Deadline
                  </span>
                  <span className="font-semibold text-orbit-brown block">
                    {formatEventDate(opportunity.deadline)}
                  </span>
                  <span className="text-orbit-muted block text-[11px]">
                    {formatEventTime(opportunity.deadline)}
                  </span>
                </div>
              </div>

              {/* Event Start Date */}
              {opportunity.startDate && (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-orbit-paper text-orbit-brown border border-orbit-border">
                    <Calendar className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="text-orbit-muted block text-[11px] font-semibold uppercase">
                      Event Start
                    </span>
                    <span className="font-semibold text-orbit-brown block">
                      {formatEventDate(opportunity.startDate)}
                    </span>
                    <span className="text-orbit-muted block text-[11px]">
                      {formatEventTime(opportunity.startDate)}
                    </span>
                  </div>
                </div>
              )}

              {/* Event End Date */}
              {opportunity.endDate && (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-orbit-paper text-orbit-brown border border-orbit-border">
                    <Calendar className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="text-orbit-muted block text-[11px] font-semibold uppercase">
                      Event Conclusion
                    </span>
                    <span className="font-semibold text-orbit-brown block">
                      {formatEventDate(opportunity.endDate)}
                    </span>
                    <span className="text-orbit-muted block text-[11px]">
                      {formatEventTime(opportunity.endDate)}
                    </span>
                  </div>
                </div>
              )}

              {/* Venue / Location */}
              {opportunity.location && (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-orbit-paper text-orbit-brown border border-orbit-border">
                    <MapPin className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="text-orbit-muted block text-[11px] font-semibold uppercase">
                      Venue / Location
                    </span>
                    <span className="font-semibold text-orbit-brown block">
                      {opportunity.location}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Official Registration CTA */}
            <div className="border-t border-orbit-border pt-5">
              <a
                href={opportunity.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-orbit-brown px-4 py-3.5 text-center text-xs font-bold text-orbit-ivory shadow-sm transition hover:bg-black hover:shadow-md"
              >
                <span>Apply / Register on Official Portal</span>
                <ExternalLink className="h-4 w-4" />
              </a>

              <p className="mt-2 text-center text-[10px] text-orbit-muted">
                Redirects to the official club registration form or portal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

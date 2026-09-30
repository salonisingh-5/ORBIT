"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Sparkles, XCircle, ArrowRight, Calendar, Bookmark, Building2 } from "lucide-react";
import { OpportunityCard, SerializedOpportunity } from "@/components/opportunities/opportunity-card";
import { CampusArchArt, CampusArchMiniArt } from "@/components/opportunities/editorial-artwork";

interface OpportunityFeedProps {
  initialOpportunities: SerializedOpportunity[];
  categoryCounts?: Record<string, number>;
  bookmarkedOpportunityIds?: string[];
}

const CATEGORY_ITEMS = [
  { key: "ALL", label: "All" },
  { key: "HACKATHON", label: "Hackathons" },
  { key: "CTF", label: "CTFs" },
  { key: "WORKSHOP", label: "Workshops" },
  { key: "COMPETITION", label: "Competitions" },
  { key: "INTERNSHIP", label: "Internships" },
  { key: "CODING_CONTEST", label: "Coding Contests" },
  { key: "OTHER", label: "Club Events" },
];

function formatShortDate(dateString: string | null | undefined) {
  if (!dateString) return { day: "15", month: "MAR" };
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return { day: "15", month: "MAR" };
  return {
    day: d.getDate().toString().padStart(2, "0"),
    month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
  };
}

export function OpportunityFeed({
  initialOpportunities,
  categoryCounts,
  bookmarkedOpportunityIds,
}: OpportunityFeedProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [showAll, setShowAll] = useState(false);

  // Filter and sort opportunities in memory for instant feedback
  const filteredOpportunities = useMemo(() => {
    return initialOpportunities.filter((opp) => {
      // Category match
      if (selectedCategory !== "ALL" && opp.category !== selectedCategory) {
        return false;
      }

      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchTitle = opp.title.toLowerCase().includes(query);
        const matchDesc = opp.description.toLowerCase().includes(query);
        const matchClub = opp.club?.name.toLowerCase().includes(query) ?? false;
        const matchLoc = opp.location?.toLowerCase().includes(query) ?? false;

        if (!matchTitle && !matchDesc && !matchClub && !matchLoc) {
          return false;
        }
      }

      return true;
    });
  }, [initialOpportunities, selectedCategory, searchQuery]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("ALL");
    setShowAll(false);
  };

  const isFiltered = searchQuery.trim() !== "" || selectedCategory !== "ALL";

  // Real upcoming events from database for column 2
  const upcomingEvents = useMemo(() => {
    return initialOpportunities.slice(0, 4);
  }, [initialOpportunities]);

  return (
    <div className="w-full">
      {/* ─── HERO SECTION ─── */}
      <section className="mx-auto max-w-7xl px-4 pt-10 pb-16 sm:px-6 sm:pt-14 sm:pb-20 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Brand, Subtitle, Search, Category Pills */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-widest text-orbit-gold uppercase">
                RVCE STUDENT OPPORTUNITY PLATFORM —
              </span>
            </div>

            {/* ORBIT with Diagonal Gold Ring & Sparkle */}
            <div>
              <div className="relative inline-block">
                <h1 className="font-serif text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-orbit-navy leading-none">
                  ORBIT
                </h1>

                {/* Diagonal Elliptical Orbit Graphic Overlay */}
                <svg
                  className="absolute -inset-x-6 -inset-y-4 h-[135%] w-[125%] pointer-events-none"
                  viewBox="0 0 320 120"
                  fill="none"
                  aria-hidden="true"
                >
                  <ellipse
                    cx="155"
                    cy="60"
                    rx="145"
                    ry="28"
                    stroke="#C5A869"
                    strokeWidth="2.5"
                    transform="rotate(-10 155 60)"
                  />
                  {/* Gold 4-point sparkle star sitting on the orbit path */}
                  <g transform="translate(270, 32)">
                    <path
                      d="M10 0L12 7L19 9L12 11L10 18L8 11L1 9L8 7Z"
                      fill="#C5A869"
                    />
                  </g>
                </svg>
              </div>

              <p className="mt-3 font-serif italic text-2xl sm:text-3xl text-orbit-subtle">
                Opportunities Around You
              </p>
            </div>

            {/* Rounded Pill Search Bar */}
            <div className="pt-2 max-w-xl">
              <div className="relative flex items-center rounded-full border border-orbit-border bg-orbit-card p-1.5 pl-4 shadow-sm transition-all focus-within:border-orbit-gold focus-within:ring-2 focus-within:ring-orbit-gold/20">
                <Search className="h-4 w-4 text-orbit-muted mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search hackathons, workshops, CTFs..."
                  className="w-full bg-transparent text-xs sm:text-sm text-orbit-navy placeholder:text-orbit-muted focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="mr-2 text-orbit-muted hover:text-orbit-navy"
                    title="Clear search query"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  className="rounded-full bg-orbit-navy px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-orbit-navy-light transition-all shrink-0 flex items-center gap-1.5"
                >
                  <span>Search</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* Category Filter Pills directly under Search */}
            <div className="pt-1 flex flex-wrap items-center gap-2">
              {CATEGORY_ITEMS.map((item) => {
                const isSelected = selectedCategory === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setSelectedCategory(item.key)}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-orbit-navy text-white shadow-sm"
                        : "bg-orbit-card border border-orbit-border text-orbit-subtle hover:text-orbit-navy hover:border-orbit-border-strong hover:bg-orbit-paper"
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Campus Arched Architectural Collage */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <CampusArchArt caption="Explore • Learn • Grow" />
          </div>
        </div>
      </section>

      {/* ─── MAIN FEED / FEATURED OPPORTUNITIES ─── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {isFiltered ? (
          /* Filtered Results Header & Grid */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-orbit-border pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-orbit-gold">
                  SEARCH & FILTERS —
                </span>
                <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-orbit-navy">
                  Filtered Opportunities
                </h2>
                <p className="mt-1 text-xs text-orbit-muted">
                  Showing {filteredOpportunities.length} {filteredOpportunities.length === 1 ? "result" : "results"}
                  {selectedCategory !== "ALL" && ` in ${selectedCategory.replace("_", " ")}`}
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetFilters}
                className="self-start sm:self-auto rounded-lg border border-orbit-border bg-orbit-card px-3.5 py-1.5 text-xs font-semibold text-orbit-navy hover:bg-orbit-paper transition-colors"
              >
                Reset Filters
              </button>
            </div>

            {filteredOpportunities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOpportunities.map((opportunity) => (
                  <OpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    isBookmarked={bookmarkedOpportunityIds?.includes(opportunity.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-orbit-border bg-orbit-paper/40 p-12 text-center">
                <Sparkles className="mx-auto h-8 w-8 text-orbit-gold" />
                <h3 className="mt-3 font-serif text-lg font-bold text-orbit-navy">
                  No opportunities match your filter
                </h3>
                <p className="mt-1 text-xs text-orbit-subtle max-w-md mx-auto">
                  Try clearing your search keyword or switching categories to explore more events.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-orbit-navy px-4 py-2 text-xs font-semibold text-white hover:bg-orbit-navy-light transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Default Editorial Feed View: Featured Section */
          <div className="space-y-12">
            <div>
              <div className="flex items-end justify-between mb-8">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-orbit-gold">
                    FEATURED —
                  </span>
                  <h2 className="mt-1 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-orbit-navy">
                    Featured Opportunities
                  </h2>
                </div>

                {initialOpportunities.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setShowAll((prev) => !prev)}
                    className="text-xs sm:text-sm font-semibold text-orbit-navy hover:text-orbit-gold transition-colors inline-flex items-center gap-1"
                  >
                    <span>{showAll ? "Show featured" : `See all (${initialOpportunities.length})`}</span>
                    <span>→</span>
                  </button>
                )}
              </div>

              {/* 3-card grid (or expanded if showAll is true) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(showAll ? filteredOpportunities : filteredOpportunities.slice(0, 3)).map((opportunity) => (
                  <OpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    isBookmarked={bookmarkedOpportunityIds?.includes(opportunity.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ─── BOTTOM 3-COLUMN EDITORIAL SECTION ─── */}
      <section className="mx-auto max-w-7xl px-4 mt-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Column 1: Motivational / Platform Quote Card */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-orbit-border bg-orbit-card p-6 shadow-sm">
            {/* Subtle concentric orbit curves background watermark */}
            <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full border border-orbit-gold/20 pointer-events-none" />
            <div className="absolute -right-4 -top-4 h-28 w-28 rounded-full border border-orbit-gold/25 pointer-events-none" />

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-orbit-gold">
                  MORE THAN JUST EVENTS
                </span>
              </div>

              <h3 className="mt-4 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-orbit-navy leading-tight">
                &ldquo;Your next opportunity is closer than you think.&rdquo;
              </h3>

              <p className="mt-3 text-xs sm:text-sm text-orbit-subtle leading-relaxed">
                Hackathons, CTFs, research workshops, and student club initiatives across RVCE — unified in one elegant campus ecosystem.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-orbit-border/60">
              <Link
                href="/#clubs"
                className="inline-flex items-center gap-1 text-xs font-semibold text-orbit-navy hover:text-orbit-gold transition-colors"
              >
                <span>Explore Student Communities</span>
                <span className="text-sm">→</span>
              </Link>
            </div>
          </div>

          {/* Column 2: Dynamic Upcoming Events List */}
          <div className="flex flex-col justify-between rounded-2xl border border-orbit-border bg-orbit-card p-6 shadow-sm">
            <div>
              <div className="flex items-center justify-between border-b border-orbit-border/60 pb-3 mb-4">
                <h3 className="font-serif text-xl font-bold text-orbit-navy">
                  Upcoming Events
                </h3>
                <Link
                  href="/calendar"
                  className="text-xs font-semibold text-orbit-gold hover:text-orbit-gold-dark transition-colors inline-flex items-center gap-0.5"
                >
                  <span>View Calendar</span>
                  <span>→</span>
                </Link>
              </div>

              {/* 4 real upcoming database opportunity rows */}
              <div className="space-y-3">
                {upcomingEvents.map((opp) => {
                  const dateInfo = formatShortDate(opp.startDate || opp.deadline);
                  return (
                    <Link
                      key={opp.id}
                      href={`/opportunities/${opp.slug}`}
                      className="group flex items-center justify-between gap-3 rounded-xl border border-orbit-border/70 bg-orbit-paper/40 p-2.5 hover:bg-orbit-paper hover:border-orbit-gold/50 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 flex-shrink-0 flex-col items-center justify-center rounded-lg border border-orbit-border/80 bg-white text-center shadow-xs">
                          <span className="font-serif text-xs font-bold text-orbit-navy leading-none">
                            {dateInfo.day}
                          </span>
                          <span className="text-[8px] font-bold tracking-wider text-orbit-muted uppercase mt-0.5 leading-none">
                            {dateInfo.month}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-serif text-xs sm:text-sm font-bold text-orbit-navy truncate group-hover:text-orbit-gold transition-colors">
                            {opp.title}
                          </h4>
                          <p className="text-[10px] text-orbit-muted truncate">
                            {opp.club?.name || opp.category.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-orbit-navy/40 group-hover:text-orbit-navy group-hover:translate-x-0.5 transition-all shrink-0">
                        →
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-orbit-border/60 text-right">
              <Link
                href="/calendar"
                className="text-[11px] font-medium text-orbit-subtle hover:text-orbit-navy transition-colors"
              >
                Sync with your calendar schedule →
              </Link>
            </div>
          </div>

          {/* Column 3: Arched Campus Architectural Illustration Card */}
          <CampusArchMiniArt caption="Same campus. Bigger dreams." />
        </div>
      </section>

      {/* ─── ANCHOR SECTION: CLUBS & ABOUT ─── */}
      <section id="clubs" className="mx-auto max-w-7xl px-4 mt-24 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-orbit-border bg-orbit-paper/30 p-8 sm:p-10">
          <div className="max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-widest text-orbit-gold">
              CAMPUS ORGANIZATIONS —
            </span>
            <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-orbit-navy">
              Empowering RVCE Student Clubs
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-orbit-subtle leading-relaxed">
              From Coding Club RVCE and Team Enactus to IEEE Student Branch and Rotaract, ORBIT provides student leaders with dedicated publishing, analytics, and event moderation tools.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                href="/club-dashboard"
                className="inline-flex items-center gap-1.5 rounded-xl bg-orbit-navy px-4 py-2 text-xs font-semibold text-white hover:bg-orbit-navy-light transition-all"
              >
                <span>Club Owner Portal</span>
                <span>→</span>
              </Link>
              <Link
                href="/calendar"
                className="inline-flex items-center gap-1.5 rounded-xl border border-orbit-border bg-orbit-card px-4 py-2 text-xs font-semibold text-orbit-navy hover:bg-orbit-paper transition-all"
              >
                <span>Explore Calendar</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-7xl px-4 mt-8 pb-10 sm:px-6 lg:px-8">
        <div className="text-center text-xs text-orbit-muted space-y-1">
          <p>ORBIT — The Centralized Student Opportunity Platform for RV College of Engineering</p>
          <p>Created to connect ambitious engineers with real-world hackathons, competitions, and technical communities.</p>
        </div>
      </section>
    </div>
  );
}

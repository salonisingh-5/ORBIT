"use client";

import { useState, useMemo } from "react";
import { Search, Sparkles, SlidersHorizontal, ArrowUpDown, XCircle } from "lucide-react";
import { CategoryFilter } from "@/components/opportunities/category-filter";
import { OpportunityCard, SerializedOpportunity } from "@/components/opportunities/opportunity-card";

interface OpportunityFeedProps {
  initialOpportunities: SerializedOpportunity[];
  categoryCounts?: Record<string, number>;
  bookmarkedOpportunityIds?: string[];
}

export function OpportunityFeed({
  initialOpportunities,
  categoryCounts,
  bookmarkedOpportunityIds,
}: OpportunityFeedProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [sortBy, setSortBy] = useState<"deadline" | "newest">("deadline");

  // Filter and sort opportunities in memory for instant feedback
  const filteredOpportunities = useMemo(() => {
    return initialOpportunities
      .filter((opp) => {
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
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        // Default: deadline soonest first
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
  }, [initialOpportunities, selectedCategory, searchQuery, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("ALL");
    setSortBy("deadline");
  };

  const isFiltered = searchQuery.trim() !== "" || selectedCategory !== "ALL";

  return (
    <div className="w-full space-y-8">
      {/* Search and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-xl">
          <div className="relative flex items-center rounded-xl border border-orbit-border bg-orbit-card p-1.5 shadow-sm transition-all focus-within:border-orbit-gold focus-within:ring-2 focus-within:ring-orbit-gold/20">
            <Search className="ml-3 h-4 w-4 text-orbit-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, club, keyword, or venue..."
              className="w-full bg-transparent px-3 py-1.5 text-xs sm:text-sm text-orbit-brown placeholder:text-orbit-muted focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mr-2 text-orbit-muted hover:text-orbit-brown"
                title="Clear query"
              >
                <XCircle className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
          <span className="text-orbit-muted whitespace-nowrap">
            Showing <strong className="text-orbit-brown">{filteredOpportunities.length}</strong> {filteredOpportunities.length === 1 ? "opportunity" : "opportunities"}
          </span>

          <div className="flex items-center gap-1.5 rounded-xl border border-orbit-border bg-orbit-card px-2.5 py-1.5 shadow-sm">
            <ArrowUpDown className="h-3.5 w-3.5 text-orbit-muted" />
            <label htmlFor="sort-select" className="sr-only">Sort by</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "deadline" | "newest")}
              className="bg-transparent text-xs font-medium text-orbit-brown focus:outline-none cursor-pointer"
            >
              <option value="deadline">Soonest Deadline</option>
              <option value="newest">Recently Posted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div>
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          categoryCounts={categoryCounts}
        />
      </div>

      {/* Opportunities Grid / Empty State */}
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
        <div className="rounded-2xl border border-dashed border-orbit-border bg-orbit-paper/40 p-12 sm:p-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orbit-paper text-orbit-gold mb-4 border border-orbit-border">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-orbit-brown">
            No opportunities match your filter
          </h3>
          <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-orbit-subtle leading-relaxed">
            {isFiltered
              ? "We couldn't find any opportunities matching your active category or search terms. Try clearing your filters."
              : "No published opportunities currently available. Check back soon!"}
          </p>
          {isFiltered && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 rounded-lg border border-orbit-border bg-orbit-card px-4 py-2 text-xs font-semibold text-orbit-brown transition-colors hover:bg-orbit-paper"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

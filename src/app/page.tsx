import { getOpportunities, getOpportunityStats } from "@/lib/opportunities";
import { getCurrentUser } from "@/lib/session";
import { getUserBookmarkedIds } from "@/lib/bookmarks";
import { OpportunityFeed } from "@/components/opportunities/opportunity-feed";
import { SerializedOpportunity } from "@/components/opportunities/opportunity-card";
import { Sparkles } from "lucide-react";

export default async function HomePage() {
  const user = await getCurrentUser();
  const [opportunities, stats, bookmarkedIds] = await Promise.all([
    getOpportunities({ sortBy: "deadline" }),
    getOpportunityStats(),
    user?.id ? getUserBookmarkedIds(user.id) : Promise.resolve([]),
  ]);

  const serializedOpportunities: SerializedOpportunity[] = opportunities.map((opp) => ({
    id: opp.id,
    title: opp.title,
    slug: opp.slug,
    description: opp.description,
    category: opp.category,
    officialUrl: opp.officialUrl,
    deadline: opp.deadline.toISOString(),
    startDate: opp.startDate ? opp.startDate.toISOString() : null,
    endDate: opp.endDate ? opp.endDate.toISOString() : null,
    location: opp.location,
    status: opp.status,
    clubId: opp.clubId,
    createdAt: opp.createdAt.toISOString(),
    club: opp.club,
  }));

  return (
    <div className="flex-1 pb-20">
      {/* Editorial Hero */}
      <section className="border-b border-orbit-border bg-gradient-to-b from-orbit-paper/40 via-orbit-ivory to-orbit-ivory px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-orbit-gold/40 bg-orbit-gold-light/60 px-4 py-1 text-xs font-semibold text-orbit-gold-dark mb-6 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-orbit-gold-dark" />
            <span>RVCE Centralized Opportunity Hub</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-orbit-brown leading-[1.12]">
            Discover what&apos;s happening.
            <br />
            <span className="italic font-normal text-orbit-subtle">Never miss a deadline.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm sm:text-base text-orbit-subtle leading-relaxed">
            Hackathons, CTFs, workshops, coding contests, and internships across RVCE clubs and student communities — unified in one elegant, editorial space.
          </p>
        </div>
      </section>

      {/* Main Feed Container */}
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <OpportunityFeed
          initialOpportunities={serializedOpportunities}
          categoryCounts={stats.byCategory}
          bookmarkedOpportunityIds={bookmarkedIds}
        />
      </section>
    </div>
  );
}

import { getOpportunities, getOpportunityStats } from "@/lib/opportunities";
import { getCurrentUser } from "@/lib/session";
import { getUserBookmarkedIds } from "@/lib/bookmarks";
import { OpportunityFeed } from "@/components/opportunities/opportunity-feed";
import { SerializedOpportunity } from "@/components/opportunities/opportunity-card";

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
    <div className="flex-1 pb-16">
      <OpportunityFeed
        initialOpportunities={serializedOpportunities}
        categoryCounts={stats.byCategory}
        bookmarkedOpportunityIds={bookmarkedIds}
      />
    </div>
  );
}

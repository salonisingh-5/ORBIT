import { getOpportunities } from "@/lib/opportunities";
import { getCurrentUser } from "@/lib/session";
import { getUserBookmarkedIds } from "@/lib/bookmarks";
import { CalendarView } from "@/components/calendar/calendar-view";
import { SerializedOpportunity } from "@/components/opportunities/opportunity-card";
import { Sparkles, Calendar as CalendarIcon } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Campus Opportunity Calendar | ORBIT RVCE",
  description: "Interactive timeline of upcoming hackathon deadlines, contest dates, and workshops across RVCE.",
};

export default async function CalendarPage() {
  const user = await getCurrentUser();
  const [opportunities, bookmarkedIds] = await Promise.all([
    getOpportunities({ sortBy: "deadline" }),
    user?.id ? getUserBookmarkedIds(user.id) : Promise.resolve([]),
  ]);

  const serialized: SerializedOpportunity[] = opportunities.map((opp) => ({
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
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 flex-1 space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-orbit-border pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-orbit-gold-dark mb-2">
          <Sparkles className="h-3.5 w-3.5 text-orbit-gold" />
          <span>Academic & Opportunity Timeline</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-orbit-brown">
          Campus Opportunity Calendar
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-orbit-subtle max-w-2xl leading-relaxed">
          Track upcoming registration deadlines, hackathon countdowns, and club workshops across RVCE. Toggle between all opportunities and your personal saved list.
        </p>
      </div>

      {/* Interactive Calendar Component */}
      <CalendarView
        initialOpportunities={serialized}
        bookmarkedOpportunityIds={bookmarkedIds}
      />
    </div>
  );
}

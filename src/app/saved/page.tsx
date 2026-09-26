import { getCurrentUser } from "@/lib/session";
import { getUserSavedOpportunities } from "@/lib/bookmarks";
import { SavedFeed } from "@/components/opportunities/saved-feed";
import { SavedAuthCta } from "@/components/auth/saved-auth-cta";
import { SerializedOpportunity } from "@/components/opportunities/opportunity-card";
import { Sparkles } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saved Opportunities | ORBIT RVCE",
  description: "Your personal collection of bookmarked hackathons, CTFs, and student opportunities at RVCE.",
};

export default async function SavedPage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 flex-1">
        <div className="border-b border-orbit-border pb-6">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-orbit-gold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Personal Collection</span>
          </div>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-orbit-brown">
            Saved Opportunities
          </h1>
          <p className="mt-2 text-sm text-orbit-subtle">
            Your bookmarked hackathons, workshops, and contests with active deadline alerts.
          </p>
        </div>

        <SavedAuthCta />
      </div>
    );
  }

  const savedOpportunities = await getUserSavedOpportunities(user.id);

  const serialized: SerializedOpportunity[] = savedOpportunities.map((opp) => ({
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
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 flex-1">
      <div className="border-b border-orbit-border pb-6 mb-8">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-orbit-gold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Personal Collection</span>
        </div>
        <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-orbit-brown">
          Saved Opportunities
        </h1>
        <p className="mt-2 text-sm text-orbit-subtle">
          Your bookmarked hackathons, workshops, and contests with active deadline alerts.
        </p>
      </div>

      <SavedFeed initialOpportunities={serialized} />
    </div>
  );
}

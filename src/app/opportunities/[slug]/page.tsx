import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getOpportunityBySlug } from "@/lib/opportunities";
import { SEED_CLUBS } from "@/lib/seed-data";
import { OpportunityDetail } from "@/components/opportunities/opportunity-detail";
import { SerializedOpportunity } from "@/components/opportunities/opportunity-card";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const opp = await getOpportunityBySlug(slug);

  if (!opp) {
    return {
      title: "Opportunity Not Found | ORBIT RVCE",
    };
  }

  return {
    title: `${opp.title} | ORBIT RVCE`,
    description: opp.description.slice(0, 160),
  };
}

export default async function OpportunityDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const opp = await getOpportunityBySlug(slug);

  if (!opp) {
    notFound();
  }

  // Find club metadata if available
  const clubMeta = opp.club?.slug
    ? SEED_CLUBS.find((c) => c.slug === opp.club?.slug)
    : null;

  const serialized: SerializedOpportunity = {
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
  };

  return (
    <OpportunityDetail
      opportunity={serialized}
      clubDetails={
        clubMeta
          ? {
              name: clubMeta.name,
              description: clubMeta.description,
              websiteUrl: clubMeta.websiteUrl,
            }
          : opp.club
          ? {
              name: opp.club.name,
              description: null,
              websiteUrl: null,
            }
          : null
      }
    />
  );
}

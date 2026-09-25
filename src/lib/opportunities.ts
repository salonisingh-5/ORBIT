import type { Category, OpportunityStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SEED_CLUBS, SEED_OPPORTUNITIES, type SeedOpportunity } from "@/lib/seed-data";

const CATEGORIES: Category[] = [
  "HACKATHON",
  "CTF",
  "CODING_CONTEST",
  "WORKSHOP",
  "INTERNSHIP",
  "COMPETITION",
  "OTHER",
];

export type OpportunitySortBy = "deadline" | "newest";

export type OpportunityQuery = {
  search?: string;
  category?: string;
  sortBy?: OpportunitySortBy;
  clubId?: string;
};

export type OpportunityClub = {
  id: string;
  name: string;
  slug: string;
};

export type OpportunityRecord = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: Category;
  officialUrl: string;
  deadline: Date;
  startDate: Date | null;
  endDate: Date | null;
  location: string | null;
  status: OpportunityStatus;
  clubId: string | null;
  createdAt: Date;
  club: OpportunityClub | null;
};

export type OpportunityStats = {
  total: number;
  byCategory: Record<Category, number>;
  upcomingDeadlines: Array<{
    id: string;
    title: string;
    slug: string;
    deadline: Date;
    category: Category;
  }>;
};

function isCategory(value: string | undefined): value is Category {
  return Boolean(value && CATEGORIES.includes(value as Category));
}

function seedToRecord(opportunity: SeedOpportunity): OpportunityRecord {
  const club = SEED_CLUBS.find((item) => item.slug === opportunity.clubSlug);

  return {
    id: opportunity.id,
    title: opportunity.title,
    slug: opportunity.slug,
    description: opportunity.description,
    category: opportunity.category,
    officialUrl: opportunity.officialUrl,
    deadline: new Date(opportunity.deadline),
    startDate: opportunity.startDate ? new Date(opportunity.startDate) : null,
    endDate: opportunity.endDate ? new Date(opportunity.endDate) : null,
    location: opportunity.location,
    status: opportunity.status,
    clubId: club?.slug ?? opportunity.clubSlug,
    createdAt: new Date(opportunity.createdAt),
    club: club
      ? { id: club.slug, name: club.name, slug: club.slug }
      : { id: opportunity.clubSlug, name: opportunity.clubName, slug: opportunity.clubSlug },
  };
}

function matchesQuery(opportunity: OpportunityRecord, params: OpportunityQuery): boolean {
  if (isCategory(params.category) && opportunity.category !== params.category) {
    return false;
  }

  if (params.clubId && opportunity.clubId !== params.clubId && opportunity.club?.slug !== params.clubId) {
    return false;
  }

  const search = params.search?.trim().toLowerCase();
  if (!search) return true;

  const haystack = [opportunity.title, opportunity.description, opportunity.club?.name ?? ""]
    .join(" ")
    .toLowerCase();

  return haystack.includes(search);
}

function sortRecords(records: OpportunityRecord[], sortBy: OpportunitySortBy): OpportunityRecord[] {
  return [...records].sort((a, b) => {
    if (sortBy === "newest") {
      return b.createdAt.getTime() - a.createdAt.getTime();
    }
    return a.deadline.getTime() - b.deadline.getTime();
  });
}

function fromSeed(params: OpportunityQuery = {}): OpportunityRecord[] {
  const sortBy: OpportunitySortBy = params.sortBy === "newest" ? "newest" : "deadline";
  const records = SEED_OPPORTUNITIES.map(seedToRecord).filter((item) => matchesQuery(item, params));
  return sortRecords(records, sortBy);
}

function toRecord(
  opportunity: Prisma.OpportunityGetPayload<{ include: { club: true } }>,
): OpportunityRecord {
  return {
    id: opportunity.id,
    title: opportunity.title,
    slug: opportunity.slug,
    description: opportunity.description,
    category: opportunity.category,
    officialUrl: opportunity.officialUrl,
    deadline: opportunity.deadline,
    startDate: opportunity.startDate,
    endDate: opportunity.endDate,
    location: opportunity.location,
    status: opportunity.status,
    clubId: opportunity.clubId,
    createdAt: opportunity.createdAt,
    club: opportunity.club
      ? { id: opportunity.club.id, name: opportunity.club.name, slug: opportunity.club.slug }
      : null,
  };
}

function buildWhere(params: OpportunityQuery): Prisma.OpportunityWhereInput {
  const where: Prisma.OpportunityWhereInput = {
    status: "APPROVED",
  };

  if (isCategory(params.category)) {
    where.category = params.category;
  }

  if (params.clubId) {
    where.clubId = params.clubId;
  }

  const search = params.search?.trim();
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { club: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  return where;
}

export async function getOpportunities(params: OpportunityQuery = {}): Promise<OpportunityRecord[]> {
  const sortBy: OpportunitySortBy = params.sortBy === "newest" ? "newest" : "deadline";

  try {
    const rows = await prisma.opportunity.findMany({
      where: buildWhere(params),
      include: { club: true },
      orderBy: sortBy === "newest" ? { createdAt: "desc" } : { deadline: "asc" },
    });
    return rows.map(toRecord);
  } catch {
    return fromSeed(params);
  }
}

export async function getOpportunityBySlug(slug: string): Promise<OpportunityRecord | null> {
  try {
    const row = await prisma.opportunity.findUnique({
      where: { slug },
      include: { club: true },
    });
    return row ? toRecord(row) : null;
  } catch {
    const match = SEED_OPPORTUNITIES.find((item) => item.slug === slug);
    return match ? seedToRecord(match) : null;
  }
}

export async function getOpportunityStats(): Promise<OpportunityStats> {
  const byCategory = Object.fromEntries(CATEGORIES.map((category) => [category, 0])) as Record<
    Category,
    number
  >;

  try {
    const grouped = await prisma.opportunity.groupBy({
      by: ["category"],
      where: { status: "APPROVED" },
      _count: { _all: true },
    });

    for (const row of grouped) {
      byCategory[row.category] = row._count._all;
    }

    const upcoming = await prisma.opportunity.findMany({
      where: { status: "APPROVED", deadline: { gte: new Date() } },
      orderBy: { deadline: "asc" },
      take: 5,
      select: { id: true, title: true, slug: true, deadline: true, category: true },
    });

    return {
      total: grouped.reduce((sum, row) => sum + row._count._all, 0),
      byCategory,
      upcomingDeadlines: upcoming,
    };
  } catch {
    const records = fromSeed();
    for (const record of records) {
      byCategory[record.category] += 1;
    }
    const now = Date.now();
    return {
      total: records.length,
      byCategory,
      upcomingDeadlines: records
        .filter((item) => item.deadline.getTime() >= now)
        .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
        .slice(0, 5)
        .map((item) => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          deadline: item.deadline,
          category: item.category,
        })),
    };
  }
}

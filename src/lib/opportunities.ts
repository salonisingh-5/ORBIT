import type { Category, OpportunityStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

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
    where.OR = [
      { clubId: params.clubId },
      { club: { slug: params.clubId } },
    ];
  }

  const search = params.search?.trim();
  if (search) {
    where.AND = [
      ...(where.AND ? (Array.isArray(where.AND) ? where.AND : [where.AND]) : []),
      {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { club: { name: { contains: search, mode: "insensitive" } } },
        ],
      },
    ];
  }

  return where;
}

export async function getOpportunities(params: OpportunityQuery = {}): Promise<OpportunityRecord[]> {
  const sortBy: OpportunitySortBy = params.sortBy === "newest" ? "newest" : "deadline";

  const rows = await prisma.opportunity.findMany({
    where: buildWhere(params),
    include: { club: true },
    orderBy: sortBy === "newest" ? { createdAt: "desc" } : { deadline: "asc" },
  });

  return rows.map(toRecord);
}

export async function getOpportunityBySlug(slug: string): Promise<OpportunityRecord | null> {
  const row = await prisma.opportunity.findUnique({
    where: { slug },
    include: { club: true },
  });

  return row ? toRecord(row) : null;
}

export async function getOpportunityStats(): Promise<OpportunityStats> {
  const byCategory = Object.fromEntries(CATEGORIES.map((category) => [category, 0])) as Record<
    Category,
    number
  >;

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
}

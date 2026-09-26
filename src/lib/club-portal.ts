import { prisma } from "@/lib/prisma";
import { SEED_OPPORTUNITIES, SEED_CLUBS } from "@/lib/seed-data";
import { Category, OpportunityStatus } from "@prisma/client";

export interface ClubOpportunityInput {
  title: string;
  description: string;
  category: Category;
  officialUrl: string;
  deadline: string;
  startDate?: string | null;
  endDate?: string | null;
  location?: string | null;
  status?: OpportunityStatus;
}

export interface ClubOpportunityRecord {
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
  clubName: string;
  clubSlug: string;
  createdAt: Date;
}

// In-memory store for fallback offline dev
let memoryClubOpportunities: ClubOpportunityRecord[] = SEED_OPPORTUNITIES.map((opp) => ({
  id: opp.id,
  title: opp.title,
  slug: opp.slug,
  description: opp.description,
  category: opp.category as Category,
  officialUrl: opp.officialUrl,
  deadline: new Date(opp.deadline),
  startDate: opp.startDate ? new Date(opp.startDate) : null,
  endDate: opp.endDate ? new Date(opp.endDate) : null,
  location: opp.location,
  status: opp.status as OpportunityStatus,
  clubId: opp.clubSlug,
  clubName: opp.clubName,
  clubSlug: opp.clubSlug,
  createdAt: new Date(opp.createdAt),
}));

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Resolves the club slug / id from user's clubId or email
 */
export function resolveUserClub(user: { clubId?: string | null; email?: string | null }): {
  id: string;
  name: string;
  slug: string;
} {
  const identifier = user.clubId || "coding-club-rvce";
  const found = SEED_CLUBS.find(
    (c) => c.slug === identifier || c.name.toLowerCase() === identifier.toLowerCase()
  );

  if (found) {
    return { id: found.slug, name: found.name, slug: found.slug };
  }

  return {
    id: identifier,
    name: "Coding Club RVCE",
    slug: "coding-club-rvce",
  };
}

/**
 * Fetches opportunities belonging strictly to the specified clubId (or all if ADMIN).
 */
export async function getClubOpportunities(
  clubIdentifier: string,
  userRole: string
): Promise<ClubOpportunityRecord[]> {
  try {
    const where =
      userRole === "ADMIN" && !clubIdentifier
        ? {}
        : {
            OR: [
              { clubId: clubIdentifier },
              { club: { slug: clubIdentifier } },
            ],
          };

    const rows = await prisma.opportunity.findMany({
      where,
      include: { club: true },
      orderBy: { deadline: "asc" },
    });

    if (rows.length > 0) {
      return rows.map((r) => ({
        id: r.id,
        title: r.title,
        slug: r.slug,
        description: r.description,
        category: r.category,
        officialUrl: r.officialUrl,
        deadline: r.deadline,
        startDate: r.startDate,
        endDate: r.endDate,
        location: r.location,
        status: r.status,
        clubId: r.clubId,
        clubName: r.club?.name || "RVCE Club",
        clubSlug: r.club?.slug || clubIdentifier,
        createdAt: r.createdAt,
      }));
    }

    // Fallback to memory
    return filterMemoryOpportunities(clubIdentifier, userRole);
  } catch {
    return filterMemoryOpportunities(clubIdentifier, userRole);
  }
}

function filterMemoryOpportunities(
  clubIdentifier: string,
  userRole: string
): ClubOpportunityRecord[] {
  if (userRole === "ADMIN" && !clubIdentifier) {
    return memoryClubOpportunities;
  }
  return memoryClubOpportunities.filter(
    (opp) =>
      opp.clubId === clubIdentifier ||
      opp.clubSlug === clubIdentifier ||
      opp.clubId?.includes(clubIdentifier)
  );
}

/**
 * Creates a new opportunity strictly scoped to the user's club.
 */
export async function createClubOpportunity(
  input: ClubOpportunityInput,
  user: { id: string; role: string; clubId?: string | null; email?: string | null }
): Promise<ClubOpportunityRecord> {
  if (user.role !== "CLUB_OWNER" && user.role !== "ADMIN") {
    throw new Error("FORBIDDEN: Only club owners and admins can create opportunities.");
  }

  const club = resolveUserClub(user);
  let baseSlug = slugify(input.title);
  if (!baseSlug) baseSlug = `opportunity-${Date.now()}`;
  const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;

  const newRecord: ClubOpportunityRecord = {
    id: `opp-${Date.now()}`,
    title: input.title.trim(),
    slug,
    description: input.description.trim(),
    category: input.category,
    officialUrl: input.officialUrl.trim(),
    deadline: new Date(input.deadline),
    startDate: input.startDate ? new Date(input.startDate) : null,
    endDate: input.endDate ? new Date(input.endDate) : null,
    location: input.location?.trim() || "RVCE Campus",
    status: input.status || "APPROVED",
    clubId: club.id,
    clubName: club.name,
    clubSlug: club.slug,
    createdAt: new Date(),
  };

  try {
    const created = await prisma.opportunity.create({
      data: {
        title: newRecord.title,
        slug: newRecord.slug,
        description: newRecord.description,
        category: newRecord.category,
        officialUrl: newRecord.officialUrl,
        deadline: newRecord.deadline,
        startDate: newRecord.startDate,
        endDate: newRecord.endDate,
        location: newRecord.location,
        status: newRecord.status,
        clubId: club.id,
        createdById: user.id,
      },
      include: { club: true },
    });

    return {
      ...newRecord,
      id: created.id,
      clubName: created.club?.name || club.name,
    };
  } catch {
    // Memory fallback
    memoryClubOpportunities.unshift(newRecord);
    return newRecord;
  }
}

/**
 * Updates an opportunity with strict ownership verification.
 */
export async function updateClubOpportunity(
  id: string,
  input: Partial<ClubOpportunityInput>,
  user: { id: string; role: string; clubId?: string | null; email?: string | null }
): Promise<ClubOpportunityRecord> {
  if (user.role !== "CLUB_OWNER" && user.role !== "ADMIN") {
    throw new Error("FORBIDDEN: Only club owners and admins can edit opportunities.");
  }

  const club = resolveUserClub(user);

  // Check in database or memory
  let existingOpp: ClubOpportunityRecord | null = null;
  try {
    const row = await prisma.opportunity.findUnique({
      where: { id },
      include: { club: true },
    });
    if (row) {
      existingOpp = {
        id: row.id,
        title: row.title,
        slug: row.slug,
        description: row.description,
        category: row.category,
        officialUrl: row.officialUrl,
        deadline: row.deadline,
        startDate: row.startDate,
        endDate: row.endDate,
        location: row.location,
        status: row.status,
        clubId: row.clubId,
        clubName: row.club?.name || "",
        clubSlug: row.club?.slug || "",
        createdAt: row.createdAt,
      };
    }
  } catch {
    existingOpp = memoryClubOpportunities.find((o) => o.id === id) || null;
  }

  if (!existingOpp) {
    existingOpp = memoryClubOpportunities.find((o) => o.id === id) || null;
  }

  if (!existingOpp) {
    throw new Error("NOT_FOUND: Opportunity not found.");
  }

  // Strict ownership check: Must be ADMIN or match clubId
  const isOwner =
    user.role === "ADMIN" ||
    existingOpp.clubId === club.id ||
    existingOpp.clubSlug === club.slug;

  if (!isOwner) {
    throw new Error(
      "FORBIDDEN: You do not have permission to modify another club's opportunities."
    );
  }

  const updated: ClubOpportunityRecord = {
    ...existingOpp,
    title: input.title !== undefined ? input.title.trim() : existingOpp.title,
    description: input.description !== undefined ? input.description.trim() : existingOpp.description,
    category: input.category || existingOpp.category,
    officialUrl: input.officialUrl !== undefined ? input.officialUrl.trim() : existingOpp.officialUrl,
    deadline: input.deadline ? new Date(input.deadline) : existingOpp.deadline,
    startDate: input.startDate !== undefined ? (input.startDate ? new Date(input.startDate) : null) : existingOpp.startDate,
    endDate: input.endDate !== undefined ? (input.endDate ? new Date(input.endDate) : null) : existingOpp.endDate,
    location: input.location !== undefined ? input.location : existingOpp.location,
    status: input.status || existingOpp.status,
  };

  try {
    await prisma.opportunity.update({
      where: { id },
      data: {
        title: updated.title,
        description: updated.description,
        category: updated.category,
        officialUrl: updated.officialUrl,
        deadline: updated.deadline,
        startDate: updated.startDate,
        endDate: updated.endDate,
        location: updated.location,
        status: updated.status,
      },
    });
  } catch {
    // Update memory
    const idx = memoryClubOpportunities.findIndex((o) => o.id === id);
    if (idx !== -1) {
      memoryClubOpportunities[idx] = updated;
    }
  }

  return updated;
}

/**
 * Deletes an opportunity with strict ownership verification.
 */
export async function deleteClubOpportunity(
  id: string,
  user: { id: string; role: string; clubId?: string | null; email?: string | null }
): Promise<boolean> {
  if (user.role !== "CLUB_OWNER" && user.role !== "ADMIN") {
    throw new Error("FORBIDDEN: Only club owners and admins can delete opportunities.");
  }

  const club = resolveUserClub(user);

  let existingOpp = memoryClubOpportunities.find((o) => o.id === id);
  try {
    const row = await prisma.opportunity.findUnique({
      where: { id },
      include: { club: true },
    });
    if (row) {
      existingOpp = {
        id: row.id,
        title: row.title,
        slug: row.slug,
        description: row.description,
        category: row.category,
        officialUrl: row.officialUrl,
        deadline: row.deadline,
        startDate: row.startDate,
        endDate: row.endDate,
        location: row.location,
        status: row.status,
        clubId: row.clubId,
        clubName: row.club?.name || "",
        clubSlug: row.club?.slug || "",
        createdAt: row.createdAt,
      };
    }
  } catch {
    // Rely on memory
  }

  if (!existingOpp) {
    throw new Error("NOT_FOUND: Opportunity not found.");
  }

  // Strict ownership check
  const isOwner =
    user.role === "ADMIN" ||
    existingOpp.clubId === club.id ||
    existingOpp.clubSlug === club.slug;

  if (!isOwner) {
    throw new Error(
      "FORBIDDEN: You do not have permission to delete another club's opportunities."
    );
  }

  try {
    await prisma.opportunity.delete({
      where: { id },
    });
  } catch {
    memoryClubOpportunities = memoryClubOpportunities.filter((o) => o.id !== id);
  }

  return true;
}

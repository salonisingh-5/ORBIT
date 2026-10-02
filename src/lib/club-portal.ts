import { prisma } from "@/lib/prisma";
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
export async function resolveUserClub(
  user: { 
    role: string;
    clubId?: string | null; 
    email?: string | null 
  }
) {
  if (user.clubId) {
    const clubById = await prisma.club.findUnique({
      where: {
        id: user.clubId,
      },
    });

    if (clubById) {
      return clubById;
    }

    const clubBySlug = await prisma.club.findUnique({
      where: {
        slug: user.clubId,
      },
    });

    if (clubBySlug) {
      return clubBySlug;
    }
  }
  if (user.role === "CLUB_OWNER") {
    throw new Error(
      "CLUB_NOT_ASSIGNED: Club owner has no valid club assignment."
    );
  }
  const defaultClub = await prisma.club.findUnique({
    where: {
      slug: "coding-club-rvce",
    },
  });

  if (!defaultClub) {
    throw new Error("CLUB_NOT_FOUND: Assigned club does not exist.");
  }

  return defaultClub;
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
  } catch (error) {
    console.error("[Club Portal] Failed to fetch opportunities:", error);
    throw new Error("DATABASE_ERROR: Failed to fetch club opportunities.");
  }
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

  const club = await resolveUserClub(user);
  let baseSlug = slugify(input.title);
  if (!baseSlug) baseSlug = `opportunity-${Date.now()}`;
  const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;

  try {
    const created = await prisma.opportunity.create({
      data: {
        title: input.title.trim(),
        slug,
        description: input.description.trim(),
        category: input.category,
        officialUrl: input.officialUrl.trim(),
        deadline: new Date(input.deadline),
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
        location: input.location?.trim() || "RVCE Campus",
        status:
          user.role === "ADMIN"
            ? input.status || "APPROVED"
            : "SUBMITTED",
        clubId: club.id,
        createdById: user.id,
      },
      include: { club: true },
    });

    return {
      id: created.id,
      title: created.title,
      slug: created.slug,
      description: created.description,
      category: created.category,
      officialUrl: created.officialUrl,
      deadline: created.deadline,
      startDate: created.startDate,
      endDate: created.endDate,
      location: created.location,
      status: created.status,
      clubId: created.clubId,
      clubName: created.club?.name || club.name,
      clubSlug: created.club?.slug || club.slug,
      createdAt: created.createdAt,
    };
  } catch (error) {
    if ((error as { code?: string })?.code === "P2025") {
      throw new Error("NOT_FOUND: Opportunity not found.");
    }
    console.error("[Club Portal] Failed to create opportunity:", error);
    throw new Error("DATABASE_ERROR: Could not save to the database.");
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

  const club = await resolveUserClub(user);

  let existingOpp;
  try {
    existingOpp = await prisma.opportunity.findUnique({
      where: { id },
      include: { club: true },
    });
  } catch (error) {
    console.error("[Club Portal] Failed to find opportunity:", error);
    throw new Error("DATABASE_ERROR: Could not save to the database.");
  }

  if (!existingOpp) {
    throw new Error("NOT_FOUND: Opportunity not found.");
  }

  // Strict ownership check: Must be ADMIN or match clubId
  const isOwner =
    user.role === "ADMIN" ||
    existingOpp.clubId === club.id ||
    existingOpp.club?.slug === club.slug;

  if (!isOwner) {
    throw new Error(
      "FORBIDDEN: You do not have permission to modify another club's opportunities."
    );
  }

  try {
    const updated = await prisma.opportunity.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title.trim() }),
        ...(input.description !== undefined && { description: input.description.trim() }),
        ...(input.category !== undefined && { category: input.category }),
        ...(input.officialUrl !== undefined && { officialUrl: input.officialUrl.trim() }),
        ...(input.deadline !== undefined && { deadline: new Date(input.deadline) }),
        ...(input.startDate !== undefined && {
          startDate: input.startDate ? new Date(input.startDate) : null,
        }),
        ...(input.endDate !== undefined && {
          endDate: input.endDate ? new Date(input.endDate) : null,
        }),
        ...(input.location !== undefined && { location: input.location }),
        ...(input.status !== undefined && user.role === "ADMIN" && { status: input.status }),
      },
      include: { club: true },
    });

    return {
      id: updated.id,
      title: updated.title,
      slug: updated.slug,
      description: updated.description,
      category: updated.category,
      officialUrl: updated.officialUrl,
      deadline: updated.deadline,
      startDate: updated.startDate,
      endDate: updated.endDate,
      location: updated.location,
      status: updated.status,
      clubId: updated.clubId,
      clubName: updated.club?.name || "",
      clubSlug: updated.club?.slug || "",
      createdAt: updated.createdAt,
    };
  } catch (error) {
    if ((error as { code?: string })?.code === "P2025") {
      throw new Error("NOT_FOUND: Opportunity not found.");
    }
    console.error("[Club Portal] Failed to update opportunity:", error);
    throw new Error("DATABASE_ERROR: Could not save to the database.");
  }
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

  const club = await resolveUserClub(user);

  let existingOpp;
  try {
    existingOpp = await prisma.opportunity.findUnique({
      where: { id },
      include: { club: true },
    });
  } catch (error) {
    console.error("[Club Portal] Failed to find opportunity:", error);
    throw new Error("DATABASE_ERROR: Could not save to the database.");
  }

  if (!existingOpp) {
    throw new Error("NOT_FOUND: Opportunity not found.");
  }

  // Strict ownership check
  const isOwner =
    user.role === "ADMIN" ||
    existingOpp.clubId === club.id ||
    existingOpp.club?.slug === club.slug;

  if (!isOwner) {
    throw new Error(
      "FORBIDDEN: You do not have permission to delete another club's opportunities."
    );
  }

  try {
    await prisma.opportunity.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    if ((error as { code?: string })?.code === "P2025") {
      throw new Error("NOT_FOUND: Opportunity not found.");
    }
    console.error("[Club Portal] Failed to delete opportunity:", error);
    throw new Error("DATABASE_ERROR: Could not save to the database.");
  }
}

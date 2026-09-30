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
 * Resolves the authenticated user's club strictly from PostgreSQL.
 */
export async function resolveUserClub(user: {
  id?: string;
  role?: string;
  clubId?: string | null;
  email?: string | null;
}): Promise<{
  id: string;
  name: string;
  slug: string;
}> {
  // 1. If user ID is available, check direct user record with club relation
  if (user.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { club: true },
    });

    if (dbUser?.club) {
      return {
        id: dbUser.club.id,
        name: dbUser.club.name,
        slug: dbUser.club.slug,
      };
    }
  }

  // 2. If user has a clubId or slug in session
  if (user.clubId) {
    const club = await prisma.club.findFirst({
      where: {
        OR: [{ id: user.clubId }, { slug: user.clubId }],
      },
    });

    if (club) {
      return {
        id: club.id,
        name: club.name,
        slug: club.slug,
      };
    }
  }

  // 3. If email is provided, check user record by email
  if (user.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email.toLowerCase() },
      include: { club: true },
    });

    if (dbUser?.club) {
      return {
        id: dbUser.club.id,
        name: dbUser.club.name,
        slug: dbUser.club.slug,
      };
    }
  }

  // 4. Admin fallback to default first club
  if (user.role === "ADMIN") {
    const firstClub = await prisma.club.findFirst({
      orderBy: { createdAt: "asc" },
    });

    if (firstClub) {
      return {
        id: firstClub.id,
        name: firstClub.name,
        slug: firstClub.slug,
      };
    }
  }

  throw new Error(
    "FORBIDDEN: No campus club is currently affiliated with your account. Please contact an administrator to assign your club."
  );
}

/**
 * Fetches opportunities belonging strictly to the specified clubId (or all if ADMIN).
 */
export async function getClubOpportunities(
  clubIdentifier: string,
  userRole: string
): Promise<ClubOpportunityRecord[]> {
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
    clubSlug: r.club?.slug || "",
    createdAt: r.createdAt,
  }));
}

/**
 * Creates a new opportunity strictly scoped to the user's club in PostgreSQL.
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
      status: input.status || "APPROVED",
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
}

/**
 * Updates an opportunity with strict ownership verification against PostgreSQL.
 */
export async function updateClubOpportunity(
  id: string,
  input: Partial<ClubOpportunityInput>,
  user: { id: string; role: string; clubId?: string | null; email?: string | null }
): Promise<ClubOpportunityRecord> {
  if (user.role !== "CLUB_OWNER" && user.role !== "ADMIN") {
    throw new Error("FORBIDDEN: Only club owners and admins can edit opportunities.");
  }

  const existingOpp = await prisma.opportunity.findUnique({
    where: { id },
    include: { club: true },
  });

  if (!existingOpp) {
    throw new Error("NOT_FOUND: Opportunity not found.");
  }

  const club = await resolveUserClub(user);

  // Strict ownership check: Must be ADMIN or match clubId
  const isOwner =
    user.role === "ADMIN" ||
    existingOpp.clubId === club.id ||
    (existingOpp.club && existingOpp.club.slug === club.slug);

  if (!isOwner) {
    throw new Error(
      "FORBIDDEN: You do not have permission to modify another club's opportunities."
    );
  }

  const updated = await prisma.opportunity.update({
    where: { id },
    data: {
      ...(input.title !== undefined && { title: input.title.trim() }),
      ...(input.description !== undefined && { description: input.description.trim() }),
      ...(input.category && { category: input.category }),
      ...(input.officialUrl !== undefined && { officialUrl: input.officialUrl.trim() }),
      ...(input.deadline && { deadline: new Date(input.deadline) }),
      ...(input.startDate !== undefined && {
        startDate: input.startDate ? new Date(input.startDate) : null,
      }),
      ...(input.endDate !== undefined && {
        endDate: input.endDate ? new Date(input.endDate) : null,
      }),
      ...(input.location !== undefined && {
        location: input.location ? input.location.trim() : null,
      }),
      ...(input.status && { status: input.status }),
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
}

/**
 * Deletes an opportunity with strict ownership verification against PostgreSQL.
 */
export async function deleteClubOpportunity(
  id: string,
  user: { id: string; role: string; clubId?: string | null; email?: string | null }
): Promise<boolean> {
  if (user.role !== "CLUB_OWNER" && user.role !== "ADMIN") {
    throw new Error("FORBIDDEN: Only club owners and admins can delete opportunities.");
  }

  const existingOpp = await prisma.opportunity.findUnique({
    where: { id },
    include: { club: true },
  });

  if (!existingOpp) {
    throw new Error("NOT_FOUND: Opportunity not found.");
  }

  const club = await resolveUserClub(user);

  // Strict ownership check
  const isOwner =
    user.role === "ADMIN" ||
    existingOpp.clubId === club.id ||
    (existingOpp.club && existingOpp.club.slug === club.slug);

  if (!isOwner) {
    throw new Error(
      "FORBIDDEN: You do not have permission to delete another club's opportunities."
    );
  }

  await prisma.opportunity.delete({
    where: { id },
  });

  return true;
}

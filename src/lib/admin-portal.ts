import { prisma } from "@/lib/prisma";
import { Role, Category, OpportunityStatus } from "@prisma/client";
import { slugify } from "@/lib/db-store";

export interface AdminClubRecord {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  websiteUrl: string | null;
  logoUrl: string | null;
  ownerCount: number;
  opportunityCount: number;
  createdAt: Date;
}

export interface AdminUserRecord {
  id: string;
  name: string | null;
  email: string | null;
  role: Role;
  clubId: string | null;
  clubName: string | null;
  createdAt: Date;
}

export interface AdminOpportunityRecord {
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

export interface AdminMetrics {
  totalUsers: number;
  totalClubs: number;
  totalOpportunities: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
}

// ── Helper ──

export async function resolveClubId(input: string | null | undefined): Promise<string | null> {
  if (!input || !input.trim()) {
    return null;
  }
  const trimmed = input.trim();
  const club = await prisma.club.findFirst({
    where: {
      OR: [{ id: trimmed }, { slug: trimmed }],
    },
    select: { id: true },
  });
  if (!club) {
    throw new Error("VALIDATION: Unknown club.");
  }
  return club.id;
}

// ── Metrics ──

export async function getAdminMetrics(): Promise<AdminMetrics> {
  try {
    const [userCount, clubCount, totalOpps, approved, submitted, rejected] = await Promise.all([
      prisma.user.count(),
      prisma.club.count(),
      prisma.opportunity.count(),
      prisma.opportunity.count({ where: { status: "APPROVED" } }),
      prisma.opportunity.count({ where: { status: "SUBMITTED" } }),
      prisma.opportunity.count({ where: { status: "REJECTED" } }),
    ]);

    return {
      totalUsers: userCount,
      totalClubs: clubCount,
      totalOpportunities: totalOpps,
      approvedCount: approved,
      pendingCount: submitted,
      rejectedCount: rejected,
    };
  } catch (error) {
    console.error("[Admin Portal] Database operation failed:", error);
    throw new Error("DATABASE_ERROR: Admin operation failed.");
  }
}

// ── Club Management ──

export async function getAllClubs(): Promise<AdminClubRecord[]> {
  try {
    const rows = await prisma.club.findMany({
      include: {
        _count: {
          select: { owners: true, opportunities: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return rows.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      websiteUrl: c.websiteUrl,
      logoUrl: c.logoUrl,
      ownerCount: c._count.owners,
      opportunityCount: c._count.opportunities,
      createdAt: c.createdAt,
    }));
  } catch (error) {
    console.error("[Admin Portal] Database operation failed:", error);
    throw new Error("DATABASE_ERROR: Admin operation failed.");
  }
}

export async function createClub(data: {
  name: string;
  slug?: string;
  description?: string;
  websiteUrl?: string;
}): Promise<AdminClubRecord> {
  const name = data.name.trim();
  const slug =
    data.slug?.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-") ||
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  try {
    const created = await prisma.club.create({
      data: {
        name,
        slug,
        description: data.description?.trim() || null,
        websiteUrl: data.websiteUrl?.trim() || null,
      },
      include: {
        _count: {
          select: { owners: true, opportunities: true },
        },
      },
    });

    return {
      id: created.id,
      name: created.name,
      slug: created.slug,
      description: created.description,
      websiteUrl: created.websiteUrl,
      logoUrl: created.logoUrl,
      ownerCount: created._count.owners,
      opportunityCount: created._count.opportunities,
      createdAt: created.createdAt,
    };
  } catch (error) {
    console.error("[Admin Portal] Database operation failed:", error);
    throw new Error("DATABASE_ERROR: Admin operation failed.");
  }
}

export async function updateClub(
  id: string,
  data: { name?: string; description?: string; websiteUrl?: string }
): Promise<AdminClubRecord> {
  try {
    const updated = await prisma.club.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.description !== undefined && { description: data.description.trim() || null }),
        ...(data.websiteUrl !== undefined && { websiteUrl: data.websiteUrl.trim() || null }),
      },
      include: {
        _count: {
          select: { owners: true, opportunities: true },
        },
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      description: updated.description,
      websiteUrl: updated.websiteUrl,
      logoUrl: updated.logoUrl,
      ownerCount: updated._count.owners,
      opportunityCount: updated._count.opportunities,
      createdAt: updated.createdAt,
    };
  } catch (error) {
    if ((error as { code?: string })?.code === "P2025") {
      throw new Error("NOT_FOUND: Club not found.");
    }
    console.error("[Admin Portal] Database operation failed:", error);
    throw new Error("DATABASE_ERROR: Admin operation failed.");
  }
}

// ── User Management ──

export async function getAllUsers(): Promise<AdminUserRecord[]> {
  try {
    const rows = await prisma.user.findMany({
      include: { club: true },
      orderBy: { createdAt: "desc" },
    });

    return rows.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      clubId: u.clubId,
      clubName: u.club?.name || null,
      createdAt: u.createdAt,
    }));
  } catch (error) {
    console.error("[Admin Portal] Database operation failed:", error);
    throw new Error("DATABASE_ERROR: Admin operation failed.");
  }
}

export async function updateUserRoleAndClub(
  userId: string,
  data: { role: Role; clubId?: string | null }
): Promise<AdminUserRecord> {
  const resolvedClubId = data.role === "CLUB_OWNER" ? await resolveClubId(data.clubId) : null;

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        role: data.role,
        clubId: resolvedClubId,
      },
      include: { club: true },
    });

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      clubId: updated.clubId,
      clubName: updated.club?.name || null,
      createdAt: updated.createdAt,
    };
  } catch (error) {
    if ((error as { code?: string })?.code === "P2025") {
      throw new Error("NOT_FOUND: User not found.");
    }
    console.error("[Admin Portal] Database operation failed:", error);
    throw new Error("DATABASE_ERROR: Admin operation failed.");
  }
}

// ── Opportunity Moderation ──

export async function getAdminOpportunities(
  statusFilter?: OpportunityStatus | "ALL"
): Promise<AdminOpportunityRecord[]> {
  try {
    const where = statusFilter && statusFilter !== "ALL" ? { status: statusFilter } : {};
    const rows = await prisma.opportunity.findMany({
      where,
      include: { club: true },
      orderBy: { createdAt: "desc" },
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
  } catch (error) {
    console.error("[Admin Portal] Database operation failed:", error);
    throw new Error("DATABASE_ERROR: Admin operation failed.");
  }
}

export async function createOpportunityAsAdmin(
  data: {
    title: string;
    description: string;
    category: Category;
    officialUrl: string;
    deadline: string | Date;
    startDate?: string | Date | null;
    endDate?: string | Date | null;
    location?: string | null;
    clubId?: string | null;
    status?: OpportunityStatus;
  },
  adminUser: { id: string; email?: string | null }
): Promise<AdminOpportunityRecord> {
  const title = data.title.trim();
  const description = data.description.trim();
  const officialUrl = data.officialUrl.trim();
  const deadline = new Date(data.deadline);

  if (title.length < 3) {
    throw new Error("VALIDATION: Title must be at least 3 characters.");
  }
  if (description.length < 10) {
    throw new Error("VALIDATION: Description must be at least 10 characters.");
  }
  if (!officialUrl.startsWith("http://") && !officialUrl.startsWith("https://")) {
    throw new Error("VALIDATION: Official URL must start with http:// or https://");
  }
  if (isNaN(deadline.getTime())) {
    throw new Error("VALIDATION: Invalid deadline date.");
  }

  let baseSlug = slugify(title);
  if (!baseSlug) baseSlug = `opportunity-${Date.now()}`;
  const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;

  try {
    const created = await prisma.opportunity.create({
      data: {
        title,
        slug,
        description,
        category: data.category,
        officialUrl,
        deadline,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        location: data.location?.trim() || "RVCE Campus",
        status: data.status || "APPROVED",
        clubId: await resolveClubId(data.clubId),
        createdById: adminUser.id,
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
      clubName: created.club?.name || "RVCE Club",
      clubSlug: created.club?.slug || "",
      createdAt: created.createdAt,
    };
  } catch (error) {
    console.error("[Admin Portal] Database operation failed:", error);
    throw new Error("DATABASE_ERROR: Admin operation failed.");
  }
}

export async function moderateOpportunity(
  id: string,
  newStatus: OpportunityStatus
): Promise<AdminOpportunityRecord> {
  try {
    const updated = await prisma.opportunity.update({
      where: { id },
      data: { status: newStatus },
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
    console.error("[Admin Portal] Database operation failed:", error);
    throw new Error("DATABASE_ERROR: Admin operation failed.");
  }
}

export async function updateOpportunityAsAdmin(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    category: Category;
    officialUrl: string;
    deadline: string | Date;
    startDate: string | Date | null;
    endDate: string | Date | null;
    location: string | null;
    status: OpportunityStatus;
  }>
): Promise<AdminOpportunityRecord> {
  try {
    const updated = await prisma.opportunity.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title.trim() }),
        ...(data.description && { description: data.description.trim() }),
        ...(data.category && { category: data.category }),
        ...(data.officialUrl && { officialUrl: data.officialUrl.trim() }),
        ...(data.deadline && { deadline: new Date(data.deadline) }),
        ...(data.startDate !== undefined && {
          startDate: data.startDate ? new Date(data.startDate) : null,
        }),
        ...(data.endDate !== undefined && {
          endDate: data.endDate ? new Date(data.endDate) : null,
        }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.status && { status: data.status }),
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
    console.error("[Admin Portal] Database operation failed:", error);
    throw new Error("DATABASE_ERROR: Admin operation failed.");
  }
}

export async function deleteOpportunityAsAdmin(id: string): Promise<boolean> {
  try {
    await prisma.opportunity.delete({ where: { id } });
    return true;
  } catch (error) {
    if ((error as { code?: string })?.code === "P2025") {
      throw new Error("NOT_FOUND: Opportunity not found.");
    }
    console.error("[Admin Portal] Database operation failed:", error);
    throw new Error("DATABASE_ERROR: Admin operation failed.");
  }
}

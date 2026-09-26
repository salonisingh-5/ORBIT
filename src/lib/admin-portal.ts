import { prisma } from "@/lib/prisma";
import { SEED_CLUBS, SEED_OPPORTUNITIES } from "@/lib/seed-data";
import { Role, Category, OpportunityStatus } from "@prisma/client";

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

// ── In-Memory Seed Storage for Dev / Offline Mode ──

let memoryClubs: AdminClubRecord[] = SEED_CLUBS.map((c, i) => ({
  id: c.slug,
  name: c.name,
  slug: c.slug,
  description: c.description,
  websiteUrl: c.websiteUrl,
  logoUrl: c.logoUrl,
  ownerCount: 1,
  opportunityCount: SEED_OPPORTUNITIES.filter((o) => o.clubSlug === c.slug).length,
  createdAt: new Date(Date.now() - (10 - i) * 86400000),
}));

let memoryUsers: AdminUserRecord[] = [
  {
    id: "user-admin-main",
    name: "Campus Administrator",
    email: "admin@rvce.edu.in",
    role: "ADMIN",
    clubId: null,
    clubName: null,
    createdAt: new Date("2026-01-01"),
  },
  {
    id: "user-lead-coding",
    name: "Coding Club Lead",
    email: "codingclub@rvce.edu.in",
    role: "CLUB_OWNER",
    clubId: "coding-club-rvce",
    clubName: "Coding Club RVCE",
    createdAt: new Date("2026-01-10"),
  },
  {
    id: "user-lead-ieee",
    name: "IEEE RVCE Lead",
    email: "ieee@rvce.edu.in",
    role: "CLUB_OWNER",
    clubId: "ieee-rvce",
    clubName: "IEEE RVCE Student Branch",
    createdAt: new Date("2026-01-15"),
  },
  {
    id: "user-student-1",
    name: "Aarav Sharma",
    email: "aarav.sharma@rvce.edu.in",
    role: "STUDENT",
    clubId: null,
    clubName: null,
    createdAt: new Date("2026-02-01"),
  },
  {
    id: "user-student-2",
    name: "Diya Rao",
    email: "diya.rao@rvce.edu.in",
    role: "STUDENT",
    clubId: null,
    clubName: null,
    createdAt: new Date("2026-02-05"),
  },
];

let memoryOpportunities: AdminOpportunityRecord[] = SEED_OPPORTUNITIES.map((opp) => ({
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

    if (clubCount > 0 || totalOpps > 0) {
      return {
        totalUsers: userCount,
        totalClubs: clubCount,
        totalOpportunities: totalOpps,
        approvedCount: approved,
        pendingCount: submitted,
        rejectedCount: rejected,
      };
    }
  } catch {
    // Rely on memory fallback
  }

  return {
    totalUsers: memoryUsers.length,
    totalClubs: memoryClubs.length,
    totalOpportunities: memoryOpportunities.length,
    approvedCount: memoryOpportunities.filter((o) => o.status === "APPROVED").length,
    pendingCount: memoryOpportunities.filter((o) => o.status === "SUBMITTED").length,
    rejectedCount: memoryOpportunities.filter((o) => o.status === "REJECTED").length,
  };
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

    if (rows.length > 0) {
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
    }
  } catch {
    // Memory fallback
  }

  return memoryClubs;
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

  const newClub: AdminClubRecord = {
    id: slug,
    name,
    slug,
    description: data.description?.trim() || null,
    websiteUrl: data.websiteUrl?.trim() || null,
    logoUrl: null,
    ownerCount: 0,
    opportunityCount: 0,
    createdAt: new Date(),
  };

  try {
    const created = await prisma.club.create({
      data: {
        name: newClub.name,
        slug: newClub.slug,
        description: newClub.description,
        websiteUrl: newClub.websiteUrl,
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
  } catch {
    memoryClubs.push(newClub);
    return newClub;
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
  } catch {
    const idx = memoryClubs.findIndex((c) => c.id === id || c.slug === id);
    if (idx === -1) {
      throw new Error("NOT_FOUND: Club not found.");
    }
    const current = memoryClubs[idx];
    const modified: AdminClubRecord = {
      ...current,
      name: data.name?.trim() || current.name,
      description: data.description !== undefined ? data.description.trim() || null : current.description,
      websiteUrl: data.websiteUrl !== undefined ? data.websiteUrl.trim() || null : current.websiteUrl,
    };
    memoryClubs[idx] = modified;
    return modified;
  }
}

// ── User Management ──

export async function getAllUsers(): Promise<AdminUserRecord[]> {
  try {
    const rows = await prisma.user.findMany({
      include: { club: true },
      orderBy: { createdAt: "desc" },
    });

    if (rows.length > 0) {
      return rows.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        clubId: u.clubId,
        clubName: u.club?.name || null,
        createdAt: u.createdAt,
      }));
    }
  } catch {
    // Memory fallback
  }

  return memoryUsers;
}

export async function updateUserRoleAndClub(
  userId: string,
  data: { role: Role; clubId?: string | null }
): Promise<AdminUserRecord> {
  const resolvedClubId = data.role === "CLUB_OWNER" ? data.clubId || null : null;

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
  } catch {
    const idx = memoryUsers.findIndex((u) => u.id === userId);
    if (idx === -1) {
      throw new Error("NOT_FOUND: User not found.");
    }
    const current = memoryUsers[idx];
    const club = resolvedClubId
      ? memoryClubs.find((c) => c.id === resolvedClubId || c.slug === resolvedClubId)
      : null;

    const modified: AdminUserRecord = {
      ...current,
      role: data.role,
      clubId: resolvedClubId,
      clubName: club?.name || null,
    };
    memoryUsers[idx] = modified;
    return modified;
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
        clubSlug: r.club?.slug || "",
        createdAt: r.createdAt,
      }));
    }
  } catch {
    // Memory fallback
  }

  if (statusFilter && statusFilter !== "ALL") {
    return memoryOpportunities.filter((o) => o.status === statusFilter);
  }
  return memoryOpportunities;
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
  } catch {
    const idx = memoryOpportunities.findIndex((o) => o.id === id);
    if (idx === -1) {
      throw new Error("NOT_FOUND: Opportunity not found.");
    }
    memoryOpportunities[idx] = {
      ...memoryOpportunities[idx],
      status: newStatus,
    };
    return memoryOpportunities[idx];
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
  } catch {
    const idx = memoryOpportunities.findIndex((o) => o.id === id);
    if (idx === -1) {
      throw new Error("NOT_FOUND: Opportunity not found.");
    }
    const current = memoryOpportunities[idx];
    const modified: AdminOpportunityRecord = {
      ...current,
      title: data.title?.trim() || current.title,
      description: data.description?.trim() || current.description,
      category: data.category || current.category,
      officialUrl: data.officialUrl?.trim() || current.officialUrl,
      deadline: data.deadline ? new Date(data.deadline) : current.deadline,
      startDate: data.startDate !== undefined ? (data.startDate ? new Date(data.startDate) : null) : current.startDate,
      endDate: data.endDate !== undefined ? (data.endDate ? new Date(data.endDate) : null) : current.endDate,
      location: data.location !== undefined ? data.location : current.location,
      status: data.status || current.status,
    };
    memoryOpportunities[idx] = modified;
    return modified;
  }
}

export async function deleteOpportunityAsAdmin(id: string): Promise<boolean> {
  try {
    await prisma.opportunity.delete({ where: { id } });
    return true;
  } catch {
    const idx = memoryOpportunities.findIndex((o) => o.id === id);
    if (idx === -1) {
      throw new Error("NOT_FOUND: Opportunity not found.");
    }
    memoryOpportunities.splice(idx, 1);
    return true;
  }
}

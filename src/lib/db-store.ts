import { prisma } from "@/lib/prisma";
import { SEED_CLUBS, SEED_OPPORTUNITIES } from "@/lib/seed-data";
import { Category, OpportunityStatus, Role } from "@prisma/client";

export interface DbClubRecord {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  websiteUrl: string | null;
  logoUrl: string | null;
  createdAt: Date;
}

export interface DbOpportunityRecord {
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
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ── Shared In-Memory Fallback State (Initialized from Seed) ──

const memoryClubs: DbClubRecord[] = SEED_CLUBS.map((c) => ({
  id: c.slug,
  name: c.name,
  slug: c.slug,
  description: c.description,
  websiteUrl: c.websiteUrl,
  logoUrl: c.logoUrl,
  createdAt: new Date(),
}));

const memoryOpportunities: DbOpportunityRecord[] = SEED_OPPORTUNITIES.map((opp) => ({
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
  createdById: "system-seed",
  createdAt: new Date(opp.createdAt),
  updatedAt: new Date(opp.createdAt),
}));

// ── Store Access Functions ──

export function getMemoryOpportunities(): DbOpportunityRecord[] {
  return memoryOpportunities;
}

export function getMemoryClubs(): DbClubRecord[] {
  return memoryClubs;
}

export function addMemoryOpportunity(opp: DbOpportunityRecord): void {
  const existingIdx = memoryOpportunities.findIndex((o) => o.id === opp.id || o.slug === opp.slug);
  if (existingIdx !== -1) {
    memoryOpportunities[existingIdx] = opp;
  } else {
    memoryOpportunities.unshift(opp);
  }
}

export function updateMemoryOpportunity(id: string, updates: Partial<DbOpportunityRecord>): DbOpportunityRecord | null {
  const idx = memoryOpportunities.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  memoryOpportunities[idx] = {
    ...memoryOpportunities[idx],
    ...updates,
    updatedAt: new Date(),
  };
  return memoryOpportunities[idx];
}

export function deleteMemoryOpportunity(id: string): boolean {
  const idx = memoryOpportunities.findIndex((o) => o.id === id);
  if (idx === -1) return false;
  memoryOpportunities.splice(idx, 1);
  return true;
}

export function addMemoryClub(club: DbClubRecord): void {
  const idx = memoryClubs.findIndex((c) => c.id === club.id || c.slug === club.slug);
  if (idx !== -1) {
    memoryClubs[idx] = club;
  } else {
    memoryClubs.push(club);
  }
}

export function updateMemoryClub(id: string, updates: Partial<DbClubRecord>): DbClubRecord | null {
  const idx = memoryClubs.findIndex((c) => c.id === id || c.slug === id);
  if (idx === -1) return null;
  memoryClubs[idx] = {
    ...memoryClubs[idx],
    ...updates,
  };
  return memoryClubs[idx];
}

export { slugify };

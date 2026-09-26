import { prisma } from "@/lib/prisma";
import { getOpportunities, type OpportunityRecord } from "@/lib/opportunities";

// In-memory fallback for local development when PostgreSQL is not connected
const memoryBookmarksByUser = new Map<string, Set<string>>();

export async function toggleBookmark(
  userId: string,
  opportunityId: string
): Promise<{ bookmarked: boolean }> {
  try {
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_opportunityId: {
          userId,
          opportunityId,
        },
      },
    });

    if (existing) {
      await prisma.bookmark.delete({
        where: { id: existing.id },
      });
      return { bookmarked: false };
    } else {
      await prisma.bookmark.create({
        data: {
          userId,
          opportunityId,
        },
      });
      return { bookmarked: true };
    }
  } catch (error) {
    // Graceful fallback to memory store
    console.warn("[Bookmarks] Database unavailable, using in-memory store:", error);
    let userSet = memoryBookmarksByUser.get(userId);
    if (!userSet) {
      userSet = new Set<string>();
      memoryBookmarksByUser.set(userId, userSet);
    }

    if (userSet.has(opportunityId)) {
      userSet.delete(opportunityId);
      return { bookmarked: false };
    } else {
      userSet.add(opportunityId);
      return { bookmarked: true };
    }
  }
}

export async function getUserBookmarkedIds(userId: string): Promise<string[]> {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      select: { opportunityId: true },
    });
    return bookmarks.map((b) => b.opportunityId);
  } catch {
    const userSet = memoryBookmarksByUser.get(userId);
    return userSet ? Array.from(userSet) : [];
  }
}

export async function getUserSavedOpportunities(userId: string): Promise<OpportunityRecord[]> {
  const bookmarkedIds = await getUserBookmarkedIds(userId);
  if (bookmarkedIds.length === 0) return [];

  const allOpportunities = await getOpportunities();
  return allOpportunities.filter((opp) => bookmarkedIds.includes(opp.id));
}

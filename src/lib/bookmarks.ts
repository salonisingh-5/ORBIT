import { prisma } from "@/lib/prisma";
import { getOpportunities, type OpportunityRecord } from "@/lib/opportunities";

export async function toggleBookmark(
  userId: string,
  opportunityId: string
): Promise<{ bookmarked: boolean }> {
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
}

export async function getUserBookmarkedIds(userId: string): Promise<string[]> {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId },
    select: { opportunityId: true },
  });
  return bookmarks.map((b) => b.opportunityId);
}

export async function getUserSavedOpportunities(userId: string): Promise<OpportunityRecord[]> {
  const bookmarkedIds = await getUserBookmarkedIds(userId);
  if (bookmarkedIds.length === 0) return [];

  const allOpportunities = await getOpportunities();
  return allOpportunities.filter((opp) => bookmarkedIds.includes(opp.id));
}

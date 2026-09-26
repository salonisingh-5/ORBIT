import { prisma } from "@/lib/prisma";
import { getUserBookmarkedIds } from "@/lib/bookmarks";
import { getOpportunities } from "@/lib/opportunities";
import { formatDeadlineCountdown } from "@/lib/date-utils";

export interface NotificationRecord {
  id: string;
  userId: string;
  opportunityId: string | null;
  opportunitySlug?: string | null;
  title: string;
  message: string;
  type: string;
  read: boolean;
  emailSent: boolean;
  createdAt: Date;
}

// In-memory fallback for local development when PostgreSQL is not connected
const memoryNotificationsByUser = new Map<string, NotificationRecord[]>();

/**
 * Initializes realistic notifications based on user bookmarks and approaching deadlines.
 */
async function getOrCreateUserNotifications(userId: string): Promise<NotificationRecord[]> {
  let list = memoryNotificationsByUser.get(userId);

  if (!list) {
    list = [];
    const bookmarkedIds = await getUserBookmarkedIds(userId);
    const opportunities = await getOpportunities();

    // 1. Welcome notification
    list.push({
      id: `notif-welcome-${userId}`,
      userId,
      opportunityId: null,
      opportunitySlug: null,
      title: "Welcome to ORBIT RVCE",
      message: "Discover, bookmark, and track verified campus hackathons, CTFs, and tech opportunities.",
      type: "ANNOUNCEMENT",
      read: false,
      emailSent: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    });

    // 2. Generate reminders for bookmarked opportunities with approaching deadlines
    for (const opp of opportunities) {
      if (bookmarkedIds.includes(opp.id)) {
        const countdown = formatDeadlineCountdown(opp.deadline);
        list.push({
          id: `notif-deadline-${opp.id}-${userId}`,
          userId,
          opportunityId: opp.id,
          opportunitySlug: opp.slug,
          title: `Deadline Approaching: ${opp.title}`,
          message: `The registration deadline is closing soon (${countdown.label}). Don't forget to submit your application on the official portal!`,
          type: "DEADLINE_REMINDER",
          read: false,
          emailSent: false,
          createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
        });
      }
    }

    memoryNotificationsByUser.set(userId, list);
  }

  return list;
}

export async function getUserNotifications(userId: string): Promise<NotificationRecord[]> {
  try {
    const rows = await prisma.notification.findMany({
      where: { userId },
      include: {
        opportunity: {
          select: { slug: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (rows.length > 0) {
      return rows.map((r) => ({
        id: r.id,
        userId: r.userId,
        opportunityId: r.opportunityId,
        opportunitySlug: r.opportunity?.slug || null,
        title: r.title,
        message: r.message,
        type: r.type,
        read: r.read,
        emailSent: r.emailSent,
        createdAt: r.createdAt,
      }));
    }

    return await getOrCreateUserNotifications(userId);
  } catch (err) {
    return await getOrCreateUserNotifications(userId);
  }
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    return await prisma.notification.count({
      where: { userId, read: false },
    });
  } catch {
    const notifs = await getOrCreateUserNotifications(userId);
    return notifs.filter((n) => !n.read).length;
  }
}

export async function markNotificationAsRead(
  userId: string,
  notificationId: string
): Promise<boolean> {
  try {
    await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true },
    });
  } catch {
    // In-memory fallback
    const notifs = memoryNotificationsByUser.get(userId);
    if (notifs) {
      const target = notifs.find((n) => n.id === notificationId);
      if (target) target.read = true;
    }
  }
  return true;
}

export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  try {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  } catch {
    // In-memory fallback
    const notifs = memoryNotificationsByUser.get(userId);
    if (notifs) {
      for (const n of notifs) {
        n.read = true;
      }
    }
  }
  return true;
}

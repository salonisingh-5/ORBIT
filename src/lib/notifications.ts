import { prisma } from "@/lib/prisma";

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

export async function getUserNotifications(userId: string): Promise<NotificationRecord[]> {
  const rows = await prisma.notification.findMany({
    where: { userId },
    include: {
      opportunity: {
        select: { slug: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

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

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return await prisma.notification.count({
    where: { userId, read: false },
  });
}

export async function markNotificationAsRead(
  userId: string,
  notificationId: string
): Promise<boolean> {
  await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true },
  });
  return true;
}

export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
  return true;
}

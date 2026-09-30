import { prisma } from "@/lib/prisma";
import { getOpportunities } from "@/lib/opportunities";
import { getUserBookmarkedIds } from "@/lib/bookmarks";
import { formatDeadlineCountdown, formatEventDate, formatEventTime } from "@/lib/date-utils";
import {
  sendEmail,
  generateDeadlineReminderHtml,
  isDeadlineApproaching,
} from "@/lib/email";

export interface ReminderJobResult {
  processedOpportunities: number;
  remindersSent: number;
  remindersSkipped: number;
  errors: string[];
}

/**
 * Checks if a reminder email has already been dispatched for this user and opportunity in PostgreSQL.
 */
export async function hasEmailBeenSent(
  userId: string,
  opportunityId: string
): Promise<boolean> {
  const existing = await prisma.notification.findFirst({
    where: {
      userId,
      opportunityId,
      emailSent: true,
    },
  });

  return Boolean(existing);
}

/**
 * Marks that an email was sent in PostgreSQL to prevent duplicate dispatches.
 */
export async function markEmailAsSent(
  userId: string,
  opportunityId: string,
  title: string,
  message: string
): Promise<void> {
  const existing = await prisma.notification.findFirst({
    where: { userId, opportunityId },
  });

  if (existing) {
    await prisma.notification.update({
      where: { id: existing.id },
      data: { emailSent: true, message, title },
    });
  } else {
    await prisma.notification.create({
      data: {
        userId,
        opportunityId,
        title,
        message,
        type: "DEADLINE_REMINDER",
        read: false,
        emailSent: true,
      },
    });
  }
}

/**
 * Core reminder pipeline: queries active opportunities, checks approaching deadlines,
 * matches bookmarked users, and dispatches Resend transactional emails.
 */
export async function processUpcomingDeadlineReminders(options?: {
  windowHours?: number;
  baseUrl?: string;
  targetUserId?: string;
  targetUserEmail?: string;
}): Promise<ReminderJobResult> {
  const windowHours = options?.windowHours ?? 72;
  const baseUrl = options?.baseUrl || process.env.NEXTAUTH_URL || "http://localhost:3000";

  const result: ReminderJobResult = {
    processedOpportunities: 0,
    remindersSent: 0,
    remindersSkipped: 0,
    errors: [],
  };

  const opportunities = await getOpportunities();
  const approaching = opportunities.filter((opp) =>
    isDeadlineApproaching(opp.deadline, windowHours)
  );

  result.processedOpportunities = approaching.length;

  // Determine user list from PostgreSQL
  let targetUsers: Array<{ id: string; email: string | null; name: string | null }> = [];

  if (options?.targetUserId && options?.targetUserEmail) {
    targetUsers = [
      {
        id: options.targetUserId,
        email: options.targetUserEmail,
        name: "RVCE Student",
      },
    ];
  } else {
    const dbUsers = await prisma.user.findMany({
      select: { id: true, email: true, name: true },
    });
    targetUsers = dbUsers;
  }

  for (const opp of approaching) {
    const countdown = formatDeadlineCountdown(opp.deadline);
    const deadlineFormatted = `${formatEventDate(opp.deadline)} at ${formatEventTime(opp.deadline)}`;

    for (const user of targetUsers) {
      if (!user.email) continue;

      // Check if user has bookmarked this opportunity
      const userBookmarks = await getUserBookmarkedIds(user.id);
      const isBookmarked = userBookmarks.includes(opp.id);

      // In production, only send to users who bookmarked the event (unless explicitly targeted)
      if (!isBookmarked && !options?.targetUserId) {
        continue;
      }

      // Check duplicate send protection against PostgreSQL
      const alreadySent = await hasEmailBeenSent(user.id, opp.id);
      if (alreadySent) {
        result.remindersSkipped++;
        continue;
      }

      // Generate HTML email
      const html = generateDeadlineReminderHtml({
        studentName: user.name || "RVCE Student",
        opportunityTitle: opp.title,
        opportunitySlug: opp.slug,
        category: opp.category,
        clubName: opp.club?.name || "RVCE Student Club",
        deadlineFormatted,
        deadlineCountdown: countdown.label,
        location: opp.location,
        officialUrl: opp.officialUrl,
        orbitUrl: `${baseUrl}/opportunities/${opp.slug}`,
      });

      const subject = `[ORBIT Reminder] ${countdown.label}: ${opp.title}`;
      const message = `Registration for ${opp.title} closes on ${deadlineFormatted}. Submit your details on the official portal.`;

      const sendRes = await sendEmail({
        to: user.email,
        subject,
        html,
        text: message,
      });

      if (sendRes.success) {
        await markEmailAsSent(user.id, opp.id, `Deadline Alert: ${opp.title}`, message);
        result.remindersSent++;
      } else {
        result.errors.push(`Failed sending to ${user.email}: ${sendRes.error}`);
      }
    }
  }

  return result;
}

import { prisma } from "@/lib/prisma";
import { getOpportunities, type OpportunityRecord } from "@/lib/opportunities";
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

// In-memory set tracking sent email keys for local development resilience
// Key format: `${userId}:${opportunityId}`
const memorySentEmails = new Set<string>();

/**
 * Checks if a reminder email has already been dispatched for this user and opportunity.
 */
export async function hasEmailBeenSent(
  userId: string,
  opportunityId: string
): Promise<boolean> {
  const key = `${userId}:${opportunityId}`;

  try {
    const existing = await prisma.notification.findFirst({
      where: {
        userId,
        opportunityId,
        emailSent: true,
      },
    });
    if (existing) return true;
  } catch {
    // Database fallback
    if (memorySentEmails.has(key)) return true;
  }

  return memorySentEmails.has(key);
}

/**
 * Marks that an email was sent to avoid duplicate dispatches.
 */
export async function markEmailAsSent(
  userId: string,
  opportunityId: string,
  title: string,
  message: string
): Promise<void> {
  const key = `${userId}:${opportunityId}`;
  memorySentEmails.add(key);

  try {
    // Upsert or create notification with emailSent: true
    const existing = await prisma.notification.findFirst({
      where: { userId, opportunityId },
    });

    if (existing) {
      await prisma.notification.update({
        where: { id: existing.id },
        data: { emailSent: true },
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
  } catch (err) {
    // In-memory fallback already recorded in memorySentEmails
  }
}

/**
 * Core reminder pipeline: queries active opportunities, checks approaching deadlines,
 * matches bookmarked users, and dispatches Resend transactional emails.
 */
export async function processUpcomingDeadlineReminders(options?: {
  windowHours?: number;
  baseUrl?: string;
  targetUserId?: string; // Optional: run for specific user
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

  // Determine user list to inspect
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
    try {
      const dbUsers = await prisma.user.findMany({
        select: { id: true, email: true, name: true },
      });
      targetUsers = dbUsers;
    } catch {
      // In development fallback, if no DB users, use current target or mock RVCE student
      if (options?.targetUserEmail) {
        targetUsers = [{
          id: options.targetUserId || "dev-student-1",
          email: options.targetUserEmail,
          name: "RVCE Student",
        }];
      }
    }
  }

  for (const opp of approaching) {
    const countdown = formatDeadlineCountdown(opp.deadline);
    const deadlineFormatted = `${formatEventDate(opp.deadline)} at ${formatEventTime(opp.deadline)}`;

    for (const user of targetUsers) {
      if (!user.email) continue;

      // Check if user has bookmarked this opportunity
      const userBookmarks = await getUserBookmarkedIds(user.id);
      const isBookmarked = userBookmarks.includes(opp.id);

      // In development/test mode or if explicitly targeted, allow dispatch
      if (!isBookmarked && !options?.targetUserId) {
        continue;
      }

      // Check duplicate send protection
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

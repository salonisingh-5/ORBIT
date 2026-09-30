import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { processUpcomingDeadlineReminders } from "@/lib/reminders";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  const isCronAuthorized = Boolean(
    cronSecret && authHeader === `Bearer ${cronSecret}`
  );

  const currentUser = await getCurrentUser();

  /*
   * Production:
   * Only the configured cron job may dispatch reminders.
   *
   * Development:
   * An authenticated ADMIN can manually trigger the job for testing.
   */
  if (process.env.NODE_ENV === "production") {
    if (!isCronAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized. Reminder dispatch is cron-only in production." },
        { status: 401 }
      );
    }
  } else {
    const isAdmin = currentUser?.role === "ADMIN";

    if (!isCronAuthorized && !isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Requires cron authorization or an admin session." },
        { status: 401 }
      );
    }
  }

  try {
    let windowHours: number | undefined;

    /*
     * Only accept the reminder window.
     * Do NOT accept targetEmail or targetUserId from the request.
     *
     * The production job must determine recipients from the database
     * based on bookmarked opportunities.
     */
    try {
      const body = await req.json();

      if (
        typeof body.windowHours === "number" &&
        Number.isFinite(body.windowHours) &&
        body.windowHours > 0
      ) {
        windowHours = body.windowHours;
      }
    } catch {
      // Empty request body is allowed.
    }

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const baseUrl = `${protocol}://${host}`;

    const summary = await processUpcomingDeadlineReminders({
      windowHours,
      baseUrl,
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : String(error);

    console.error("[API Reminders Dispatch Error]:", message);

    return NextResponse.json(
      {
        error: "Failed to dispatch deadline reminders",
        details:
          process.env.NODE_ENV === "production"
            ? undefined
            : message,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method Not Allowed. Use POST." },
    { status: 405 }
  );
}
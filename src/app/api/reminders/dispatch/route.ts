import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { processUpcomingDeadlineReminders } from "@/lib/reminders";

export async function POST(req: NextRequest) {
  // Check authorization: either authenticated user, or CRON_SECRET header matching
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const isCronAuthorized = Boolean(
    cronSecret && authHeader === `Bearer ${cronSecret}`
  );

  const currentUser = await getCurrentUser();

  // If not a cron job and not an authenticated user, reject
  if (!isCronAuthorized && !currentUser?.id) {
    return NextResponse.json(
      { error: "Unauthorized. Requires authenticated session or cron token." },
      { status: 401 }
    );
  }

  try {
    let windowHours: number | undefined;
    let targetEmail: string | undefined;

    try {
      const body = await req.json();
      if (typeof body.windowHours === "number") windowHours = body.windowHours;
      if (typeof body.targetEmail === "string") targetEmail = body.targetEmail;
    } catch {
      // Empty body is acceptable
    }

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const baseUrl = `${protocol}://${host}`;

    const summary = await processUpcomingDeadlineReminders({
      windowHours,
      baseUrl,
      targetUserId: currentUser?.id,
      targetUserEmail: targetEmail || currentUser?.email || undefined,
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[API Reminders Dispatch Error]:", message);
    return NextResponse.json(
      { error: "Failed to dispatch deadline reminders", details: message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Allow GET inspection for test / healthcheck
  return POST(req);
}

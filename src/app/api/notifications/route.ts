import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import {
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/notifications";

export async function GET() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json(
      { success: false, authenticated: false, notifications: [], unreadCount: 0 },
      { status: 401 }
    );
  }

  try {
    const [notifications, unreadCount] = await Promise.all([
      getUserNotifications(user.id),
      getUnreadNotificationCount(user.id),
    ]);

    const serialized = notifications.map((n) => ({
      ...n,
      createdAt: n.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      authenticated: true,
      notifications: serialized,
      unreadCount,
    });
  } catch (error) {
    console.error("[API Notifications] GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in with your official @rvce.edu.in account." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { notificationId, all } = body;

    if (all) {
      await markAllNotificationsAsRead(user.id);
      return NextResponse.json({ success: true, markedAll: true });
    }

    if (notificationId && typeof notificationId === "string") {
      await markNotificationAsRead(user.id, notificationId);
      return NextResponse.json({ success: true, notificationId });
    }

    return NextResponse.json(
      { error: "Missing notificationId or all flag" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[API Notifications] PATCH Error:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}

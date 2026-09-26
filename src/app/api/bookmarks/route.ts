import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getUserBookmarkedIds, toggleBookmark } from "@/lib/bookmarks";

export async function GET() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json(
      { success: false, authenticated: false, bookmarkedIds: [] },
      { status: 401 }
    );
  }

  const bookmarkedIds = await getUserBookmarkedIds(user.id);
  return NextResponse.json({
    success: true,
    authenticated: true,
    bookmarkedIds,
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in with your official @rvce.edu.in account." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { opportunityId } = body;

    if (!opportunityId || typeof opportunityId !== "string") {
      return NextResponse.json(
        { error: "Invalid opportunityId" },
        { status: 400 }
      );
    }

    const result = await toggleBookmark(user.id, opportunityId);

    return NextResponse.json({
      success: true,
      bookmarked: result.bookmarked,
      opportunityId,
    });
  } catch (error) {
    console.error("[API Bookmarks] Error toggling bookmark:", error);
    return NextResponse.json(
      { error: "Failed to update bookmark" },
      { status: 500 }
    );
  }
}

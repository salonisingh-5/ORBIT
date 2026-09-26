import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { updateClub } from "@/lib/admin-portal";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in with your official @rvce.edu.in account." },
      { status: 401 }
    );
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Administrator privileges required to modify clubs." },
      { status: 403 }
    );
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Missing club ID." }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { name, description, websiteUrl } = body;

    if (name !== undefined && (typeof name !== "string" || name.trim().length < 3)) {
      return NextResponse.json(
        { error: "Club name must be at least 3 characters long." },
        { status: 400 }
      );
    }

    if (
      websiteUrl !== undefined &&
      websiteUrl &&
      typeof websiteUrl === "string" &&
      websiteUrl.trim() &&
      !websiteUrl.startsWith("http://") &&
      !websiteUrl.startsWith("https://")
    ) {
      return NextResponse.json(
        { error: "Website URL must start with http:// or https://" },
        { status: 400 }
      );
    }

    const updated = await updateClub(id, {
      name,
      description,
      websiteUrl,
    });

    return NextResponse.json({ success: true, club: updated });
  } catch (error: any) {
    console.error(`[API Admin Clubs] PUT ${id} Error:`, error);
    if (error?.message?.includes("NOT_FOUND")) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { error: error?.message || "Failed to update club." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getAllClubs, createClub } from "@/lib/admin-portal";

export async function GET() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in with your official @rvce.edu.in account." },
      { status: 401 }
    );
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Administrator privileges required to access club registry." },
      { status: 403 }
    );
  }

  try {
    const clubs = await getAllClubs();
    return NextResponse.json({ success: true, clubs });
  } catch (error) {
    console.error("[API Admin Clubs] GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch clubs." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in with your official @rvce.edu.in account." },
      { status: 401 }
    );
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Administrator privileges required to register new clubs." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { name, slug, description, websiteUrl } = body;

    if (!name || typeof name !== "string" || name.trim().length < 3) {
      return NextResponse.json(
        { error: "Club name must be at least 3 characters long." },
        { status: 400 }
      );
    }

    if (
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

    const club = await createClub({
      name: name.trim(),
      slug: slug ? slug.trim() : undefined,
      description: description ? description.trim() : undefined,
      websiteUrl: websiteUrl ? websiteUrl.trim() : undefined,
    });

    return NextResponse.json({ success: true, club }, { status: 201 });
  } catch (error: any) {
    console.error("[API Admin Clubs] POST Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to register club." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import {
  getClubOpportunities,
  createClubOpportunity,
  resolveUserClub,
} from "@/lib/club-portal";
import { Category, OpportunityStatus } from "@prisma/client";

const VALID_CATEGORIES = new Set<Category>([
  "HACKATHON",
  "CTF",
  "CODING_CONTEST",
  "WORKSHOP",
  "INTERNSHIP",
  "COMPETITION",
  "OTHER",
]);

export async function GET() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in with your official @rvce.edu.in account." },
      { status: 401 }
    );
  }

  if (user.role === "STUDENT") {
    return NextResponse.json(
      { error: "Forbidden: Only club representatives and administrators can access the club portal." },
      { status: 403 }
    );
  }

  try {
    const club = resolveUserClub(user);
    const opportunities = await getClubOpportunities(club.id, user.role);

    return NextResponse.json({
      success: true,
      club,
      opportunities,
    });
  } catch (error) {
    console.error("[API Club Opportunities] GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch club opportunities." },
      { status: 500 }
    );
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

  if (user.role !== "CLUB_OWNER" && user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Students do not have permission to publish or manage opportunities." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const {
      title,
      description,
      category,
      officialUrl,
      deadline,
      startDate,
      endDate,
      location,
      status,
    } = body;

    // Validation
    if (!title || typeof title !== "string" || title.trim().length < 3) {
      return NextResponse.json(
        { error: "Opportunity title must be at least 3 characters long." },
        { status: 400 }
      );
    }

    if (!description || typeof description !== "string" || description.trim().length < 10) {
      return NextResponse.json(
        { error: "Opportunity description must be at least 10 characters long." },
        { status: 400 }
      );
    }

    if (!category || !VALID_CATEGORIES.has(category as Category)) {
      return NextResponse.json(
        { error: "Please select a valid opportunity category." },
        { status: 400 }
      );
    }

    if (
      !officialUrl ||
      typeof officialUrl !== "string" ||
      (!officialUrl.startsWith("http://") && !officialUrl.startsWith("https://"))
    ) {
      return NextResponse.json(
        { error: "Official URL must start with http:// or https://" },
        { status: 400 }
      );
    }

    if (!deadline || isNaN(new Date(deadline).getTime())) {
      return NextResponse.json(
        { error: "A valid registration deadline date is required." },
        { status: 400 }
      );
    }

    const opportunity = await createClubOpportunity(
      {
        title: title.trim(),
        description: description.trim(),
        category: category as Category,
        officialUrl: officialUrl.trim(),
        deadline,
        startDate: startDate || null,
        endDate: endDate || null,
        location: location ? location.trim() : null,
        status: (status as OpportunityStatus) || "APPROVED",
      },
      user
    );

    return NextResponse.json(
      {
        success: true,
        opportunity,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[API Club Opportunities] POST Error:", error);
    if (error?.message?.includes("FORBIDDEN")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: error?.message || "Failed to create opportunity." },
      { status: 500 }
    );
  }
}

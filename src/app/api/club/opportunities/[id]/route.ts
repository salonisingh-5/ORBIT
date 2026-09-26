import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { updateClubOpportunity, deleteClubOpportunity } from "@/lib/club-portal";
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

  if (user.role !== "CLUB_OWNER" && user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Students do not have permission to modify opportunities." },
      { status: 403 }
    );
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Missing opportunity ID." }, { status: 400 });
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

    // Optional field validation
    if (title !== undefined && (typeof title !== "string" || title.trim().length < 3)) {
      return NextResponse.json(
        { error: "Opportunity title must be at least 3 characters long." },
        { status: 400 }
      );
    }

    if (description !== undefined && (typeof description !== "string" || description.trim().length < 10)) {
      return NextResponse.json(
        { error: "Opportunity description must be at least 10 characters long." },
        { status: 400 }
      );
    }

    if (category !== undefined && !VALID_CATEGORIES.has(category as Category)) {
      return NextResponse.json(
        { error: "Please select a valid opportunity category." },
        { status: 400 }
      );
    }

    if (
      officialUrl !== undefined &&
      (typeof officialUrl !== "string" ||
        (!officialUrl.startsWith("http://") && !officialUrl.startsWith("https://")))
    ) {
      return NextResponse.json(
        { error: "Official URL must start with http:// or https://" },
        { status: 400 }
      );
    }

    if (deadline !== undefined && isNaN(new Date(deadline).getTime())) {
      return NextResponse.json(
        { error: "A valid registration deadline date is required." },
        { status: 400 }
      );
    }

    const updated = await updateClubOpportunity(
      id,
      {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(category !== undefined && { category: category as Category }),
        ...(officialUrl !== undefined && { officialUrl: officialUrl.trim() }),
        ...(deadline !== undefined && { deadline }),
        ...(startDate !== undefined && { startDate }),
        ...(endDate !== undefined && { endDate }),
        ...(location !== undefined && { location: location ? location.trim() : null }),
        ...(status !== undefined && { status: status as OpportunityStatus }),
      },
      user
    );

    return NextResponse.json({
      success: true,
      opportunity: updated,
    });
  } catch (error: any) {
    console.error(`[API Club Opportunities] PUT ${id} Error:`, error);
    if (error?.message?.includes("FORBIDDEN")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error?.message?.includes("NOT_FOUND")) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { error: error?.message || "Failed to update opportunity." },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in with your official @rvce.edu.in account." },
      { status: 401 }
    );
  }

  if (user.role !== "CLUB_OWNER" && user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Students do not have permission to delete opportunities." },
      { status: 403 }
    );
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Missing opportunity ID." }, { status: 400 });
  }

  try {
    await deleteClubOpportunity(id, user);

    return NextResponse.json({
      success: true,
      message: "Opportunity deleted successfully.",
    });
  } catch (error: any) {
    console.error(`[API Club Opportunities] DELETE ${id} Error:`, error);
    if (error?.message?.includes("FORBIDDEN")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error?.message?.includes("NOT_FOUND")) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { error: error?.message || "Failed to delete opportunity." },
      { status: 500 }
    );
  }
}

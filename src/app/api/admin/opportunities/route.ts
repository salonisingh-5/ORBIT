import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import {
  getAdminOpportunities,
  getAdminMetrics,
  createOpportunityAsAdmin,
} from "@/lib/admin-portal";
import { OpportunityStatus, Category } from "@prisma/client";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in with your official @rvce.edu.in account." },
      { status: 401 }
    );
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Administrator privileges required to access moderation queue." },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status") as OpportunityStatus | "ALL" | null;

    const [opportunities, metrics] = await Promise.all([
      getAdminOpportunities(statusParam || undefined),
      getAdminMetrics(),
    ]);

    return NextResponse.json({
      success: true,
      opportunities,
      metrics,
    });
  } catch (error) {
    console.error("[API Admin Opportunities] GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch moderation queue." },
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

  if (user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Administrator privileges required to create opportunities." },
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
      clubId,
      status,
    } = body;

    if (!title || typeof title !== "string" || title.trim().length < 3) {
      return NextResponse.json(
        { error: "Title must be at least 3 characters long." },
        { status: 400 }
      );
    }

    if (!description || typeof description !== "string" || description.trim().length < 10) {
      return NextResponse.json(
        { error: "Description must be at least 10 characters long." },
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

    const created = await createOpportunityAsAdmin(
      {
        title: title.trim(),
        description: description.trim(),
        category: category as Category,
        officialUrl: officialUrl.trim(),
        deadline,
        startDate: startDate || null,
        endDate: endDate || null,
        location: location?.trim() || null,
        clubId: clubId || null,
        status: (status as OpportunityStatus) || "APPROVED",
      },
      user
    );

    return NextResponse.json({ success: true, opportunity: created }, { status: 201 });
  } catch (error: any) {
    console.error("[API Admin Opportunities] POST Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create opportunity." },
      { status: 500 }
    );
  }
}


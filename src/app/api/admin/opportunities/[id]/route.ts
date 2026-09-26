import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import {
  moderateOpportunity,
  updateOpportunityAsAdmin,
  deleteOpportunityAsAdmin,
} from "@/lib/admin-portal";
import { OpportunityStatus, Category } from "@prisma/client";

const VALID_STATUSES = new Set<OpportunityStatus>([
  "DRAFT",
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
  "EXPIRED",
]);

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in with your official @rvce.edu.in account." },
      { status: 401 }
    );
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Administrator privileges required to moderate opportunities." },
      { status: 403 }
    );
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Missing opportunity ID." }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { status } = body;

    if (!status || !VALID_STATUSES.has(status as OpportunityStatus)) {
      return NextResponse.json(
        { error: "Invalid status value provided." },
        { status: 400 }
      );
    }

    const updated = await moderateOpportunity(id, status as OpportunityStatus);
    return NextResponse.json({ success: true, opportunity: updated });
  } catch (error: any) {
    console.error(`[API Admin Opportunities] PATCH ${id} Error:`, error);
    if (error?.message?.includes("NOT_FOUND")) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { error: error?.message || "Failed to moderate opportunity." },
      { status: 500 }
    );
  }
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
      { error: "Forbidden: Administrator privileges required to edit opportunities." },
      { status: 403 }
    );
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Missing opportunity ID." }, { status: 400 });
  }

  try {
    const body = await req.json();
    const updated = await updateOpportunityAsAdmin(id, body);
    return NextResponse.json({ success: true, opportunity: updated });
  } catch (error: any) {
    console.error(`[API Admin Opportunities] PUT ${id} Error:`, error);
    if (error?.message?.includes("NOT_FOUND")) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { error: error?.message || "Failed to edit opportunity." },
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

  if (user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Administrator privileges required to delete opportunities." },
      { status: 403 }
    );
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Missing opportunity ID." }, { status: 400 });
  }

  try {
    await deleteOpportunityAsAdmin(id);
    return NextResponse.json({
      success: true,
      message: "Opportunity deleted successfully.",
    });
  } catch (error: any) {
    console.error(`[API Admin Opportunities] DELETE ${id} Error:`, error);
    if (error?.message?.includes("NOT_FOUND")) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { error: error?.message || "Failed to delete opportunity." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getAdminOpportunities, getAdminMetrics } from "@/lib/admin-portal";
import { OpportunityStatus } from "@prisma/client";

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

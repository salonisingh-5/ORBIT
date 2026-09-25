import { NextResponse } from "next/server";
import { getOpportunities, type OpportunitySortBy } from "@/lib/opportunities";

export const dynamic = "force-dynamic";

function parseSortBy(value: string | null): OpportunitySortBy {
  return value === "newest" ? "newest" : "deadline";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const clubId = searchParams.get("clubId") ?? undefined;
  const sortBy = parseSortBy(searchParams.get("sortBy"));

  const opportunities = await getOpportunities({
    search: search?.trim() || undefined,
    category: category?.trim() || undefined,
    clubId: clubId?.trim() || undefined,
    sortBy,
  });

  return NextResponse.json({
    success: true,
    count: opportunities.length,
    opportunities,
  });
}

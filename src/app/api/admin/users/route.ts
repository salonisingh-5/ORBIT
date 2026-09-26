import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getAllUsers, updateUserRoleAndClub } from "@/lib/admin-portal";
import { Role } from "@prisma/client";

const VALID_ROLES = new Set<Role>(["STUDENT", "CLUB_OWNER", "ADMIN"]);

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
      { error: "Forbidden: Administrator privileges required to view user directory." },
      { status: 403 }
    );
  }

  try {
    const users = await getAllUsers();
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("[API Admin Users] GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch user directory." }, { status: 500 });
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

  if (user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Administrator privileges required to modify user roles." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { userId, role, clubId } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "Target userId is required." }, { status: 400 });
    }

    if (!role || !VALID_ROLES.has(role as Role)) {
      return NextResponse.json(
        { error: "Role must be STUDENT, CLUB_OWNER, or ADMIN." },
        { status: 400 }
      );
    }

    const updated = await updateUserRoleAndClub(userId, {
      role: role as Role,
      clubId: clubId || null,
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    console.error("[API Admin Users] PATCH Error:", error);
    if (error?.message?.includes("NOT_FOUND")) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { error: error?.message || "Failed to update user role." },
      { status: 500 }
    );
  }
}

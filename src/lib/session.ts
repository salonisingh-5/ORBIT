import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user?.id || user.role !== "ADMIN") return null;
  return user;
}

export async function requireAdminOrClubOwner(clubId: string) {
  const user = await getCurrentUser();
  if (!user?.id) return null;
  if (user.role === "ADMIN") return user;
  if (user.role === "CLUB_OWNER" && user.clubId && user.clubId === clubId) return user;
  return null;
}

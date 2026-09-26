import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import {
  getAllClubs,
  getAllUsers,
  getAdminOpportunities,
  getAdminMetrics,
} from "@/lib/admin-portal";
import { AdminDashboardView } from "@/components/admin/admin-dashboard-view";
import { AdminAuthGuard } from "@/components/admin/admin-auth-guard";

export const metadata: Metadata = {
  title: "Campus Administration Console | ORBIT RVCE",
  description:
    "Review submitted opportunities, provision campus club owners, and manage permissions across RVCE.",
};

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return <AdminAuthGuard reason="unauthenticated" />;
  }

  if (user.role !== "ADMIN") {
    return (
      <AdminAuthGuard
        reason="forbidden"
        userEmail={user.email}
        userRole={user.role}
      />
    );
  }

  const [clubs, users, opportunities, metrics] = await Promise.all([
    getAllClubs(),
    getAllUsers(),
    getAdminOpportunities(),
    getAdminMetrics(),
  ]);

  return (
    <div className="flex-1">
      <AdminDashboardView
        initialClubs={clubs}
        initialUsers={users}
        initialOpportunities={opportunities}
        initialMetrics={metrics}
        currentUser={{
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }}
      />
    </div>
  );
}

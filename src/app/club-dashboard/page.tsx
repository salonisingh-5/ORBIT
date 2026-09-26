import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { resolveUserClub, getClubOpportunities } from "@/lib/club-portal";
import { ClubDashboardView } from "@/components/club/club-dashboard-view";
import { ClubAuthCta } from "@/components/club/club-auth-cta";

export const metadata: Metadata = {
  title: "Club Owner Portal | ORBIT RVCE",
  description:
    "Publish and manage opportunities, hackathons, and technical workshops for RVCE campus clubs.",
};

export default async function ClubDashboardPage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return <ClubAuthCta reason="unauthenticated" />;
  }

  if (user.role === "STUDENT") {
    return (
      <ClubAuthCta
        reason="forbidden"
        userEmail={user.email}
        userRole={user.role}
      />
    );
  }

  // User is CLUB_OWNER or ADMIN
  const club = resolveUserClub(user);
  const opportunities = await getClubOpportunities(club.id, user.role);

  return (
    <div className="flex-1">
      <ClubDashboardView
        club={club}
        initialOpportunities={opportunities}
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }}
      />
    </div>
  );
}

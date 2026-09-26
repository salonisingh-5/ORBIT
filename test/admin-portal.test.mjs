import assert from "node:assert";

// Simulation of Central Admin Portal Service Logic
const VALID_ROLES = new Set(["STUDENT", "CLUB_OWNER", "ADMIN"]);
const VALID_STATUSES = new Set(["DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "EXPIRED"]);

class AdminPortalService {
  constructor() {
    this.clubs = [];
    this.users = [];
    this.opportunities = [];
  }

  seed({ clubs = [], users = [], opportunities = [] }) {
    this.clubs = [...clubs];
    this.users = [...users];
    this.opportunities = [...opportunities];
  }

  assertAdmin(user) {
    if (!user || user.role !== "ADMIN") {
      throw new Error("FORBIDDEN: Main Administrator privileges required.");
    }
  }

  // Club Operations
  getAllClubs(user) {
    this.assertAdmin(user);
    return [...this.clubs];
  }

  createClub(user, { name, slug, description, websiteUrl }) {
    this.assertAdmin(user);
    if (!name || typeof name !== "string" || name.trim().length < 3) {
      throw new Error("VALIDATION: Club name must be at least 3 characters.");
    }
    if (websiteUrl && !websiteUrl.startsWith("http://") && !websiteUrl.startsWith("https://")) {
      throw new Error("VALIDATION: Website URL must start with http:// or https://");
    }

    const resolvedSlug =
      slug?.trim() ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const newClub = {
      id: resolvedSlug,
      name: name.trim(),
      slug: resolvedSlug,
      description: description || null,
      websiteUrl: websiteUrl || null,
      ownerCount: 0,
      opportunityCount: 0,
    };
    this.clubs.push(newClub);
    return newClub;
  }

  updateClub(user, id, data) {
    this.assertAdmin(user);
    const target = this.clubs.find((c) => c.id === id || c.slug === id);
    if (!target) throw new Error("NOT_FOUND: Club not found.");
    if (data.websiteUrl && !data.websiteUrl.startsWith("http://") && !data.websiteUrl.startsWith("https://")) {
      throw new Error("VALIDATION: Website URL must start with http:// or https://");
    }
    Object.assign(target, data);
    return target;
  }

  // User & Role Operations
  getAllUsers(user) {
    this.assertAdmin(user);
    return [...this.users];
  }

  updateUserRole(user, targetUserId, { role, clubId }) {
    this.assertAdmin(user);
    if (!VALID_ROLES.has(role)) {
      throw new Error("VALIDATION: Invalid role specified.");
    }
    const target = this.users.find((u) => u.id === targetUserId);
    if (!target) throw new Error("NOT_FOUND: User not found.");

    target.role = role;
    target.clubId = role === "CLUB_OWNER" ? clubId || null : null;
    return target;
  }

  // Opportunity Moderation Operations
  getAdminOpportunities(user, statusFilter) {
    this.assertAdmin(user);
    if (statusFilter && statusFilter !== "ALL") {
      return this.opportunities.filter((o) => o.status === statusFilter);
    }
    return [...this.opportunities];
  }

  moderateOpportunity(user, id, newStatus) {
    this.assertAdmin(user);
    if (!VALID_STATUSES.has(newStatus)) {
      throw new Error("VALIDATION: Invalid opportunity status.");
    }
    const target = this.opportunities.find((o) => o.id === id);
    if (!target) throw new Error("NOT_FOUND: Opportunity not found.");
    target.status = newStatus;
    return target;
  }

  deleteOpportunity(user, id) {
    this.assertAdmin(user);
    const idx = this.opportunities.findIndex((o) => o.id === id);
    if (idx === -1) throw new Error("NOT_FOUND: Opportunity not found.");
    this.opportunities.splice(idx, 1);
    return true;
  }
}

console.log("Running Main Admin Dashboard & Moderation Console Suite...");

const adminService = new AdminPortalService();

// Seed dataset
adminService.seed({
  clubs: [
    { id: "coding-club-rvce", name: "Coding Club RVCE", slug: "coding-club-rvce" },
    { id: "ieee-rvce", name: "IEEE RVCE", slug: "ieee-rvce" },
  ],
  users: [
    { id: "u-student-1", name: "Student One", email: "student1@rvce.edu.in", role: "STUDENT", clubId: null },
    { id: "u-owner-1", name: "Lead One", email: "lead1@rvce.edu.in", role: "CLUB_OWNER", clubId: "coding-club-rvce" },
    { id: "u-admin-1", name: "Admin Lead", email: "admin@rvce.edu.in", role: "ADMIN", clubId: null },
  ],
  opportunities: [
    { id: "opp-1", title: "Unmoderated Hackathon", clubId: "coding-club-rvce", status: "SUBMITTED" },
    { id: "opp-2", title: "Active CTF Event", clubId: "ieee-rvce", status: "APPROVED" },
  ],
});

const studentActor = { id: "u-student-1", role: "STUDENT" };
const clubOwnerActor = { id: "u-owner-1", role: "CLUB_OWNER" };
const adminActor = { id: "u-admin-1", role: "ADMIN" };

// Test 1: Non-Admin role rejection (Students and Club Owners get 403 Forbidden)
assert.throws(
  () => adminService.getAllClubs(studentActor),
  /FORBIDDEN/,
  "Student should be rejected with 403 from admin clubs list"
);
assert.throws(
  () => adminService.getAllUsers(clubOwnerActor),
  /FORBIDDEN/,
  "Club owner should be rejected with 403 from admin users list"
);
assert.throws(
  () => adminService.moderateOpportunity(studentActor, "opp-1", "APPROVED"),
  /FORBIDDEN/,
  "Student should not be able to moderate opportunities"
);

// Test 2: Admin can register and edit campus clubs
const newClub = adminService.createClub(adminActor, {
  name: "Team Astra Robotics",
  websiteUrl: "https://astra.rvce.edu.in",
  description: "Mars Rover and Drone Racing club.",
});
assert.strictEqual(newClub.slug, "team-astra-robotics");
assert.strictEqual(adminService.getAllClubs(adminActor).length, 3);

const updatedClub = adminService.updateClub(adminActor, "team-astra-robotics", {
  description: "Updated aerospace robotics descriptions.",
});
assert.strictEqual(updatedClub.description, "Updated aerospace robotics descriptions.");

// Test 3: Club input validation
assert.throws(
  () => adminService.createClub(adminActor, { name: "ab" }),
  /VALIDATION/,
  "Club name < 3 characters must fail validation"
);
assert.throws(
  () =>
    adminService.createClub(adminActor, {
      name: "Valid Club Name",
      websiteUrl: "invalid-url-string",
    }),
  /VALIDATION/,
  "Invalid URL protocol must fail validation"
);

// Test 4: Admin can provision user roles and assign club ownership
const promotedUser = adminService.updateUserRole(adminActor, "u-student-1", {
  role: "CLUB_OWNER",
  clubId: "team-astra-robotics",
});
assert.strictEqual(promotedUser.role, "CLUB_OWNER");
assert.strictEqual(promotedUser.clubId, "team-astra-robotics");

// Demote back to student clears clubId
const demotedUser = adminService.updateUserRole(adminActor, "u-student-1", {
  role: "STUDENT",
});
assert.strictEqual(demotedUser.role, "STUDENT");
assert.strictEqual(demotedUser.clubId, null);

// Test 5: Opportunity moderation across any club
const approvedOpp = adminService.moderateOpportunity(adminActor, "opp-1", "APPROVED");
assert.strictEqual(approvedOpp.status, "APPROVED");

const pendingList = adminService.getAdminOpportunities(adminActor, "SUBMITTED");
assert.strictEqual(pendingList.length, 0, "No pending opportunities remain");

const approvedList = adminService.getAdminOpportunities(adminActor, "APPROVED");
assert.strictEqual(approvedList.length, 2, "Both opportunities are now approved");

// Test 6: Admin can delete any opportunity
const deleted = adminService.deleteOpportunity(adminActor, "opp-1");
assert.strictEqual(deleted, true);
assert.strictEqual(adminService.getAdminOpportunities(adminActor).length, 1);

console.log("✅ All 6 admin portal & moderation test cases passed successfully!");

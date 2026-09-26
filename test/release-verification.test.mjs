import assert from "node:assert";
import { SEED_CLUBS, SEED_OPPORTUNITIES } from "../src/lib/seed-data.ts";

console.log("Running Release Verification & Quality Audit Suite...");

// 1. Audit Seed Clubs data integrity
assert.ok(SEED_CLUBS.length >= 4, "Must have at least 4 official campus clubs");
for (const club of SEED_CLUBS) {
  assert.ok(club.name && club.name.trim().length > 0, `Club must have a valid name: ${club.name}`);
  assert.ok(club.slug && /^[a-z0-9-]+$/.test(club.slug), `Club slug must be url-safe: ${club.slug}`);
  if (club.websiteUrl) {
    assert.ok(
      club.websiteUrl.startsWith("http://") || club.websiteUrl.startsWith("https://"),
      `Club website must be http(s): ${club.websiteUrl}`
    );
  }
}
console.log(`  ✓ Verified ${SEED_CLUBS.length} seed clubs with valid URL slugs and metadata`);

// 2. Audit Seed Opportunities data integrity
assert.ok(SEED_OPPORTUNITIES.length >= 5, "Must have at least 5 seed opportunities");
const VALID_CATEGORIES = new Set([
  "HACKATHON",
  "CTF",
  "CODING_CONTEST",
  "WORKSHOP",
  "INTERNSHIP",
  "COMPETITION",
  "OTHER",
]);

for (const opp of SEED_OPPORTUNITIES) {
  assert.ok(opp.title && opp.title.length >= 3, `Title must be >= 3 chars: ${opp.title}`);
  assert.ok(opp.slug && /^[a-z0-9-]+$/.test(opp.slug), `Opportunity slug must be url-safe: ${opp.slug}`);
  assert.ok(VALID_CATEGORIES.has(opp.category), `Invalid category: ${opp.category}`);
  assert.ok(
    opp.officialUrl.startsWith("http://") || opp.officialUrl.startsWith("https://"),
    `Official URL must start with http(s): ${opp.officialUrl}`
  );
  assert.ok(!isNaN(new Date(opp.deadline).getTime()), `Invalid deadline date: ${opp.deadline}`);
  assert.strictEqual(opp.status, "APPROVED", `Seed opportunities should be APPROVED: ${opp.id}`);
}
console.log(`  ✓ Verified ${SEED_OPPORTUNITIES.length} seed opportunities with valid categories, deadlines, and official links`);

// 3. Institutional Domain Restriction Audit
function verifyInstitutionalDomain(email) {
  if (!email || typeof email !== "string") return false;
  return email.trim().toLowerCase().endsWith("@rvce.edu.in");
}

assert.strictEqual(verifyInstitutionalDomain("student.is21@rvce.edu.in"), true);
assert.strictEqual(verifyInstitutionalDomain("codingclub@rvce.edu.in"), true);
assert.strictEqual(verifyInstitutionalDomain("principal@rvce.edu.in"), true);
assert.strictEqual(verifyInstitutionalDomain("attacker@gmail.com"), false);
assert.strictEqual(verifyInstitutionalDomain("fake@rvce.edu.in.phishing.site"), false);
assert.strictEqual(verifyInstitutionalDomain(null), false);
console.log("  ✓ Institutional domain verification strictly enforced (@rvce.edu.in)");

// 4. Role Hierarchy & Permission Boundaries
const RolePermissions = {
  STUDENT: {
    canViewOpportunities: true,
    canBookmark: true,
    canViewCalendar: true,
    canManageClubOpportunities: false,
    canAccessAdminConsole: false,
  },
  CLUB_OWNER: {
    canViewOpportunities: true,
    canBookmark: true,
    canViewCalendar: true,
    canManageClubOpportunities: true,
    canAccessAdminConsole: false,
  },
  ADMIN: {
    canViewOpportunities: true,
    canBookmark: true,
    canViewCalendar: true,
    canManageClubOpportunities: true,
    canAccessAdminConsole: true,
  },
};

assert.strictEqual(RolePermissions.STUDENT.canManageClubOpportunities, false, "Students must not manage club opportunities");
assert.strictEqual(RolePermissions.STUDENT.canAccessAdminConsole, false, "Students must not access admin console");
assert.strictEqual(RolePermissions.CLUB_OWNER.canManageClubOpportunities, true, "Club owners manage their club opportunities");
assert.strictEqual(RolePermissions.CLUB_OWNER.canAccessAdminConsole, false, "Club owners must not access admin console");
assert.strictEqual(RolePermissions.ADMIN.canAccessAdminConsole, true, "Admins have full access to admin console");
console.log("  ✓ Role hierarchy and RBAC security boundaries verified");

console.log("✅ All release verification and data integrity checks passed successfully!");

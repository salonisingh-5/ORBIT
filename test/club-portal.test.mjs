import assert from "node:assert";

// Simulation of Scoped Club Opportunity Portal Logic
const VALID_CATEGORIES = new Set([
  "HACKATHON",
  "CTF",
  "CODING_CONTEST",
  "WORKSHOP",
  "INTERNSHIP",
  "COMPETITION",
  "OTHER",
]);

function validateInput(input) {
  if (!input.title || typeof input.title !== "string" || input.title.trim().length < 3) {
    throw new Error("VALIDATION: Title must be at least 3 characters.");
  }
  if (!input.description || typeof input.description !== "string" || input.description.trim().length < 10) {
    throw new Error("VALIDATION: Description must be at least 10 characters.");
  }
  if (
    !input.officialUrl ||
    typeof input.officialUrl !== "string" ||
    (!input.officialUrl.startsWith("http://") && !input.officialUrl.startsWith("https://"))
  ) {
    throw new Error("VALIDATION: Official URL must start with http:// or https://");
  }
  if (!input.deadline || isNaN(new Date(input.deadline).getTime())) {
    throw new Error("VALIDATION: Valid deadline date required.");
  }
  if (!input.category || !VALID_CATEGORIES.has(input.category)) {
    throw new Error("VALIDATION: Invalid category.");
  }
  return true;
}

class ClubPortalService {
  constructor() {
    this.opportunities = [];
  }

  seed(records) {
    this.opportunities = [...records];
  }

  getClubOpportunities(clubIdentifier, userRole) {
    if (userRole === "STUDENT") {
      throw new Error("FORBIDDEN: Students cannot access club portal.");
    }
    if (userRole === "ADMIN" && !clubIdentifier) {
      return [...this.opportunities];
    }
    return this.opportunities.filter(
      (opp) => opp.clubId === clubIdentifier || opp.clubSlug === clubIdentifier
    );
  }

  createOpportunity(input, user) {
    if (user.role !== "CLUB_OWNER" && user.role !== "ADMIN") {
      throw new Error("FORBIDDEN: Only club owners and admins can create opportunities.");
    }
    validateInput(input);

    const record = {
      id: `opp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category,
      officialUrl: input.officialUrl.trim(),
      deadline: new Date(input.deadline),
      location: input.location || "RVCE Campus",
      status: input.status || "APPROVED",
      clubId: user.clubId,
      clubSlug: user.clubId,
      createdById: user.id,
    };
    this.opportunities.unshift(record);
    return record;
  }

  updateOpportunity(id, input, user) {
    if (user.role !== "CLUB_OWNER" && user.role !== "ADMIN") {
      throw new Error("FORBIDDEN: Only club owners and admins can edit opportunities.");
    }

    const target = this.opportunities.find((o) => o.id === id);
    if (!target) {
      throw new Error("NOT_FOUND: Opportunity not found.");
    }

    const isOwner =
      user.role === "ADMIN" ||
      target.clubId === user.clubId ||
      target.clubSlug === user.clubId;

    if (!isOwner) {
      throw new Error(
        "FORBIDDEN: You do not have permission to modify another club's opportunities."
      );
    }

    if (input.officialUrl) {
      if (!input.officialUrl.startsWith("http://") && !input.officialUrl.startsWith("https://")) {
        throw new Error("VALIDATION: Official URL must start with http:// or https://");
      }
    }

    Object.assign(target, input);
    return target;
  }

  deleteOpportunity(id, user) {
    if (user.role !== "CLUB_OWNER" && user.role !== "ADMIN") {
      throw new Error("FORBIDDEN: Only club owners and admins can delete opportunities.");
    }

    const target = this.opportunities.find((o) => o.id === id);
    if (!target) {
      throw new Error("NOT_FOUND: Opportunity not found.");
    }

    const isOwner =
      user.role === "ADMIN" ||
      target.clubId === user.clubId ||
      target.clubSlug === user.clubId;

    if (!isOwner) {
      throw new Error(
        "FORBIDDEN: You do not have permission to delete another club's opportunities."
      );
    }

    this.opportunities = this.opportunities.filter((o) => o.id !== id);
    return true;
  }
}

console.log("Running Club Owner Portal & Scoped Permissions Suite...");

const portal = new ClubPortalService();

// Seed initial test data with two distinct clubs
portal.seed([
  {
    id: "opp-coding-1",
    title: "CodeCraft Hackathon 2026",
    description: "Annual 24-hour hackathon organized by Coding Club RVCE.",
    category: "HACKATHON",
    officialUrl: "https://codingclub.rvce.edu.in/codecraft",
    deadline: new Date("2026-10-15T18:00:00Z"),
    status: "APPROVED",
    clubId: "coding-club-rvce",
    clubSlug: "coding-club-rvce",
  },
  {
    id: "opp-ieee-1",
    title: "IEEE CyberShield CTF",
    description: "Cybersecurity capture the flag contest hosted by IEEE RVCE.",
    category: "CTF",
    officialUrl: "https://ieee.rvce.edu.in/cybershield",
    deadline: new Date("2026-10-20T18:00:00Z"),
    status: "APPROVED",
    clubId: "ieee-rvce",
    clubSlug: "ieee-rvce",
  },
]);

const studentUser = { id: "user-student-1", role: "STUDENT", email: "student@rvce.edu.in" };
const codingClubLead = {
  id: "user-lead-coding",
  role: "CLUB_OWNER",
  clubId: "coding-club-rvce",
  email: "codingclub@rvce.edu.in",
};
const ieeeClubLead = {
  id: "user-lead-ieee",
  role: "CLUB_OWNER",
  clubId: "ieee-rvce",
  email: "ieee@rvce.edu.in",
};
const adminUser = {
  id: "user-admin",
  role: "ADMIN",
  clubId: null,
  email: "admin@rvce.edu.in",
};

// Test 1: Student role is rejected with 403 Forbidden
assert.throws(
  () => portal.getClubOpportunities("coding-club-rvce", studentUser.role),
  /FORBIDDEN/,
  "Student must be blocked from accessing club opportunities"
);

assert.throws(
  () =>
    portal.createOpportunity(
      {
        title: "Unauthorized Event",
        description: "Student attempting to create an event directly.",
        category: "HACKATHON",
        officialUrl: "https://example.com",
        deadline: "2026-11-01T00:00:00Z",
      },
      studentUser
    ),
  /FORBIDDEN/,
  "Student must not be permitted to create opportunities"
);

// Test 2: Club Owner can create opportunity for their own club
const created = portal.createOpportunity(
  {
    title: "Algorithm Arena 2026",
    description: "Competitive programming tournament by Coding Club.",
    category: "CODING_CONTEST",
    officialUrl: "https://codingclub.rvce.edu.in/arena",
    deadline: "2026-11-10T18:00:00Z",
  },
  codingClubLead
);
assert.strictEqual(created.title, "Algorithm Arena 2026");
assert.strictEqual(created.clubId, "coding-club-rvce");
assert.strictEqual(portal.getClubOpportunities("coding-club-rvce", codingClubLead.role).length, 2);

// Test 3: Club Owner CANNOT edit another club's opportunities (Cross-club tamper protection)
assert.throws(
  () =>
    portal.updateOpportunity(
      "opp-ieee-1",
      { title: "Hijacked Title by Coding Club" },
      codingClubLead
    ),
  /FORBIDDEN/,
  "Coding Club lead cannot edit IEEE opportunity"
);

// Test 4: Club Owner CANNOT delete another club's opportunities
assert.throws(
  () => portal.deleteOpportunity("opp-ieee-1", codingClubLead),
  /FORBIDDEN/,
  "Coding Club lead cannot delete IEEE opportunity"
);

// Test 5: Club Owner CAN edit and delete their own club's opportunities
const updated = portal.updateOpportunity(
  "opp-coding-1",
  { title: "CodeCraft Hackathon 2026 (Updated)" },
  codingClubLead
);
assert.strictEqual(updated.title, "CodeCraft Hackathon 2026 (Updated)");

const deleted = portal.deleteOpportunity(created.id, codingClubLead);
assert.strictEqual(deleted, true);
assert.strictEqual(portal.getClubOpportunities("coding-club-rvce", codingClubLead.role).length, 1);

// Test 6: Input Validation prevents malformed URLs and short titles
assert.throws(
  () =>
    portal.createOpportunity(
      {
        title: "Hi",
        description: "Valid description but title too short",
        category: "WORKSHOP",
        officialUrl: "https://valid.com",
        deadline: "2026-11-01T00:00:00Z",
      },
      codingClubLead
    ),
  /VALIDATION/,
  "Title under 3 chars must fail validation"
);

assert.throws(
  () =>
    portal.createOpportunity(
      {
        title: "Valid Workshop Title",
        description: "Valid description for the workshop",
        category: "WORKSHOP",
        officialUrl: "ftp://invalid-protocol.com",
        deadline: "2026-11-01T00:00:00Z",
      },
      codingClubLead
    ),
  /VALIDATION/,
  "Non-http(s) URL must fail validation"
);

// Test 7: Admin can manage opportunities across any club
const adminUpdated = portal.updateOpportunity(
  "opp-ieee-1",
  { title: "IEEE CTF (Admin Approved)" },
  adminUser
);
assert.strictEqual(adminUpdated.title, "IEEE CTF (Admin Approved)");

console.log("✅ All 7 club portal and scoped permission test cases passed successfully!");

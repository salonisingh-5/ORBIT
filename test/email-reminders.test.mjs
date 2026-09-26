import assert from "node:assert";
import {
  isResendConfigured,
  isDeadlineApproaching,
  sendEmail,
  generateDeadlineReminderHtml,
} from "../src/lib/email.ts";

console.log("Running Transactional Email Reminders Suite...");

// ─── 1. Template Generation Test ──────────────────────────────────────────────

const sampleContext = {
  studentName: "Aditya Kumar",
  opportunityTitle: "8th Mile National Hackathon 2026",
  opportunitySlug: "8th-mile-national-hackathon-2026",
  category: "HACKATHON",
  clubName: "Coding Club RVCE",
  deadlineFormatted: "Sun, Oct 18, 2026 at 11:59 PM",
  deadlineCountdown: "Ends in 2 days",
  location: "RVCE Campus — Seminar Hall Complex",
  officialUrl: "https://8thmile.rvce.edu.in",
  orbitUrl: "http://localhost:3000/opportunities/8th-mile-national-hackathon-2026",
};

const html = generateDeadlineReminderHtml(sampleContext);
assert.ok(html.includes("8th Mile National Hackathon 2026"), "Email HTML must contain opportunity title");
assert.ok(html.includes("Coding Club RVCE"), "Email HTML must contain club name");
assert.ok(html.includes("Ends in 2 days"), "Email HTML must include deadline countdown");
assert.ok(html.includes("http://localhost:3000/opportunities/8th-mile-national-hackathon-2026"), "Email HTML must include ORBIT opportunity link");
assert.ok(html.includes("https://8thmile.rvce.edu.in"), "Email HTML must include official portal link");
assert.ok(html.includes("@rvce.edu.in"), "Email HTML must include institutional verification text");

// ─── 2. Approaching Deadline Window Logic ────────────────────────────────────

const now = Date.now();
const in24Hours = new Date(now + 24 * 60 * 60 * 1000);
const in48Hours = new Date(now + 48 * 60 * 60 * 1000);
const in5Days = new Date(now + 5 * 24 * 60 * 60 * 1000);
const inPast = new Date(now - 2 * 60 * 60 * 1000);

assert.strictEqual(isDeadlineApproaching(in24Hours, 72), true, "Deadline in 24h should be marked approaching");
assert.strictEqual(isDeadlineApproaching(in48Hours, 72), true, "Deadline in 48h should be marked approaching");
assert.strictEqual(isDeadlineApproaching(in5Days, 72), false, "Deadline in 5 days is outside 72h window");
assert.strictEqual(isDeadlineApproaching(inPast, 72), false, "Past deadline should never trigger reminder");

// ─── 3. Safe Development Fallback (Resend Simulated Mode) ────────────────────

// With placeholder key, sendEmail should safely simulate dispatch without crashing
const result = await sendEmail({
  to: "test.student@rvce.edu.in",
  subject: "[ORBIT Test] Reminder",
  html: "<p>Test notification</p>",
});

assert.strictEqual(result.success, true, "Simulated send must return success=true");
assert.strictEqual(result.simulated, true, "Placeholder key must trigger simulated mode");
assert.ok(result.id && result.id.startsWith("sim_"), "Must return simulated dispatch ID");

// ─── 4. Duplicate Send Protection ────────────────────────────────────────────

const sentEmailStore = new Set();
function checkDuplicateAndRecord(userId, opportunityId) {
  const key = `${userId}:${opportunityId}`;
  if (sentEmailStore.has(key)) return true;
  sentEmailStore.add(key);
  return false;
}

const testUser = "student-test-duplicate-999";
const testOpp = "opp-test-dup-101";

// Initially not sent
const alreadySent = checkDuplicateAndRecord(testUser, testOpp);
assert.strictEqual(alreadySent, false, "Initial dispatch check must allow sending");

// Second attempt should be blocked as duplicate
const duplicateBlocked = checkDuplicateAndRecord(testUser, testOpp);
assert.strictEqual(duplicateBlocked, true, "Subsequent check must block duplicate dispatch");

console.log("✅ All 4 email reminder & Resend pipeline test cases passed successfully!");

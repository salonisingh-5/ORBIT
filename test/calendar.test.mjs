import assert from "node:assert";
import {
  formatDateKey,
  isSameDay,
  getCalendarDays,
  getOpportunitiesForDate,
  getAgendaItems,
} from "../src/lib/calendar.ts";

console.log("Running Calendar Logic & Date Engine Suite...");

// ─── 1. Date Formatting & Equality ───────────────────────────────────────────

const d1 = new Date(2026, 9, 18, 14, 30); // Oct 18, 2026
const d2 = new Date(2026, 9, 18, 23, 59); // Oct 18, 2026 different time
const d3 = new Date(2026, 9, 19, 0, 1);   // Oct 19, 2026

assert.strictEqual(formatDateKey(d1), "2026-10-18", "formatDateKey should format YYYY-MM-DD");
assert.strictEqual(isSameDay(d1, d2), true, "Same day dates should match regardless of time");
assert.strictEqual(isSameDay(d1, d3), false, "Different day dates should not match");

// ─── 2. Month Padding & Matrix Generation (35 or 42 cells) ───────────────────

// October 2026 (Month index 9): Oct 1 is Thursday (day 4), Oct 31 is Saturday (day 6)
// Total days in Oct: 31. Leading padding: Sun, Mon, Tue, Wed = 4 days.
// Row cells: 4 (Sep) + 31 (Oct) = 35 days (5 full rows).
const octDays = getCalendarDays(2026, 9);
assert.ok(octDays.length === 35 || octDays.length === 42, "Grid must have full 7-day multiples (35 or 42)");
assert.strictEqual(octDays.length % 7, 0, "Grid length must be divisible by 7");

// First cell should be Sunday, Sep 27, 2026 (previous month padding)
assert.strictEqual(octDays[0].isCurrentMonth, false, "First cell is previous month padding");
assert.strictEqual(octDays[0].date.getDay(), 0, "First column must be Sunday");
assert.strictEqual(octDays[0].dayNumber, 27, "Sep 27 is start of week for Oct 1");

// Current month day counts
const currentMonthDaysInOct = octDays.filter((d) => d.isCurrentMonth);
assert.strictEqual(currentMonthDaysInOct.length, 31, "October has exactly 31 days");

// ─── 3. Leap Year Handling (February 2024 vs February 2025) ──────────────────

// Leap year 2024: Feb has 29 days
const feb2024Days = getCalendarDays(2024, 1);
const feb2024CurrentDays = feb2024Days.filter((d) => d.isCurrentMonth);
assert.strictEqual(feb2024CurrentDays.length, 29, "February in leap year 2024 must have 29 days");

// Non-leap year 2025: Feb has 28 days
const feb2025Days = getCalendarDays(2025, 1);
const feb2025CurrentDays = feb2025Days.filter((d) => d.isCurrentMonth);
assert.strictEqual(feb2025CurrentDays.length, 28, "February in non-leap year 2025 must have 28 days");

// ─── 4. Opportunity Date Matching (Deadlines vs. Active Events) ──────────────

const sampleOpportunities = [
  {
    id: "opp-1",
    title: "8th Mile National Hackathon",
    slug: "8th-mile-hack",
    description: "Annual hackathon",
    category: "HACKATHON",
    officialUrl: "https://rvce.edu.in",
    deadline: "2026-10-18T12:00:00.000Z",
    startDate: "2026-10-25T12:00:00.000Z",
    endDate: "2026-10-26T12:00:00.000Z",
    location: "RVCE Campus",
    status: "APPROVED",
    clubId: "coding-club",
    createdAt: "2026-09-01T00:00:00.000Z",
    club: { id: "coding-club", name: "Coding Club", slug: "coding-club" },
  },
  {
    id: "opp-2",
    title: "CodeBlitz Contest",
    slug: "codeblitz",
    description: "Algorithmic CP contest",
    category: "CODING_CONTEST",
    officialUrl: "https://rvce.edu.in",
    deadline: "2026-10-05T12:00:00.000Z",
    startDate: "2026-10-10T12:00:00.000Z",
    endDate: "2026-10-10T15:00:00.000Z",
    location: "Online",
    status: "APPROVED",
    clubId: "coding-club",
    createdAt: "2026-09-01T00:00:00.000Z",
    club: { id: "coding-club", name: "Coding Club", slug: "coding-club" },
  },
];

// Check deadline matching for Oct 18, 2026
const oct18Schedule = getOpportunitiesForDate("2026-10-18", sampleOpportunities);
assert.strictEqual(oct18Schedule.deadlines.length, 1, "Should find 1 deadline on Oct 18");
assert.strictEqual(oct18Schedule.deadlines[0].id, "opp-1", "Deadline matched opp-1");
assert.strictEqual(oct18Schedule.events.length, 0, "No active event on Oct 18");

// Check event date matching for Oct 25, 2026 (8th mile hackathon live day)
const oct25Schedule = getOpportunitiesForDate("2026-10-25", sampleOpportunities);
assert.strictEqual(oct25Schedule.events.length, 1, "Should find 1 active event on Oct 25");
assert.strictEqual(oct25Schedule.events[0].id, "opp-1", "Active event matched opp-1");
assert.strictEqual(oct25Schedule.deadlines.length, 0, "No deadline on Oct 25");

// ─── 5. All vs. Saved Opportunities Filtering ────────────────────────────────

const bookmarkedIds = ["opp-2"];

// All opportunities
const allAgenda = getAgendaItems(sampleOpportunities);
assert.strictEqual(allAgenda.length, 4, "All agenda items should include all 4 deadline/event dates");

// Saved only filtering
const savedOpportunities = sampleOpportunities.filter((opp) => bookmarkedIds.includes(opp.id));
const savedAgenda = getAgendaItems(savedOpportunities);
assert.strictEqual(savedAgenda.length, 2, "Saved agenda should only include dates for opp-2");
assert.strictEqual(savedAgenda[0].deadlines[0].id, "opp-2", "Saved deadline corresponds to opp-2");

console.log("✅ All 5 calendar logic & date engine test cases passed successfully!");

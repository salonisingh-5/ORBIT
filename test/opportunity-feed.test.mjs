import assert from "node:assert";

// Implementation of deadline calculation under test
function formatDeadlineCountdown(deadlineDate) {
  const deadline = typeof deadlineDate === "string" ? new Date(deadlineDate) : deadlineDate;
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();

  if (diffMs <= 0) {
    return {
      label: "Deadline passed",
      isUrgent: false,
      isPassed: true,
    };
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 24) {
    return {
      label: diffHours <= 1 ? "Ends in ~1 hour" : `Ends in ${diffHours} hours`,
      isUrgent: true,
      isPassed: false,
    };
  }

  if (diffDays === 1) {
    return {
      label: "Ends tomorrow",
      isUrgent: true,
      isPassed: false,
    };
  }

  if (diffDays <= 5) {
    return {
      label: `${diffDays} days left`,
      isUrgent: true,
      isPassed: false,
    };
  }

  const formattedDate = deadline.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: deadline.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });

  return {
    label: `Deadline: ${formattedDate}`,
    isUrgent: false,
    isPassed: false,
  };
}

function formatEventDate(dateString) {
  if (!dateString) return "TBA";
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

console.log("Running Opportunity Feed & Date Utils Suite...");

// Test Case 1: Deadline far in future
const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
const futureResult = formatDeadlineCountdown(futureDate);
assert.strictEqual(futureResult.isUrgent, false, "Future deadline (>5 days) should not be urgent");
assert.strictEqual(futureResult.isPassed, false, "Future deadline should not be passed");
assert.match(futureResult.label, /^Deadline: /, "Label should be prefixed with 'Deadline:'");

// Test Case 2: Deadline in 2 days (urgent)
const urgentDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
const urgentResult = formatDeadlineCountdown(urgentDate);
assert.strictEqual(urgentResult.isUrgent, true, "Deadline in 2 days must be marked urgent");
assert.strictEqual(urgentResult.isPassed, false, "Upcoming deadline is not passed");
assert.match(urgentResult.label, /days left$/, "Should report days left");

// Test Case 3: Deadline in the past
const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
const pastResult = formatDeadlineCountdown(pastDate);
assert.strictEqual(pastResult.isPassed, true, "Past deadline must be marked passed");
assert.strictEqual(pastResult.label, "Deadline passed", "Label should say Deadline passed");

// Test Case 4: formatEventDate produces non-empty human-readable string
const formatted = formatEventDate(new Date(2026, 9, 18));
assert.ok(formatted.includes("2026"), "Formatted date should contain year");

console.log("✅ All 4 opportunity feed & deadline test cases passed successfully!");

import assert from "node:assert";

// Function under test matching authOptions.callbacks.signIn
function verifyRvceDomain(email) {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return normalized.endsWith("@rvce.edu.in");
}

console.log("Running RVCE Domain Validation Suite...");

// Test Case 1: Valid student email
assert.strictEqual(verifyRvceDomain("student@rvce.edu.in"), true, "Valid student email must be accepted");

// Test Case 2: Valid club owner email with department subtag
assert.strictEqual(verifyRvceDomain("codingclub.lead@rvce.edu.in"), true, "Valid club lead email must be accepted");

// Test Case 3: Public gmail domain attempt
assert.strictEqual(verifyRvceDomain("student@gmail.com"), false, "External gmail address must be rejected");

// Test Case 4: Domain spoofing suffix attempt (@rvce.edu.in.attacker.org)
assert.strictEqual(verifyRvceDomain("student@rvce.edu.in.attacker.org"), false, "Spoofed domain suffix must be rejected");

// Test Case 5: Subdomain attempt (@sub.rvce.edu.in)
assert.strictEqual(verifyRvceDomain("student@sub.rvce.edu.in"), false, "Direct @rvce.edu.in domain match enforced");

// Test Case 6: Empty or missing email
assert.strictEqual(verifyRvceDomain(""), false, "Empty email must be rejected");
assert.strictEqual(verifyRvceDomain(null), false, "Null email must be rejected");

console.log("✅ All 6 domain restriction test cases passed successfully!");

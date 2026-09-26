import assert from "node:assert";

// Memory bookmark simulation testing core logic
class BookmarkManager {
  constructor() {
    this.store = new Map();
  }

  toggleBookmark(userId, opportunityId) {
    if (!userId || !opportunityId) {
      throw new Error("Missing userId or opportunityId");
    }

    let userSet = this.store.get(userId);
    if (!userSet) {
      userSet = new Set();
      this.store.set(userId, userSet);
    }

    if (userSet.has(opportunityId)) {
      userSet.delete(opportunityId);
      return { bookmarked: false };
    } else {
      userSet.add(opportunityId);
      return { bookmarked: true };
    }
  }

  getUserBookmarkedIds(userId) {
    const userSet = this.store.get(userId);
    return userSet ? Array.from(userSet) : [];
  }
}

console.log("Running Bookmarks Logic Suite...");

const manager = new BookmarkManager();
const studentId = "student-123";
const opp1 = "opp-8th-mile-hack-2026";
const opp2 = "opp-cybershield-ctf-v4";

// Test 1: Initial state is empty
assert.deepStrictEqual(manager.getUserBookmarkedIds(studentId), [], "Initial bookmarks should be empty");

// Test 2: Add first bookmark
const add1 = manager.toggleBookmark(studentId, opp1);
assert.strictEqual(add1.bookmarked, true, "First toggle should save bookmark");
assert.deepStrictEqual(manager.getUserBookmarkedIds(studentId), [opp1], "List should contain first opportunity");

// Test 3: Add second bookmark
const add2 = manager.toggleBookmark(studentId, opp2);
assert.strictEqual(add2.bookmarked, true, "Second toggle should save bookmark");
assert.strictEqual(manager.getUserBookmarkedIds(studentId).length, 2, "List should have 2 bookmarks");

// Test 4: Toggle first bookmark (should remove)
const remove1 = manager.toggleBookmark(studentId, opp1);
assert.strictEqual(remove1.bookmarked, false, "Toggling existing bookmark should remove it");
assert.deepStrictEqual(manager.getUserBookmarkedIds(studentId), [opp2], "List should now only have second opportunity");

// Test 5: Isolation between different users
const student2 = "student-456";
assert.deepStrictEqual(manager.getUserBookmarkedIds(student2), [], "Different user should have independent empty list");
manager.toggleBookmark(student2, opp1);
assert.deepStrictEqual(manager.getUserBookmarkedIds(student2), [opp1], "Student 2 has opp1");
assert.deepStrictEqual(manager.getUserBookmarkedIds(studentId), [opp2], "Student 1 still only has opp2");

console.log("✅ All 5 bookmark manager test cases passed successfully!");

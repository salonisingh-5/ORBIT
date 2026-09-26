import assert from "node:assert";

class NotificationManager {
  constructor() {
    this.store = new Map();
  }

  addNotification(userId, notif) {
    let list = this.store.get(userId);
    if (!list) {
      list = [];
      this.store.set(userId, list);
    }
    list.unshift({
      id: notif.id || `notif-${Date.now()}-${Math.random()}`,
      userId,
      title: notif.title,
      message: notif.message,
      type: notif.type || "DEADLINE_REMINDER",
      read: notif.read ?? false,
      opportunityId: notif.opportunityId || null,
      createdAt: new Date(),
    });
  }

  getUserNotifications(userId) {
    return this.store.get(userId) || [];
  }

  getUnreadCount(userId) {
    const list = this.store.get(userId) || [];
    return list.filter((n) => !n.read).length;
  }

  markAsRead(userId, notificationId) {
    const list = this.store.get(userId) || [];
    const target = list.find((n) => n.id === notificationId);
    if (target) {
      target.read = true;
      return true;
    }
    return false;
  }

  markAllAsRead(userId) {
    const list = this.store.get(userId) || [];
    for (const n of list) {
      n.read = true;
    }
    return true;
  }
}

console.log("Running In-App Notifications Suite...");

const manager = new NotificationManager();
const studentId = "student-101";

// 1. Initial count is 0
assert.strictEqual(manager.getUnreadCount(studentId), 0, "Initial unread count should be 0");

// 2. Add notifications
manager.addNotification(studentId, {
  id: "n-1",
  title: "Welcome to ORBIT RVCE",
  message: "Discover verified hackathons and workshops.",
  read: false,
});
manager.addNotification(studentId, {
  id: "n-2",
  title: "Deadline Approaching: 8th Mile Hackathon",
  message: "Ends in 2 days.",
  read: false,
});

assert.strictEqual(manager.getUserNotifications(studentId).length, 2, "User should have 2 notifications");
assert.strictEqual(manager.getUnreadCount(studentId), 2, "Unread count should be 2");

// 3. Mark single notification as read
const markSingleResult = manager.markAsRead(studentId, "n-2");
assert.strictEqual(markSingleResult, true, "Should succeed marking n-2 as read");
assert.strictEqual(manager.getUnreadCount(studentId), 1, "Unread count should decrease to 1");

// 4. Mark all as read
manager.markAllAsRead(studentId);
assert.strictEqual(manager.getUnreadCount(studentId), 0, "Unread count should be 0 after markAllAsRead");
assert.strictEqual(manager.getUserNotifications(studentId).every((n) => n.read), true, "All notifications should be marked read");

// 5. User isolation
const student2 = "student-202";
manager.addNotification(student2, {
  id: "n-3",
  title: "DevFest 2026",
  message: "DevFest is starting soon.",
  read: false,
});
assert.strictEqual(manager.getUnreadCount(student2), 1, "Student 2 has 1 unread notification");
assert.strictEqual(manager.getUnreadCount(studentId), 0, "Student 1 unread count remains 0");

console.log("✅ All 5 notification test cases passed successfully!");

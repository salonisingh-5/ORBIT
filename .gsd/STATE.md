---
updated: 2026-09-26T18:10:00+05:30
---

# Project State — ORBIT

## Current Position

- **Milestone:** v1.0
- **Phase:** 3 - Calendar & Reminders Engine
- **Plan:** Plan 3.2 completed & verified (In-App Notification Center Bell & Feed)
- **Status:** verified

## Last Action

Completed and verified Plan 3.2:
1. **Notification Data Layer** (`src/lib/notifications.ts`):
   - Created `getUserNotifications`, `getUnreadNotificationCount`, `markNotificationAsRead`, `markAllNotificationsAsRead`.
   - Dual-mode persistence: Prisma database queries with graceful in-memory fallback.
   - Automatic generation of deadline reminders for student's bookmarked opportunities.
2. **REST API Endpoint** (`src/app/api/notifications/route.ts`):
   - `GET`: verifies session via `getCurrentUser()`, returns notifications and unread count (401 if unauthenticated).
   - `PATCH`: verifies session, supports marking single item or all items as read.
3. **Frontend Bell & Dropdown UI** (`src/components/notifications/notification-bell.tsx`):
   - Bell icon with unread count pill badge and subtle pulse animation.
   - Dropdown menu showing unread count, "Mark all read" button, and list of notifications.
   - Direct link to opportunity detail page for deadline reminder items.
   - Unauthenticated guard: opening bell triggers `SignInModal` with RVCE domain notice.
4. **Global Navbar Integration** (`src/components/layout/navbar.tsx`):
   - Mounted `NotificationBell` in global header alongside `UserMenu`.
5. **Verification**:
   - `npm test`: 25/25 tests passing across all 5 suites (`auth-guard`, `opportunity-feed`, `bookmarks`, `calendar`, `notifications`).
   - `npm run build`: Exit code 0, 8 routes compiled successfully with `/api/notifications` as a dynamic route.

## Next Steps

1. Plan 3.3: Resend email reminder dispatch worker/service for approaching saved deadlines.

## Active Decisions

Decisions made that affect current work:

| Decision | Choice | Made | Affects |
|----------|--------|------|---------|
| [DECISION-001] Auth Provider | Google OAuth with `hd: "rvce.edu.in"` + Dev fallback | 2026-09-25 | Phase 1 (Complete) |
| [DECISION-002] Reminder Delivery | In-app alerts + automated email reminders via Resend | 2026-09-25 | Phase 3 (Reminders) |
| [DECISION-003] Tech Stack | Next.js App Router, Tailwind CSS, Prisma ORM, PostgreSQL | 2026-09-25 | All Phases |
| [DECISION-004] Design Aesthetic | Editorial classic beige (warm ivory, dark brown serif, muted gold) | 2026-09-25 | UI & Layouts |

## Blockers

None.

## Concerns

None. All Phase 3.2 features tested and passing.

---
milestone: v1.0
updated: 2026-09-25T19:28:00+05:30
---

# Requirements — ORBIT v1.0

## Overview
Requirements derived from [SPEC.md](file:///Users/salonisingh/Desktop/ORBIT/.gsd/SPEC.md) and [PRD.md](file:///Users/salonisingh/Desktop/ORBIT/PRD.md) for full traceability and coverage tracking.

---

## Functional Requirements

| ID | Requirement | Source | Phase | Status |
|----|-------------|--------|-------|--------|
| REQ-01 | NextAuth Google OAuth login restricted to `@rvce.edu.in` domain | SPEC Goal 3 | 1 | Pending |
| REQ-02 | Role-based access control (Student, Club Owner, Main Admin) | SPEC Goal 2 | 1 | Pending |
| REQ-03 | Database schema for Users, Clubs, Opportunities, Bookmarks, Reminders, and Notifications | SPEC Goal 1, 2 | 1 | Pending |
| REQ-04 | Opportunity browse feed with category filters (Hackathons, CTFs, Contests, Workshops, Internships, Competitions) | SPEC Goal 1 | 2 | Pending |
| REQ-05 | Full-text search and deadline/date sorting for opportunities | SPEC Goal 1 | 2 | Pending |
| REQ-06 | Opportunity detail view with description, dates, deadlines, eligibility, and official registration link | SPEC Goal 1 | 2 | Pending |
| REQ-07 | Bookmark / Save opportunity to student personal collection | SPEC Goal 4 | 2 | Pending |
| REQ-08 | Interactive calendar view displaying opportunities with filter for All vs. Saved | SPEC Goal 4 | 3 | Pending |
| REQ-09 | In-app notification center for approaching deadlines and event updates | SPEC Goal 4 | 3 | Pending |
| REQ-10 | Automated email reminder dispatch service for saved opportunities (via Resend) | SPEC Goal 4 | 3 | Pending |
| REQ-11 | Club Owner dashboard: Create, edit, and delete opportunities strictly scoped to the owner's assigned club | SPEC Goal 2 | 4 | Pending |
| REQ-12 | Admin dashboard: Club management (create/edit clubs), Club Owner provisioning, and User management | SPEC Goal 2 | 4 | Pending |
| REQ-13 | Admin moderation queue: Review, approve, reject, or edit submitted opportunities | SPEC Goal 2 | 4 | Pending |

---

## Non-Functional Requirements

| ID | Requirement | Category | Phase | Status |
|----|-------------|----------|-------|--------|
| NFR-01 | Editorial design system: Warm ivory paper background, dark brown serif headings, sans-serif body, muted gold accents | UX / Design | 1, 4 | Pending |
| NFR-02 | Responsive layout optimized for desktop, tablet, and mobile browsers | UX | All | Pending |
| NFR-03 | Sub-200ms query response time for feed and filtering through Prisma indexes | Performance | 2 | Pending |
| NFR-04 | Data security: Strict multi-tenant isolation ensuring Club Owners can never mutate another club's opportunities | Security | 1, 4 | Pending |

---

## Constraints

| ID | Constraint | Source | Impact |
|----|------------|--------|--------|
| CON-01 | Login strictly restricted to `@rvce.edu.in` Google Workspace accounts | PRD Section 3 | Auth and User registration pipeline |
| CON-02 | Next.js (React), Tailwind CSS, PostgreSQL via Prisma ORM | PRD Section 4 | Architecture and dependencies |
| CON-03 | Email dispatch via Resend API | User preference | Transactional notification pipeline |

---

## Status Definitions

| Status | Meaning |
|--------|---------|
| Pending | Not yet started |
| In Progress | Being implemented |
| Complete | Implemented and verified |
| Blocked | Cannot proceed |
| Deferred | Moved to later milestone |

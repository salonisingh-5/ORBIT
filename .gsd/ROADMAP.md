---
milestone: v1.0
version: 1.0.0
updated: 2026-09-25T19:28:00+05:30
---

# Roadmap — ORBIT

> **Current Phase:** Phase 1 - Foundation & Authentication
> **Status:** ⬜ Not Started

## Must-Haves (from SPEC)

- [ ] Google OAuth restricted strictly to `@rvce.edu.in` accounts
- [ ] Opportunity Feed with multi-category search, filter, and detail view
- [ ] Save/bookmark opportunities to student's personal list
- [ ] Interactive Calendar view (All vs. Saved opportunities)
- [ ] In-app notification center and automated email reminders (via Resend)
- [ ] Club Owner dashboard with scoped CRUD on own club's events
- [ ] Admin dashboard with club management, user management, and moderation queue
- [ ] Premium editorial aesthetic (warm ivory, dark brown serif, muted gold accents)

---

## Phases

### Phase 1: Foundation & Authentication
**Status:** ⬜ Not Started
**Objective:** Scaffold Next.js application, configure Tailwind editorial design tokens (warm ivory, dark brown serif typography, muted gold), define Prisma PostgreSQL database schema (Users, Roles, Clubs, Opportunities, Bookmarks, Notifications), and implement NextAuth Google OAuth strictly restricted to `@rvce.edu.in`.
**Requirements:** REQ-01, REQ-02, REQ-03, NFR-01, NFR-04, CON-01, CON-02

**Plans:**
- [ ] Plan 1.1: Project scaffolding, editorial theme configuration (Tailwind, typography, layout shell), and Prisma schema setup
- [ ] Plan 1.2: NextAuth Google OAuth integration with `@rvce.edu.in` domain verification and role-based session management

---

### Phase 2: Opportunity Feed & Discovery
**Status:** ⬜ Not Started
**Objective:** Implement the core student-facing discovery experience: searchable, category-filtered opportunity feed (Hackathons, CTFs, Coding Contests, Workshops, Internships, Competitions), comprehensive opportunity detail pages with official registration links, and personal bookmarking system.
**Depends on:** Phase 1
**Requirements:** REQ-04, REQ-05, REQ-06, REQ-07, NFR-02, NFR-03

**Plans:**
- [ ] Plan 2.1: Opportunity data access layer, search & filtering API, and seed opportunities
- [ ] Plan 2.2: Opportunity feed UI, category badges, search/sort controls, and detail modal/page
- [ ] Plan 2.3: Bookmark/save functionality with student personal list view

---

### Phase 3: Calendar & Reminders Engine
**Status:** ⬜ Not Started
**Objective:** Build the interactive calendar view for deadlines and event dates (with All vs. Saved filtering), develop the in-app notification center, and implement the automated email reminder pipeline via Resend for approaching deadlines.
**Depends on:** Phase 2
**Requirements:** REQ-08, REQ-09, REQ-10, CON-03

**Plans:**
- [ ] Plan 3.1: Centralized calendar view mapping event schedules and registration deadlines
- [ ] Plan 3.2: In-app notification bell & feed for upcoming deadlines
- [ ] Plan 3.3: Resend email reminder dispatch worker/service for approaching saved deadlines

---

### Phase 4: Club Owner & Admin Portals + Polish
**Status:** ⬜ Not Started
**Objective:** Build the Club Owner dashboard (allowing club representatives to manage only their own club's opportunities), the Main Admin portal (club creation, club owner provisioning, user management, opportunity moderation queue), and complete end-to-end design polish.
**Depends on:** Phase 3
**Requirements:** REQ-11, REQ-12, REQ-13, NFR-01, NFR-02, NFR-04

**Plans:**
- [ ] Plan 4.1: Club Owner portal with scoped opportunity creation, editing, and status tracking
- [ ] Plan 4.2: Admin dashboard for club management, role assignment, and opportunity moderation
- [ ] Plan 4.3: Editorial UI styling refinement, responsive polish, empty states, and release verification

---

## Progress Summary

| Phase | Status | Plans | Complete |
|-------|--------|-------|----------|
| 1: Foundation & Auth | ⬜ Not Started | 0/2 | 0% |
| 2: Feed & Discovery | ⬜ Not Started | 0/3 | 0% |
| 3: Calendar & Reminders | ⬜ Not Started | 0/3 | 0% |
| 4: Portals & Polish | ⬜ Not Started | 0/3 | 0% |

---

## Timeline

| Phase | Started | Completed | Duration |
|-------|---------|-----------|----------|
| 1 | — | — | — |
| 2 | — | — | — |
| 3 | — | — | — |
| 4 | — | — | — |

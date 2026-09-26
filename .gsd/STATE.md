---
updated: 2026-09-26T18:47:00+05:30
---

# Project State — ORBIT

## Current Position

- **Milestone:** v1.0
- **Phase:** 4 - Club Owner & Admin Portals + Polish
- **Plan:** Plan 4.2 completed & verified
- **Status:** verified

## Last Action

Completed and verified Plan 4.2 (Main Admin Dashboard, Club Provisioning, and Opportunity Moderation):
1. **Admin Service & Data Layer (`src/lib/admin-portal.ts`)**:
   - `getAdminMetrics`, `getAllClubs`, `createClub`, `updateClub`.
   - `getAllUsers`, `updateUserRoleAndClub`.
   - `getAdminOpportunities`, `moderateOpportunity`, `updateOpportunityAsAdmin`, `deleteOpportunityAsAdmin`.
   - Dual-mode support (Prisma DB + in-memory fallback for offline dev/build).
2. **REST API Endpoints (`src/app/api/admin/*`)**:
   - `GET /api/admin/clubs` & `POST /api/admin/clubs`: List and register campus clubs.
   - `PUT /api/admin/clubs/[id]`: Modify club details.
   - `GET /api/admin/users`: List all authenticated RVCE users.
   - `PATCH /api/admin/users`: Update user role (`STUDENT`, `CLUB_OWNER`, `ADMIN`) and club linkage.
   - `GET /api/admin/opportunities`: List all opportunities with status filter and metrics.
   - `PATCH /api/admin/opportunities/[id]`: Moderate status (`APPROVED`, `REJECTED`, etc.).
   - `PUT /api/admin/opportunities/[id]`: Edit opportunity details as admin.
   - `DELETE /api/admin/opportunities/[id]`: Delete opportunity across any club.
   - All admin endpoints enforce `ADMIN` role with HTTP 403 Forbidden for students and club owners.
3. **Admin Console UI (`src/app/admin/page.tsx`, `src/components/admin/*`)**:
   - `AdminDashboardView`: 3-tab layout (Opportunity Moderation, Club Registry, User Roles & Access).
   - `ClubModal`: Dialog to create/edit clubs with URL slug validation.
   - `AdminAuthGuard`: Handles 403 Forbidden for non-admins and one-click login for unauthenticated visitors.
4. **Verification**:
   - `npm test`: 42/42 tests passing across all 8 test suites.
   - `npm run build`: Exit code 0, 15 routes compiled cleanly.

## Next Steps

1. Do NOT start Plan 4.3 until instructed.

## Active Decisions

Decisions made that affect current work:

| Decision | Choice | Made | Affects |
|----------|--------|------|---------|
| [DECISION-001] Auth Provider | Google OAuth with `hd: "rvce.edu.in"` + Dev fallback | 2026-09-25 | Phase 1 (Complete) |
| [DECISION-002] Reminder Delivery | In-app alerts + automated email reminders via Resend | 2026-09-25 | Phase 3 (Complete) |
| [DECISION-003] Tech Stack | Next.js App Router, Tailwind CSS, Prisma ORM, PostgreSQL | 2026-09-25 | All Phases |
| [DECISION-004] Design Aesthetic | Editorial classic beige (warm ivory, dark brown serif, muted gold) | 2026-09-25 | UI & Layouts |
| [DECISION-005] Club Ownership | Server-side scoped validation preventing cross-club mutations | 2026-09-26 | Phase 4 (Complete) |
| [DECISION-006] Central Admin | Unified moderation queue, club registry, and user role provisioning | 2026-09-26 | Phase 4 (Plan 4.2) |

## Blockers

None.

## Concerns

None. Plan 4.2 completed and verified.

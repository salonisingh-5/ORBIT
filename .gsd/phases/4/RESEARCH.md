---
phase: 4
researched_at: 2026-09-26
discovery_level: 2
---

# Phase 4 Research — Club Owner & Admin Portals

## Objective
Design the role-based governance and opportunity management systems: the scoped Club Owner portal (Plan 4.1), the Main Admin portal (Plan 4.2), and the final editorial polish & end-to-end verification (Plan 4.3).

## Key Architectural Decisions for Plan 4.1

### Decision 1: Strict Scoped Authorization
- Roles: `STUDENT`, `CLUB_OWNER`, `ADMIN`.
- A `STUDENT` attempting to access `/club-dashboard` or mutate `/api/club/opportunities` receives a 403 Forbidden error (or redirect to `/` with error notification).
- A `CLUB_OWNER` is assigned to a specific `clubId` (e.g. `coding-club-rvce` or database `Club` id).
- When a `CLUB_OWNER` updates or deletes an opportunity, the backend checks:
  `if (opportunity.clubId !== user.clubId && user.role !== "ADMIN") return 403 Forbidden`.
- When creating an opportunity, the backend enforces:
  `clubId = user.clubId`, ensuring no club owner can spoof another club's identity.

### Decision 2: Resilient Dual-Mode Data Access
- In live database mode: executes Prisma queries on `Opportunity` and `Club` models.
- In offline/fallback mode (local dev without Postgres running): uses in-memory club opportunity store initialized with `SEED_OPPORTUNITIES`, allowing full CRUD and ownership enforcement to function offline.

### Decision 3: Editorial Beige Dashboard UX
- Warm ivory container, dark brown serif typography, subtle parchment card surfaces.
- Metric highlights: Active Opportunities, Total Bookmarks, Closing Soon.
- Table / cards view with status pills (`APPROVED`, `DRAFT`, `CANCELLED`).
- Interactive modal / form for Create / Edit Opportunity with client & server-side validation.

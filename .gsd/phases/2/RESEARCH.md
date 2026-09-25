---
phase: 2
researched_at: 2026-09-25
discovery_level: 2
---

# Phase 2 Research — Opportunity Feed & Discovery

## Objective
Design the data architecture, query filters, editorial feed interface, opportunity detail views, and bookmarking mechanics to deliver a responsive, searchable opportunity hub for RVCE students.

## Discovery Level
**Level 2** — Standard Research (Optimized query indexing, debounced client-side + server-side filtering, and resilient in-memory fallback for local development).

## Key Decisions

### Decision 1: Query & Filter Architecture (App Router Server Components + URL SearchParams)
**Question:** How should search and filtering be handled across the feed?
**Options Considered:**
1. *Client-side filtering of full dataset*: Fast for small datasets (<100 items), zero server latency, instant response.
2. *Server-side filtering with URL SearchParams*: Clean URLs (`/?category=HACKATHON&q=ai`), shareable links, scalable to thousands of items.
3. *Hybrid*: Server Component initial render from URL params + client-side interactive search/filter controls with URL sync.

**Decision:** Option 3 (Hybrid with URL SearchParams). Allows deep linking (`/?category=CTF`) and full browser navigation while keeping UI interactions immediate.
**Confidence:** High.

### Decision 2: Database Resilience & Seed Strategy
**Question:** How to guarantee the feed works immediately both when PostgreSQL is active and when developing locally offline?
**Decision:** Implement a dual-mode data access layer in `src/lib/opportunities.ts`:
- Primary: Queries Prisma PostgreSQL `prisma.opportunity.findMany()`.
- Fallback: High-fidelity curated seed data representing actual RVCE club activities (Coding Club, IEEE RVCE, E-Cell, Astra Robotics, Google Developer Student Club RVCE) with realistic upcoming deadlines.
**Confidence:** High.

### Decision 3: Bookmarking Mechanics & Auth Integration
**Question:** What happens when an unauthenticated visitor tries to bookmark an opportunity?
**Decision:**
- If authenticated: Toggle bookmark in Prisma (or state) with optimistic UI update.
- If unauthenticated: Open the editorial `SignInModal` with a contextual callout: *"Sign in with your @rvce.edu.in account to save opportunities and receive deadline reminders."*
**Confidence:** High.

### Decision 4: Editorial Card & Detail Presentation
**Question:** How to preserve the editorial beige aesthetic on opportunity cards?
**Decision:**
- Card container: `bg-orbit-card border border-orbit-border hover:border-orbit-gold/60 transition-all shadow-sm hover:shadow-md`
- Heading: `font-serif text-lg font-bold text-orbit-brown`
- Club byline: Club badge with initials, muted subtext
- Category badges: Minimal editorial pills with subtle border
- Deadline indicator: Muted gold badge with urgent status formatting (e.g., "3 days left", "Oct 15, 2026")

## Dependencies
- `lucide-react` (icons)
- `next-auth/react` (session detection for bookmarks)
- `@prisma/client` (data queries)

## Anti-Patterns to Avoid
- **Hard reload on category click**: Use Next.js shallow query param updates or client state so feed transitions are silky smooth.
- **Missing empty state**: Ensure searching for a non-existent query displays a helpful editorial empty state with a "Clear Filters" button.
- **Broken registration links**: Always validate external links and open in `target="_blank" rel="noopener noreferrer"`.

---
updated: 2026-09-25T23:58:30+05:30
---

# Project State — ORBIT

## Current Position

- **Phase**: 2 - Opportunity Feed & Discovery
- **Task**: Plan 2.2 — Feed UI, category badges, detail pages (not started)
- **Status**: Paused at 2026-09-25T23:58:30+05:30

## Last Session Summary

Plan 2.1 executed inline (subagent delegation unavailable). Seed runner, opportunity query helpers, and `GET /api/opportunities` with Prisma + in-memory seed fallback. `npm run build` passed; `/api/opportunities` is a dynamic route.

## In-Progress Work

- Files modified: none uncommitted at pause
- Tests status: build passing; Plan 2.2 UI not implemented

## Blockers

None.

## Context Dump

### Decisions Made

- Prisma seed uses `tsx prisma/seed.ts` (not ts-node ESM loader)
- Dual-mode data access: Prisma first, `SEED_OPPORTUNITIES` on connection failure
- Inline execution: one plan per session after `/pause`

### Approaches Tried

- Task subagent as gsd-executor: failed (named models unavailable on this plan) → executed Plan 2.1 inline

### Current Hypothesis

Plan 2.2 can consume `getOpportunities()` / `getOpportunityBySlug()` directly; serialize Date fields before passing to client components.

### Files of Interest

- `src/lib/opportunities.ts`: query API for the feed
- `src/lib/seed-data.ts`: 9 opportunities, 5 clubs
- `src/app/page.tsx`: static placeholder feed to replace
- `.gsd/phases/2/2.2-PLAN.md`: next plan (wave 2)
- `.gsd/phases/2/2.3-PLAN.md`: bookmark API after 2.2
- `src/components/auth/sign-in-modal.tsx`: bookmark auth prompt in 2.3

## Next Steps

1. Execute Plan 2.2: OpportunityCard, CategoryFilter, OpportunityFeed, wire `src/app/page.tsx`.
2. Build `/opportunities/[slug]` detail page with `notFound()` and SEO metadata.
3. Then Plan 2.3: bookmark API, optimistic BookmarkButton, `/saved` collection.

## Active Decisions

| Decision | Choice | Made | Affects |
|----------|--------|------|---------|
| [DECISION-001] Auth Provider | Google OAuth with `hd: "rvce.edu.in"` + Dev fallback | 2026-09-25 | Phase 1 (Complete) |
| [DECISION-002] Reminder Delivery | In-app alerts + automated email reminders via Resend | 2026-09-25 | Phase 3 (Reminders) |
| [DECISION-003] Tech Stack | Next.js App Router, Tailwind CSS, Prisma ORM, PostgreSQL | 2026-09-25 | All Phases |
| [DECISION-004] Design Aesthetic | Editorial classic beige (warm ivory, dark brown serif, muted gold) | 2026-09-25 | UI & Layouts |

## Session Context

Paused after Plan 2.1 so Plan 2.2 starts on a fresh context.

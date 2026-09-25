---
phase: 1
researched_at: 2026-09-25
discovery_level: 2
---

# Phase 1 Research — Foundation & Authentication

## Objective
Establish the architectural foundation for ORBIT: Next.js App Router scaffolding, editorial aesthetic styling tokens, Prisma PostgreSQL relational schema, and NextAuth Google OAuth strictly restricted to `@rvce.edu.in` institutional accounts.

## Discovery Level
**Level 2** — Standard Research (Configuring NextAuth Google OAuth with institutional domain locks, Prisma Auth adapter models, and editorial design token setup).

## Key Decisions

### Decision 1: NextAuth Authentication & Domain Restriction
**Question:** How to guarantee only `@rvce.edu.in` accounts authenticate while preventing external accounts from creating sessions?
**Options Considered:**
1. *Google OAuth with `hd: "rvce.edu.in"` and server-side validation*:
   - Pros: Native Google OAuth UI hints RVCE account; server-side `signIn` callback validates `email.endsWith("@rvce.edu.in")` ensuring zero bypass.
   - Cons: Requires Google Cloud Console OAuth 2.0 Client ID and Secret.
2. *Email OTP / Magic Links*:
   - Pros: No Google Cloud project setup needed.
   - Cons: Friction for users having to check inbox every login.
3. *Username/Password*:
   - Pros: Works offline.
   - Cons: High maintenance, credential reset friction, insecure without 2FA.

**Decision:** Option 1 (Google OAuth with `hd: "rvce.edu.in"` and strict `signIn` callback verification). Provide a mocked development mode fallback if client credentials are not yet supplied in `.env.local`.
**Confidence:** High.

### Decision 2: Database Schema & Role Management
**Question:** How to structure Prisma models for users, roles, clubs, and opportunities?
**Options Considered:**
1. *Single User table with Role enum and Club relation*:
   - Role enum: `STUDENT`, `CLUB_OWNER`, `ADMIN`.
   - Optional `clubId` foreign key linking Club Owners to their specific club.
   - Separate tables for `Club`, `Opportunity`, `Bookmark`, `Notification`.
   - Pros: Simple, type-safe, direct multi-tenant isolation query: `where: { clubId: user.clubId }`.
   - Cons: None for this scale.

**Decision:** Single User table with `Role` enum and `Club` relationship.
**Confidence:** High.

### Decision 3: Editorial Design Tokens in Tailwind
**Question:** How to implement the "classic beige, editorial, elegant, minimal, premium" aesthetic?
**Decision:**
- Primary background: Warm ivory / paper tones (`#FBF9F5`, `#F5F0EB`)
- Foreground / Headings: Dark espresso brown (`#241C15`, `#2E251E`)
- Body text: Neutral brown-gray (`#4A3F35`)
- Accents: Muted warm gold (`#C5A880`, `#B89758`)
- Borders: Subtle parchment rules (`#EAE3D9`)
- Typography: High-contrast editorial serif for headings (`Playfair Display` or `Cinzel` / `Merriweather`), crisp sans-serif for functional UI (`Inter` / `Geist Sans`).

## Dependencies Identified
| Package | Version | Purpose |
|---------|---------|---------|
| `next` | `^15.x` | React full-stack framework with App Router |
| `react`, `react-dom` | `^19.x` or `^18.x` | UI runtime |
| `tailwindcss` | `^3.x` or `^4.x` | Utility-first styling with custom palette |
| `@prisma/client`, `prisma` | `^5.x` or `^6.x` | PostgreSQL ORM and migration tool |
| `next-auth` | `^4.24.x` / `^5.x` | Authentication library |
| `@next-auth/prisma-adapter` | `^1.0.x` | NextAuth session persistence in PostgreSQL |
| `lucide-react` | `^0.4x` | Minimal, elegant iconography |

## Anti-Patterns to Avoid
- **Hardcoding admin emails in code**: Store admin emails in environment variables or assign via database migration/seeds.
- **Client-only domain check**: Never rely solely on client-side regex for `@rvce.edu.in`. Always enforce domain restrictions in NextAuth's `signIn` callback.
- **Generic corporate blue dashboard styling**: Avoid cold blue/gray shades; strictly maintain warm ivory/beige, dark brown, and muted gold.

## Recommendations for Planning
1. **Plan 1.1**: Project initialization, editorial design system configuration, and complete Prisma schema setup.
2. **Plan 1.2**: NextAuth authentication pipeline with domain guard, session provider, navigation bar with user state, and mock auth mode for instant local testing.

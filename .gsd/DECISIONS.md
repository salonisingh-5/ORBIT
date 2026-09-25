# DECISIONS.md — Architecture Decision Records

> **Purpose**: Log significant technical and product decisions and their rationale.

---

## Decisions

### [DECISION-001] Google OAuth Restricted to @rvce.edu.in
**Date**: 2026-09-25
**Status**: Accepted

#### Context
ORBIT is specifically built for RV College of Engineering (RVCE) students and clubs. Students and faculty have official institutional Google Workspace accounts under `@rvce.edu.in`.

#### Decision
Use NextAuth Google OAuth provider with explicit domain enforcement:
1. Pass `hd: "rvce.edu.in"` in OAuth authorization params.
2. In the NextAuth `signIn` callback, verify that the email strictly ends with `@rvce.edu.in`.

#### Rationale
- Zero friction for students (one-click login with college Google account).
- Guaranteed domain authenticity without needing manual email verification tokens or OTPs.

#### Consequences
Non-RVCE email addresses cannot log in or submit/bookmark items.

---

### [DECISION-002] Multi-Channel Reminders: In-App Feed + Resend Emails
**Date**: 2026-09-25
**Status**: Accepted

#### Context
Students frequently miss registration deadlines scattered across WhatsApp/Instagram.

#### Decision
Provide a dual-channel reminder system:
1. In-app notification center highlighting deadlines within 48h / 24h.
2. Automated transactional email reminder dispatch powered by Resend for bookmarked opportunities.

#### Rationale
In-app keeps students engaged when actively on ORBIT, while transactional emails provide reliable out-of-band alerts without needing a native mobile app.

---

### [DECISION-003] Next.js App Router + Prisma ORM + PostgreSQL
**Date**: 2026-09-25
**Status**: Accepted

#### Context
Need a modern, type-safe full-stack setup suitable for Vercel deployment with serverless PostgreSQL (Neon / Supabase).

#### Decision
Use Next.js (App Router), Prisma ORM, and PostgreSQL.

#### Rationale
- Strong type safety between database schema and React components.
- Seamless server actions / API route handlers.
- Compatible with Neon/Supabase pooling in production.

---

### [DECISION-004] Editorial Classic Beige Design Direction
**Date**: 2026-09-25
**Status**: Accepted

#### Context
The platform needs to feel like a high-end, premium editorial publication rather than a sterile generic college portal.

#### Decision
Adopt a classic beige aesthetic:
- Background: Warm ivory / paper tones (`#FBF9F5` / `#F5F2EB`).
- Typography: Dark brown, high-contrast serif for headings (`Playfair Display` or `Cinzel` / `Merriweather`), crisp sans for body.
- Accents: Muted gold (`#C5A880` / `#B89758`).
- Layout: Generous whitespace, elegant borders, subtle transitions.

---

*Last updated: 2026-09-25*

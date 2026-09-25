# SPEC.md — Project Specification

> **Status**: `FINALIZED`
>
> ⚠️ **Planning Lock**: Requirements finalized. Ready for phase planning and execution.

## Vision
ORBIT ("Opportunities Around You") is a centralized web platform for RVCE (RV College of Engineering) students to discover, save, and track student opportunities — hackathons, CTFs, coding contests, workshops, internships, and competitions — that are currently fragmented across Instagram, WhatsApp, Telegram, and club pages.

## Goals
1. **Centralized Discovery Feed** — Provide a single source of truth for all campus and external tech opportunities with multi-category search, filter, and rich detail views.
2. **Role-Based Access Control** — Enforce secure role-based capabilities for Students (read, bookmark, track), Club Owners (manage own club events), and Main Admins (system moderation, club governance, user management).
3. **Verified Institutional Authentication** — Restrict authentication strictly to `@rvce.edu.in` Google Workspace accounts via Google OAuth.
4. **Personalized Tracking & Reminders** — Enable students to bookmark opportunities, visualize deadlines in an interactive calendar, and receive automated deadline reminders via both in-app notifications and email (Resend).
5. **Editorial Design Direction** — Deliver an editorial, elegant, minimal aesthetic with a warm ivory/paper palette, dark brown serif typography for headings, clean sans-serif for body, and muted gold accents.

## Non-Goals (Out of Scope for v1)
- **No Native Mobile App**: Web-responsive application only.
- **No Push Notifications**: Notifications limited to in-app alerts and email reminders.
- **No Student Opportunity Submission**: Students cannot submit opportunities publicly; event submissions are restricted to Club Owners and Main Admins.
- **No Public Analytics Dashboard**: Deep analytics/metrics for administrators deferred to post-v1.

## Users & Roles
- **Student**:
  - Authenticate with `@rvce.edu.in` Google account.
  - Browse, search, and filter opportunities by category and deadline.
  - View event details, requirements, and official registration links.
  - Bookmark/save opportunities to a personal collection.
  - View personal deadline calendar (saved vs. all opportunities).
  - Receive deadline reminders (in-app notification feed + Resend email alerts).
- **Club Owner**:
  - All Student capabilities.
  - Add, update, and manage opportunities strictly belonging to their assigned club.
  - Cannot modify or delete opportunities belonging to other clubs.
  - View submission status (Draft, Published, Under Moderation).
- **Main Admin**:
  - Full system control: create, edit, approve, or remove any opportunity.
  - Club entity management (create clubs, manage details).
  - Assign and manage Club Owner credentials and role assignments.
  - User moderation and system moderation queue.

## Constraints
- **Authentication**: NextAuth.js configured with Google OAuth, enforcing the `rvce.edu.in` hosted domain (`hd: "rvce.edu.in"`).
- **Tech Stack**: Next.js (App Router), Tailwind CSS, PostgreSQL, Prisma ORM.
- **Email Service**: Resend API for transactional reminder emails.
- **Hosting Target**: Vercel (Next.js web application) + Neon / Supabase (PostgreSQL database).
- **Design System**: Warm ivory/beige background, dark brown serif headings, sans body, muted gold accents.

## Success Criteria
- [ ] Google OAuth login successfully authenticates `@rvce.edu.in` accounts and rejects external domain accounts.
- [ ] Multi-category opportunity feed supports real-time search, category filtering, and responsive detail pages.
- [ ] Students can bookmark opportunities and view their customized calendar of upcoming deadlines.
- [ ] Automated deadline reminder engine sends in-app notifications and email reminders via Resend.
- [ ] Club Owners can create and manage their own club's opportunities with strict multi-tenant isolation.
- [ ] Main Admins have full moderation power, club management, and role assignment capabilities.
- [ ] Clean editorial aesthetic implemented consistently across all views and screen sizes.

---

*Last updated: 2026-09-25*

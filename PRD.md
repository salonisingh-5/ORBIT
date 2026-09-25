# ORBIT — Product Requirements Document

## 1. Overview
ORBIT ("Opportunities Around You") is a centralized web platform for RVCE
students to discover, save, and track student opportunities — hackathons,
CTFs, coding contests, workshops, internships, and competitions — that are
currently scattered across Instagram, WhatsApp, Telegram, and club pages.

## 2. Users & Roles
- **Student**: view all opportunities, search/filter, save, set reminders,
  view calendar, access registration links. Cannot add/edit/delete events.
- **Club Owner**: everything a student can do, plus add/edit/update/remove
  events belonging to their own club only. Cannot touch other clubs' events.
- **Main Admin**: full control — add/edit/delete any event, manage clubs,
  create/manage club-owner accounts, manage users, moderate opportunities.

## 3. Core Features (MVP scope)
- Auth: login restricted to @rvce.edu.in email addresses
- Opportunity feed: browse, search, filter by category (hackathon / CTF /
  coding contest / workshop / internship / competition / other)
- Opportunity detail view: description, dates, deadline, official link
- Save/bookmark opportunities to a personal list
- Reminders for saved opportunities (deadline-based)
- Central calendar view of saved + all opportunities
- Club owner dashboard: CRUD on own club's events only
- Admin dashboard: full CRUD on all events, club management, club-owner
  account creation, user management, moderation queue

## 4. Tech Stack
- Frontend: Next.js (React), Tailwind CSS
- Backend: Next.js API routes
- Database: PostgreSQL via Prisma ORM
- Auth: NextAuth, restricted to @rvce.edu.in domain
- Hosting (eventual public deploy): Vercel (app) + Neon/Supabase (Postgres)

## 5. Design Direction
Classic beige, editorial, elegant, minimal, premium.
- Background: warm ivory/paper tones
- Typography: dark brown, elegant serif for headings, clean sans for body
- Accents: muted gold
- Layout: generous whitespace, subtle animations, no clutter
- Feel: high-end product, not a college dashboard

## 6. Non-goals (v1)
- No mobile app (web-responsive only)
- No push notifications (in-app/email reminders only)
- No opportunity submission by students (club owners/admin only)
- No analytics dashboard for admin (add later if needed)
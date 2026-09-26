---
phase: 3
researched_at: 2026-09-26
discovery_level: 2
---

# Phase 3 Research — Calendar & Reminders Engine

## Objective
Design the interactive calendar architecture and data mappings to provide RVCE students with a clear, editorial visual timeline of upcoming registration deadlines and event dates, with instant "All vs. Saved" filtering.

## Discovery Level
**Level 2** — Standard Research (Interactive calendar grid without heavy third-party bundle bloat, deadline vs. event schedule mapping, and responsive mobile adaptation).

## Key Decisions

### Decision 1: Lightweight Native React Calendar vs. Heavy External Libraries
**Question:** Should we pull in large external calendar packages (e.g. FullCalendar, react-big-calendar) or build a bespoke editorial calendar engine?
**Decision:** Build a lightweight bespoke calendar engine tailored to the Orbit editorial beige design language:
- Zero heavy dependencies; uses pure date arithmetic and native CSS Grid.
- 100% control over styling (warm ivory paper tones, dark brown serif numbers, muted gold urgency badges).
- Perfectly responsive with seamless switching between "Month Grid" and "Timeline Agenda List".
**Confidence:** High.

### Decision 2: Mapping Deadlines vs. Event Active Dates
**Question:** How should opportunities be projected onto calendar dates?
**Decision:**
- **Deadlines (Critical)**: Rendered with a high-visibility badge/dot (e.g. red/amber for urgent deadlines, muted gold for upcoming deadlines). This is the #1 student priority.
- **Event Active Window (Start to End)**: Displayed as event duration indicators when `startDate` and `endDate` are defined.
- Clicking any date reveals all opportunities that have registration deadlines or live sessions on that specific day.
**Confidence:** High.

### Decision 3: "All Opportunities" vs. "Saved Only" Filter Integration
**Question:** How should the All vs. Saved filter work?
**Decision:**
- Top segmented control: `All Opportunities (N)` vs. `My Saved (M)`.
- If unauthenticated and "My Saved" is clicked:
  - If user has no active session, show prompt with one-click `SignInModal` trigger.
  - If authenticated, filter calendar events to only user's bookmarked opportunities.
**Confidence:** High.

## Plan 3.1 Scope & Boundaries
- Plan 3.1 covers the centralized calendar view (`/calendar`), month navigation, date selection, agenda view, and All vs. Saved filtering.
- Plan 3.2 will cover in-app notification center bell & feed.
- Plan 3.3 will cover Resend transactional email reminder automation.

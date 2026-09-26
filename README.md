# ORBIT — Opportunities Around You

> A centralized opportunity discovery platform for RVCE students.

ORBIT is a student-focused platform that brings hackathons, CTFs, coding contests, workshops, internships, competitions, and other opportunities into one place.

Instead of checking multiple websites, WhatsApp groups, Telegram channels, and club pages, students can use ORBIT to discover opportunities, save them, track deadlines, and receive reminders.

---

## ✨ Core Idea

### Discover → Save → Track → Get Reminded → Participate

ORBIT provides a centralized space where students can:

- Discover upcoming opportunities
- Search and filter opportunities
- View complete opportunity details
- Save/bookmark opportunities
- Track opportunities through a calendar
- Receive deadline reminders
- Open the official registration page
- Discover opportunities organized by RVCE clubs

---

## 👥 User Roles

ORBIT has three main roles:

### 1. Student

Students can:

- Sign in using their RVCE account
- Browse opportunities
- Search and filter events
- View opportunity details
- Save/bookmark opportunities
- View saved opportunities
- Track deadlines through the calendar
- Receive notifications and reminders
- Register through official external links

Students cannot create, edit, or delete opportunities.

---

### 2. Club Owner

Club owners can manage opportunities belonging to their club.

They can:

- Create opportunities
- Edit their own opportunities
- Update opportunity information
- Cancel/delete their own opportunities
- View their club's opportunities

Club owners cannot modify opportunities belonging to another club.

---

### 3. Main Admin

The main administrator has full platform control.

Admins can:

- Create opportunities
- Edit opportunities
- Delete opportunities
- Approve/reject opportunities
- Manage clubs
- Manage users and roles
- Moderate platform content
- View platform statistics

All administrative permissions are enforced on the server side.

---

# 🚀 Features

## Opportunity Discovery

Students can browse opportunities using:

- Category
- Search
- Deadline
- Event information
- Club/organizer
- Location
- Mode

Supported opportunity categories include:

- Hackathons
- CTFs
- Coding Contests
- Workshops
- Internships
- Competitions
- Other

---

## 🔖 Saved Opportunities

Students can bookmark opportunities they are interested in.

Saved opportunities can then be accessed from the **Saved** section and filtered in the calendar.

Each user can have only one bookmark for a particular opportunity.

---

## 📅 Calendar

ORBIT provides a centralized calendar for opportunity deadlines and event dates.

Students can view:

- All opportunities
- Saved opportunities
- Upcoming deadlines
- Event dates
- Opportunity details

---

## 🔔 Notifications & Reminders

ORBIT supports deadline notifications.

Notifications can appear inside the application, while transactional email reminders can be sent for upcoming deadlines.

The system is designed to prevent duplicate reminder emails.

---

## 🏛️ Club Management

Clubs can have their own profile information, including:

- Club name
- Description
- Website
- Logo
- Club owners

Opportunities can be associated with their respective clubs.

---

## 🛡️ Role-Based Access Control

ORBIT uses role-based permissions.

```text
                    ORBIT
                      │
          ┌───────────┼───────────┐
          │           │           │
       STUDENT    CLUB OWNER     ADMIN
          │           │           │
       Browse      Own Club     Full Access
       Save        Events       Moderation
       Calendar    CRUD         User/Club
       Reminders                Management

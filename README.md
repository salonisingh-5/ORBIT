# ORBIT - Opportunities Around You

> A centralized opportunity discovery platform for RVCE students.

ORBIT is a web-based platform designed to help RVCE students discover, track, and manage academic and extracurricular opportunities such as hackathons, CTFs, coding contests, workshops, internships, and competitions.

The platform brings opportunities from different clubs and organizations into a centralized system so students do not have to depend on scattered WhatsApp messages, social media posts, emails, and notice boards.

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Objectives](#objectives)
- [Key Features](#key-features)
- [User Roles](#user-roles)
- [Opportunity Workflow](#opportunity-workflow)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Authentication and Security](#authentication-and-security)
- [Club Opportunity Management](#club-opportunity-management)
- [Deadline Reminders](#deadline-reminders)
- [Validation and Error Handling](#validation-and-error-handling)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Development](#development)
- [Testing](#testing)
- [Production Build](#production-build)
- [Deployment Notes](#deployment-notes)
- [Production Readiness Changes](#production-readiness-changes)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)

---

## Overview

Students often receive information about opportunities through multiple disconnected channels.

Important opportunities can be missed because:

- Information is spread across different groups and platforms.
- Deadlines are easy to overlook.
- Opportunities from different clubs are not centralized.
- Students have limited visibility into relevant opportunities.
- Club representatives need a structured way to publish opportunities.
- Administrators need control over the information displayed to students.

ORBIT addresses these problems through a centralized opportunity platform.

---

## Problem Statement

RVCE students encounter a large number of opportunities throughout the academic year, but information is often distributed across multiple communication channels.

This creates several problems:

1. **Fragmented information**
   - Opportunities are distributed across WhatsApp groups, emails, social media, and club announcements.

2. **Missed deadlines**
   - Students may discover opportunities only after registration deadlines have passed.

3. **Poor discoverability**
   - Students may not know which opportunities are available across different clubs and categories.

4. **Lack of centralized management**
   - Clubs require a structured platform for submitting and managing opportunities.

5. **Moderation requirements**
   - Opportunities submitted by clubs should be reviewed before being published to students.

ORBIT provides a centralized system to address these issues.

---

## Objectives

The primary objectives of ORBIT are to:

- Centralize student opportunities.
- Make opportunities easier to discover.
- Organize opportunities by category.
- Provide deadline information clearly.
- Allow students to bookmark opportunities.
- Provide club representatives with an opportunity management portal.
- Provide administrators with moderation and management capabilities.
- Support automated deadline reminders.
- Enforce role-based access control.
- Improve security and production readiness.

---

# Key Features

### Student Features

- Browse available opportunities.
- View opportunity details.
- Filter opportunities by category.
- Track registration deadlines.
- Bookmark opportunities.
- Receive deadline-related notifications.

### Club Features

Club representatives can:

- Access their club dashboard.
- Create opportunities.
- Provide opportunity details and official links.
- Submit opportunities for administrative review.
- Manage opportunities belonging to their club.

### Administrator Features

Administrators can:

- Manage opportunities.
- Review submitted opportunities.
- Approve or reject opportunities.
- Manage club-related information.
- Access administrative functionality.

---

# User Roles

ORBIT currently supports three primary roles:

| Role | Description |
|------|-------------|
| `STUDENT` | Discovers and bookmarks opportunities |
| `CLUB_OWNER` | Creates and manages opportunities for an assigned club |
| `ADMIN` | Performs administrative and moderation operations |

Role-based authorization is enforced on the server side.

---

# Opportunity Workflow

Opportunities follow a controlled lifecycle.

```text
Club Owner
    |
    | Create Opportunity
    v
SUBMITTED
    |
    | Admin Review
    |
    +----> APPROVED ----> Visible to Students
    |
    +----> REJECTED

ADMIN-created Opportunity
    |
    v
APPROVED

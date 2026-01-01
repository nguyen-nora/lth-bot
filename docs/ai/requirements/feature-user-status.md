---
phase: requirements
title: Requirements & Problem Understanding
description: Clarify the problem space, gather requirements, and define success criteria
---

# Requirements & Problem Understanding

## Problem Statement
**What problem are we solving?**

- **Core Problem:** Discord server members want to check their own or other users' status information, particularly marriage status and related statistics. Currently, there is no way to view this information in a consolidated format.
- **Who is affected:** 
  - Discord server members who want to check their own status
  - Users who want to view other users' marriage information
  - Server members who want to see proposal statistics
- **Current situation:** Users must manually check marriage status through separate commands or have no way to view comprehensive user information. There's no single command to view all relevant user status information.

## Goals & Objectives
**What do we want to achieve?**

- **Primary goals:**
  1. Implement `/status` slash command to display user information
  2. Show marriage status (married/not married, partner name, marriage date)
  3. Display proposal statistics:
     - Total proposals sent (all time)
     - Total proposals received (all time)
     - Pending proposals sent (awaiting response)
     - Pending proposals received (awaiting your response)
     - Accepted proposals count
     - Declined proposals count
  4. Support viewing own status (default) or another user's status (optional parameter)
  5. Present information in an embed format for better readability
  6. Use ephemeral responses for privacy

- **Secondary goals:**
  - Display user join date to server (if available via Discord API)
  - Show user's Discord account creation date (if available via Discord API)
  - Format dates in a user-friendly way (relative time or absolute date)

- **Non-goals:**
  - Displaying user roles or permissions (out of scope)
  - Showing message count or activity statistics (out of scope)
  - Displaying other bot-related data (out of scope)
  - Displaying rate limit information (internal, not user-facing)
  - Showing proposal history details (only show counts, not individual proposals)
  - Showing marriage history (only show current marriage)

## User Stories & Use Cases
**How will users interact with the solution?**

- **US1:** As a Discord user, I want to check my own status using `/status` so that I can see my marriage information and proposal statistics.
- **US2:** As a Discord user, I want to check another user's status using `/status @user` so that I can see their marriage information.
- **US3:** As a Discord user, I want to see my proposal statistics (sent/received) so that I can track my proposal activity.
- **US4:** As a Discord user, I want to see my marriage date so that I can know how long I've been married.

**Key workflows:**
1. User executes `/status` → Bot displays their own status
2. User executes `/status @user` → Bot displays target user's status
3. Status embed shows: marriage status, partner info, marriage date, proposal stats

**Edge cases to consider:**
- User has no marriage history → Show "Not married" status
- User has never sent or received proposals → Show zero counts for all statistics
- User is not in the server (for @user parameter) → Error: "User not found or not in this server."
- User has multiple pending proposals → Show total count of pending proposals
- Database query fails → Show error message gracefully: "An error occurred while fetching status information."
- Invalid user parameter → Error: "Invalid user specified."
- User has no proposals (never sent or received) → Show "No proposals" or zero counts

## Success Criteria
**How will we know when we're done?**

- **Measurable outcomes:**
  - `/status` command responds within 2 seconds
  - Command displays accurate marriage information
  - Command displays accurate proposal statistics
  - Embed format is readable and well-formatted

- **Acceptance criteria:**
  1. `/status` command works without parameters (shows own status)
  2. `/status @user` command works with user parameter (shows target user's status)
  3. Marriage information is displayed correctly (married/not married, partner, date)
  4. Proposal statistics are accurate (sent count, received count, pending count)
  5. Embed is properly formatted with appropriate colors and fields
  6. Response is ephemeral (only visible to command user)
  7. Error handling for invalid users or missing data

- **Performance benchmarks:**
  - Command response time: < 2 seconds
  - Database queries: Optimized with proper indexes
  - Embed rendering: Instant

## Constraints & Assumptions
**What limitations do we need to work within?**

- **Technical constraints:**
  - Must use existing database schema (marriages, proposals tables)
  - Must use Discord.js v14+ for embed formatting
  - Must follow existing command structure pattern
  - Must use Prisma for database queries

- **Business constraints:**
  - Should not expose sensitive information
  - Should respect user privacy (ephemeral responses)
  - Should be consistent with existing bot commands

- **Time/budget constraints:**
  - Should be implemented quickly (simple feature)
  - No external API dependencies

- **Assumptions:**
  - Users have read access to the server
  - Database contains accurate marriage and proposal data
  - Discord API provides user information (join date, account creation)
  - Users understand ephemeral responses are private

## Questions & Open Items
**What do we still need to clarify?**

- ~~Should we show proposal history (declined/expired proposals)?~~ **Resolved:** No, only show active/pending proposals
- ~~Should we show marriage history (previous marriages)?~~ **Resolved:** No, only show current marriage
- ~~Should the command be guild-specific or global?~~ **Resolved:** Guild-specific (marriages are per-guild)
- ~~Should we cache status information?~~ **Resolved:** No, query database each time for accuracy

## Error Messages
**Specific error messages for invalid scenarios:**

- **User not found:** "User not found or not in this server."
- **Invalid user parameter:** "Invalid user specified."
- **Database error:** "An error occurred while fetching status information. Please try again later."
- **User not in server (for @user):** "That user is not in this server."
- **Missing data:** Show "N/A" or "None" for missing information (graceful degradation)

## Resolved Decisions
**Decisions made during requirements gathering:**

1. **Command Format:** `/status [user]` - optional user parameter, defaults to self
2. **Response Format:** Embed with fields for marriage info and proposal stats
3. **Privacy:** Ephemeral responses (only visible to command user)
4. **Data Scope:** 
   - Current marriage only (no history)
   - Proposal statistics: Show total counts (sent/received) and pending counts
   - Do not show declined/expired proposal history details
5. **Performance:** Real-time database queries (no caching needed for MVP)
6. **Embed Structure:**
   - Title: "{User}'s Status" or "Status: {User}"
   - Fields:
     - Marriage Status: "Married to @Partner" or "Not married"
     - Married Date: "Married on {date}" or "N/A"
     - Proposals Sent: "Total: X | Pending: Y | Accepted: Z | Declined: W"
     - Proposals Received: "Total: X | Pending: Y | Accepted: Z | Declined: W"
   - Footer: Server name
   - Color: Pink (0xff69b4) to match marriage theme
   - Thumbnail: User avatar (optional)


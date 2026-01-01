---
phase: requirements
title: Requirements & Problem Understanding
description: Clarify the problem space, gather requirements, and define success criteria
---

# Requirements & Problem Understanding

## Problem Statement
**What problem are we solving?**

- **Core Problem:** Discord server administrators and members need a way to track attendance of users who are present in voice channels. Currently, there is no automated way to record who is in voice channels at any given time, making it difficult to track participation, attendance for events, or monitor voice channel activity.
- **Who is affected:** 
  - Discord server administrators who need to track attendance
  - Server members who want to check their own attendance history
  - Event organizers who need attendance records for meetings or activities
  - Users who want to see who was present in voice channels on specific dates
- **Current situation:** There is no way to automatically record or query attendance information. Administrators must manually track attendance or have no record of voice channel participation.

## Goals & Objectives
**What do we want to achieve?**

- **Primary goals:**
  1. Implement `/diemdanh` slash command to take attendance of all users currently in voice channels
  2. Store attendance records with timestamp, user IDs, and voice channel information
  3. Display attendance information in the `/status` command alongside existing user information
  4. Implement `/checkdd [date]` command to check attendance records for a specific date
  5. Support querying attendance by date (today, specific date)
  6. Store attendance data persistently in the database

- **Secondary goals:**
  - Display attendance statistics (total days attended, last attendance date)
  - Show which voice channels users were in during attendance
  - Display attendance history in an embed format for better readability
  - Future enhancement: Support filtering attendance by voice channel in `/checkdd` command
  - Future enhancement: Support querying attendance by date range

- **Non-goals:**
  - Automatic attendance tracking (must be manually triggered via command)
  - Attendance reminders or notifications (out of scope)
  - Integration with external calendar systems (out of scope)
  - Attendance analytics or reporting dashboards (out of scope for MVP)
  - Tracking attendance in text channels (voice channels only)
  - Tracking attendance duration (only presence, not time spent)

## User Stories & Use Cases
**How will users interact with the solution?**

- **US1:** As a Discord server administrator, I want to run `/diemdanh` to record attendance of all users currently in voice channels so that I can track who is present.
- **US2:** As a Discord user, I want to check my attendance history using `/status` so that I can see my attendance records.
- **US3:** As a Discord user, I want to check attendance for a specific date using `/checkdd [date]` so that I can see who was present on that date.
- **US4:** As a Discord server administrator, I want to see attendance records for a specific date so that I can verify who attended an event or meeting.
- **US5:** As a Discord user, I want to see my attendance statistics (total days, last attendance) so that I can track my participation.

**Key workflows:**
1. Administrator executes `/diemdanh` → Bot records all users in voice channels → Bot confirms attendance taken
2. User executes `/status` → Bot displays user status including attendance information
3. User executes `/checkdd [date]` → Bot displays attendance records for that date
4. User executes `/checkdd` (no date) → Bot displays today's attendance records

**Edge cases to consider:**
- No users in voice channels → Show message: "No users are currently in voice channels."
- User not in any voice channel → Not included in attendance record
- Multiple voice channels with users → Record all users from all voice channels
- Bot cannot access voice state information → Error: "Unable to access voice channel information."
- Invalid date format → Error: "Invalid date format. Please use YYYY-MM-DD format."
- No attendance records for date → Show message: "No attendance records found for [date]."
- Database query fails → Show error message gracefully: "An error occurred while fetching attendance information."
- Bot lacks required permissions → Error: "Bot does not have permission to view voice channels."

## Success Criteria
**How will we know when we're done?**

- **Measurable outcomes:**
  - `/diemdanh` command responds within 3 seconds
  - Attendance records are stored correctly in database
  - `/status` command displays attendance information accurately
  - `/checkdd` command displays attendance records for specified date
  - Commands handle edge cases gracefully

- **Acceptance criteria:**
  1. `/diemdanh` command works and records all users in voice channels
  2. Attendance records include: user ID, guild ID, voice channel ID, timestamp, date
  3. `/status` command displays attendance information (total days, last attendance date)
  4. `/checkdd [date]` command works with date parameter (YYYY-MM-DD format)
  5. `/checkdd` command works without date parameter (defaults to today)
  6. Attendance records are stored persistently in database
  7. Commands handle errors gracefully with user-friendly messages
  8. Bot can detect users in all voice channels in the guild

- **Performance benchmarks:**
  - Command response time: < 3 seconds for `/diemdanh`
  - Command response time: < 2 seconds for `/checkdd`
  - Database queries: Optimized with proper indexes
  - Voice state detection: < 1 second

## Constraints & Assumptions
**What limitations do we need to work within?**

- **Technical constraints:**
  - Must use existing database schema (add new Attendance table)
  - Must use Discord.js v14+ for voice state detection
  - Must use Prisma for database operations
  - Bot must have `GUILD_VOICE_STATES` intent enabled
  - Bot must have permission to view voice channels
  - Must follow existing command structure pattern

- **Business constraints:**
  - Should not expose sensitive information
  - Should respect user privacy (ephemeral responses for personal data)
  - Should be consistent with existing bot commands
  - Attendance is per-guild (guild-specific records)

- **Time/budget constraints:**
  - Should be implemented efficiently
  - No external API dependencies
  - Use existing infrastructure

- **Assumptions:**
  - Users have read access to the server
  - Bot has necessary permissions to view voice channels
  - Database can handle attendance records (reasonable volume)
  - Voice channel state is accessible via Discord API
  - Users understand date format (YYYY-MM-DD)
  - Attendance is taken manually (not automatic)

## Questions & Open Items
**What do we still need to clarify?**

- ~~Should attendance be taken automatically or manually?~~ **Resolved:** Manual via `/diemdanh` command
- ~~Should we track attendance duration or just presence?~~ **Resolved:** Just presence (in/out), not duration
- ~~Should attendance be per-guild or global?~~ **Resolved:** Per-guild (guild-specific records)
- ~~What date format should we use?~~ **Resolved:** YYYY-MM-DD (ISO format)
- ~~Should we allow deleting attendance records?~~ **Resolved:** Not in MVP, can add later if needed
- ~~Should we track which specific voice channel users were in?~~ **Resolved:** Yes, store voice channel ID
- ~~Should bots be included in attendance?~~ **Resolved:** No, bots are excluded from attendance records by default
- ~~Should `/checkdd` be public or ephemeral?~~ **Resolved:** Public response for transparency and admin verification
- ~~What timezone should be used for dates?~~ **Resolved:** UTC for consistency across servers

## Error Messages
**Specific error messages for invalid scenarios:**

- **No users in voice channels:** "No users are currently in voice channels."
- **Bot cannot access voice channels:** "Unable to access voice channel information. Please ensure the bot has permission to view voice channels."
- **Invalid date format:** "Invalid date format. Please use YYYY-MM-DD format (e.g., 2024-01-15)."
- **No attendance records:** "No attendance records found for [date]."
- **Database error:** "An error occurred while fetching attendance information. Please try again later."
- **Missing permissions:** "Bot does not have permission to view voice channels."
- **Future date:** "Cannot check attendance for a future date."

## Resolved Decisions
**Decisions made during requirements gathering:**

1. **Command Format:** 
   - `/diemdanh` - no parameters, takes attendance of all users in voice channels
   - `/checkdd [date]` - optional date parameter (YYYY-MM-DD), defaults to today if not provided
   - `/status` - displays attendance info alongside existing status information

2. **Response Format:** 
   - `/diemdanh`: Confirmation message with count of users recorded
   - `/checkdd`: Embed with list of users who attended on specified date
   - `/status`: Embed with attendance statistics (total days, last attendance date)

3. **Privacy:** 
   - `/diemdanh`: Public response (shows count, not individual users)
   - `/checkdd`: Public response (for transparency and admin verification)
   - `/status`: Ephemeral responses (private, only visible to command user)

4. **Data Scope:** 
   - Store: user ID, guild ID, voice channel ID, timestamp, date
   - Track: presence in voice channels (not duration)
   - Per-guild: Attendance records are guild-specific

5. **Performance:** 
   - Real-time database queries (no caching needed for MVP)
   - Optimize with database indexes on date, user ID, guild ID

6. **Voice Channel Detection:**
   - Use Discord.js `GuildVoiceStates` to detect users in voice channels
   - Record all users from all voice channels in the guild
   - Exclude bots from attendance (default: bots are excluded from attendance records)

7. **Date Handling:**
   - Store date as separate field (YYYY-MM-DD) for easy querying
   - Use UTC for date storage and queries (consistent across servers)
   - Default to today (UTC) if no date provided in `/checkdd`


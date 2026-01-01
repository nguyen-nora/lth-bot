---
phase: implementation
title: Implementation Guide
description: Technical implementation notes, patterns, and code guidelines
---

# Implementation Guide

## Development Setup
**How do we get started?**

- **Prerequisites:**
  - Existing bot infrastructure (from bot-foundation feature)
  - Prisma client configured and connected
  - Discord.js v14+ installed
  - Existing command handler system
  - Existing status service (for integration)

- **Environment setup:**
  - No additional environment variables needed
  - Use existing database connection
  - Use existing command handler system
  - **IMPORTANT**: Enable `GUILD_VOICE_STATES` intent in Discord Developer Portal

- **Configuration:**
  - Update bot client intents in `src/index.ts`
  - Add `GatewayIntentBits.GuildVoiceStates` to intents array
  - Verify intent is enabled in Discord Developer Portal

## Code Structure
**How is the code organized?**

**Directory structure:**
```
src/
├── commands/
│   ├── diemdanh.ts       # DiemDanh command handler
│   ├── checkdd.ts        # CheckDD command handler
│   └── status.ts         # Status command (modified)
├── services/
│   ├── attendanceService.ts  # Attendance service (new)
│   └── statusService.ts      # Status service (modified)
prisma/
├── schema.prisma         # Updated with Attendance model
└── migrations/
    └── [timestamp]_add_attendance/
        └── migration.sql
```

**Module organization:**
- `src/commands/diemdanh.ts`: Command handler for taking attendance
- `src/commands/checkdd.ts`: Command handler for checking attendance
- `src/services/attendanceService.ts`: Business logic for attendance operations
- `src/services/statusService.ts`: Extended to include attendance statistics

**Naming conventions:**
- Service class: `AttendanceService`
- Command files: `diemdanh.ts`, `checkdd.ts`
- Interfaces: `Attendance`, `AttendanceStats`, `AttendanceRecord`
- Methods: `recordAttendance()`, `getAttendanceByDate()`, `getUserAttendanceStats()`

## Implementation Notes
**Key technical details to remember:**

### Core Features

**1. Database Schema (Prisma)**
- **Implementation approach:**
  - Add `Attendance` model to `prisma/schema.prisma`
  - Fields: `id`, `userId`, `guildId`, `channelId`, `recordedAt`, `date`
  - Indexes: `[userId, guildId, date]`, `[guildId, date]`, `[date]`
  - Run migration: `npx prisma migrate dev --name add_attendance`

**2. Attendance Service (`src/services/attendanceService.ts`)**
- **Implementation approach:**
  - Create `AttendanceService` class as singleton
  - Define TypeScript interfaces:
    ```typescript
    interface AttendanceRecord {
      userId: string;
      channelId: string;
      channelName: string;
      recordedAt: Date;
    }
    
    interface AttendanceStats {
      totalDays: number;
      lastAttendanceDate: Date | null;
    }
    ```
  - Implement `recordAttendance()`:
    - Accept `guildId` and `Map<string, string>` (userId -> channelId)
    - Get current date in YYYY-MM-DD format
    - Batch insert using Prisma `createMany()`
    - Return count of records created
  - Implement `getAttendanceByDate()`:
    - Query database for matching `guildId` and `date`
    - Group by user (deduplicate if in multiple channels)
    - Fetch channel names for display
    - Return array of `AttendanceRecord`
  - Implement `getUserAttendanceStats()`:
    - Count distinct dates for user in guild
    - Get most recent attendance date
    - Return `AttendanceStats` object

**3. DiemDanh Command (`src/commands/diemdanh.ts`)**
- **Implementation approach:**
  - Create slash command with name `diemdanh`
  - In `execute()`:
    - Get guild from interaction
    - Access `guild.voiceStates.cache` to get all voice states
    - Filter for users actually in channels (not null channel)
    - Optionally filter out bots
    - Create map of userId -> channelId
    - Call `attendanceService.recordAttendance()`
    - Return confirmation message with count
  - Error handling:
    - No users: "No users are currently in voice channels."
    - Permission error: Check and handle gracefully
    - Database error: Generic error message

**4. CheckDD Command (`src/commands/checkdd.ts`)**
- **Implementation approach:**
  - Create slash command with optional `date` parameter (string)
  - In `execute()`:
    - Get date parameter or default to today
    - Validate date format (YYYY-MM-DD) using regex or Date parsing
    - Validate date is not in future
    - Call `attendanceService.getAttendanceByDate()`
    - Format results as embed:
      - Title: "Attendance for [date]"
      - Fields: List of users (grouped or individual)
      - Footer: Total count
    - Return embed
  - Error handling:
    - Invalid date format: "Invalid date format. Please use YYYY-MM-DD format."
    - Future date: "Cannot check attendance for a future date."
    - No records: "No attendance records found for [date]."

**5. Status Service Extension (`src/services/statusService.ts`)**
- **Implementation approach:**
  - Import `attendanceService`
  - Extend `UserStatus` interface:
    ```typescript
    attendance: {
      totalDays: number;
      lastAttendanceDate: Date | null;
    } | null;
    ```
  - In `getUserStatus()`:
    - Call `attendanceService.getUserAttendanceStats()`
    - Add attendance stats to returned status object
  - In `formatStatusEmbed()`:
    - Add attendance fields if data exists:
      - "📅 Total Days Attended: X"
      - "📅 Last Attendance: [date]" or "Never"
    - Handle null gracefully (show "No attendance records")

**6. Bot Intent Update (`src/index.ts`)**
- **Implementation approach:**
  - Update client initialization:
    ```typescript
    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates, // Add this
      ],
    });
    ```
  - Document requirement in README

### Patterns & Best Practices

**1. Service Layer Pattern**
- Business logic in service, command handlers are thin
- Service methods are async and return typed data
- Service handles all database queries

**2. Batch Operations**
- Use Prisma `createMany()` for batch inserts
- More efficient than individual inserts
- Handle errors gracefully

**3. Date Handling**
- Store date as string (YYYY-MM-DD) for easy querying
- Use `new Date().toISOString().split('T')[0]` to get current date
- Validate date format with regex: `/^\d{4}-\d{2}-\d{2}$/`
- Parse dates carefully to handle timezones

**4. Voice State Detection**
- Use `guild.voiceStates.cache` to get all voice states
- Filter for non-null `channelId` to get users in channels
- Handle edge cases (users leaving during command execution)

**5. Error Handling**
- Try-catch blocks in command handlers
- Graceful error messages for users
- Log errors for debugging
- Validate inputs before processing

## Integration Points
**How do pieces connect?**

**1. Database Integration (Prisma)**
- Use existing Prisma client from `src/database/prisma.js`
- Create `Attendance` model in schema
- Run migration to create table
- Use Prisma queries for all database operations

**2. Discord.js Integration**
- Use `ChatInputCommandInteraction` for command handling
- Use `EmbedBuilder` for embed formatting
- Use `GuildVoiceStates` for voice state detection
- Use `guild.voiceStates.cache` to access voice states

**3. Command Handler Integration**
- Follow existing command structure pattern
- Export default object with `data` and `execute`
- Commands will be auto-loaded by `loadCommands()` utility

**4. Status Service Integration**
- Import `attendanceService` in status service
- Call attendance methods alongside existing queries
- Extend existing interfaces and methods

## Error Handling
**How do we handle failures?**

**Error handling strategy:**
- **Database errors**: Catch Prisma errors, log, return user-friendly message
- **Voice state errors**: Check permissions, handle missing voice states gracefully
- **Date validation errors**: Validate format before processing, return clear error
- **Missing data**: Handle null/undefined gracefully, show appropriate messages

**Logging approach:**
- Log errors with context (user ID, guild ID, error message)
- Use console.error for errors
- Don't log sensitive information
- Log voice state detection issues for debugging

**Retry/fallback mechanisms:**
- No retries needed (write operations should succeed or fail clearly)
- Fallback to empty results for missing data
- Show error message if critical failure

## Performance Considerations
**How do we keep it fast?**

**Optimization strategies:**
- Use database indexes (defined in schema)
- Use batch insert for multiple users
- Use `count()` and `distinct` for statistics
- Query only necessary data

**Caching approach:**
- No caching for MVP (real-time data preferred)
- Can add caching later if needed for statistics

**Query optimization:**
- Use Prisma's `createMany()` for batch inserts
- Use indexes on `[userId, guildId, date]` for user stats
- Use indexes on `[guildId, date]` for date queries
- Use `distinct` for counting unique days

**Resource management:**
- No special resource management needed
- Prisma handles connection pooling
- Voice state cache is managed by Discord.js

## Security Notes
**What security measures are in place?**

**Authentication/authorization:**
- Discord handles authentication (user must be in server)
- No additional auth needed (read/write operations are guild-scoped)
- Consider restricting `/diemdanh` to admins only (optional)

**Input validation:**
- Validate date format (YYYY-MM-DD)
- Validate date is not in future
- Validate user is in server (for status command)
- Handle invalid input gracefully

**Data encryption:**
- No sensitive data stored or transmitted
- All data is public (attendance info)
- Guild-specific data isolation

**Secrets management:**
- No new secrets needed
- Use existing environment variables

**Bot Permissions:**
- `VIEW_CHANNELS` - To see voice channels
- `GUILD_VOICE_STATES` intent - Required for voice state detection

## Voice State Detection Details
**How to detect users in voice channels:**

```typescript
// Get all voice states in guild
const voiceStates = guild.voiceStates.cache;

// Filter for users actually in channels
const usersInChannels = new Map<string, string>();
for (const [userId, voiceState] of voiceStates) {
  if (voiceState.channelId) {
    // User is in a voice channel
    usersInChannels.set(userId, voiceState.channelId);
    
    // Optional: Filter out bots
    // const member = await guild.members.fetch(userId);
    // if (member && !member.user.bot) {
    //   usersInChannels.set(userId, voiceState.channelId);
    // }
  }
}
```

**Important considerations:**
- `voiceStates.cache` may not be fully populated on startup
- Users may leave channels during command execution
- Bots may be in channels (decide whether to include them)
- Users can be in only one channel at a time (no deduplication needed per user)

## Date Handling Details
**How to handle dates:**

```typescript
// Get current date in YYYY-MM-DD format
function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

// Validate date format
function isValidDateFormat(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

// Validate date is not in future
function isNotFutureDate(date: string): boolean {
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate <= today;
}

// Parse date with validation
function parseDate(dateString: string | null): string {
  if (!dateString) {
    return getCurrentDate(); // Default to today
  }
  
  if (!isValidDateFormat(dateString)) {
    throw new Error('Invalid date format. Please use YYYY-MM-DD format.');
  }
  
  if (!isNotFutureDate(dateString)) {
    throw new Error('Cannot check attendance for a future date.');
  }
  
  return dateString;
}
```


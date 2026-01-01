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
  - Marriage system database schema (from marriage-system feature)
  - Prisma client configured and connected
  - Discord.js v14+ installed

- **Environment setup:**
  - No additional environment variables needed
  - Use existing database connection
  - Use existing command handler system

- **Configuration:**
  - No additional configuration needed

## Code Structure
**How is the code organized?**

**Directory structure:**
```
src/
├── commands/
│   └── status.ts          # Status command handler
├── services/
│   └── statusService.ts   # Status service (business logic)
└── ...
```

**Module organization:**
- `src/commands/status.ts`: Command handler, user interaction
- `src/services/statusService.ts`: Business logic, data aggregation, embed formatting

**Naming conventions:**
- Service class: `StatusService`
- Command file: `status.ts`
- Interface: `UserStatus`
- Methods: `getUserStatus()`, `formatStatusEmbed()`

## Implementation Notes
**Key technical details to remember:**

### Core Features

**1. Status Service (`src/services/statusService.ts`)**
- **Implementation approach:**
  - Create `StatusService` class as singleton
  - Define `UserStatus` interface for type safety
  - Implement `getUserStatus()` to aggregate data:
    - Query marriage: `prisma.marriage.findFirst()` with user filter
    - Query proposals sent: `prisma.proposal.count()` with proposer filter
    - Query proposals received: `prisma.proposal.count()` with proposed filter
    - Query rate limit: `prisma.proposalRateLimit.findUnique()`
  - Implement `formatStatusEmbed()` to create Discord embed:
    - Use `EmbedBuilder` from discord.js
    - Set title with user display name
    - Add fields for marriage info and proposal stats
    - Set color to match marriage theme (0xff69b4)
    - Add footer with server name

**2. Status Command (`src/commands/status.ts`)**
- **Implementation approach:**
  - Create slash command with optional user parameter
  - Default to interaction user if no parameter provided
  - Validate user parameter (must be valid Discord user)
  - Fetch Discord user object for display (avatar, display name)
  - Call `statusService.getUserStatus()`
  - Call `statusService.formatStatusEmbed()`
  - Send ephemeral response with embed

### Patterns & Best Practices

**1. Service Layer Pattern**
- Business logic in service, command handler is thin
- Service methods are async and return typed data
- Service handles all database queries

**2. Error Handling**
- Try-catch blocks in command handler
- Graceful error messages for users
- Log errors for debugging

**3. Type Safety**
- Use TypeScript interfaces for data structures
- Type all function parameters and return values
- Use Prisma types where possible

**4. Embed Formatting**
- Use consistent embed structure
- Set appropriate colors (pink for marriage theme)
- Format dates in user-friendly way
- Handle null/undefined values gracefully

## Integration Points
**How do pieces connect?**

**1. Database Integration (Prisma)**
- Use existing Prisma client from `src/database/prisma.js`
- Query `marriage` table for marriage data
- Query `proposal` table for proposal statistics
- Query `proposalRateLimit` table for rate limit status

**2. Discord.js Integration**
- Use `ChatInputCommandInteraction` for command handling
- Use `EmbedBuilder` for embed formatting
- Use `User` object for display information
- Use ephemeral responses for privacy

**3. Command Handler Integration**
- Follow existing command structure pattern
- Export default object with `data` and `execute`
- Command will be auto-loaded by `loadCommands()` utility

## Error Handling
**How do we handle failures?**

**Error handling strategy:**
- **Database errors**: Catch Prisma errors, log, return user-friendly message
- **User validation errors**: Check if user exists, handle invalid user parameter
- **Missing data**: Handle null/undefined gracefully, show "N/A" or "None"
- **Discord API errors**: Catch API errors, log, return error message

**Logging approach:**
- Log errors with context (user ID, guild ID, error message)
- Use console.error for errors
- Don't log sensitive information

**Retry/fallback mechanisms:**
- No retries needed (read-only operations)
- Fallback to "N/A" for missing data
- Show error message if critical failure

## Performance Considerations
**How do we keep it fast?**

**Optimization strategies:**
- Use database indexes (already exist for marriages and proposals)
- Use `count()` instead of fetching all records
- Query only necessary data (no over-fetching)

**Caching approach:**
- No caching for MVP (real-time data preferred)
- Can add caching later if needed

**Query optimization:**
- Use Prisma's `findFirst()` with proper filters
- Use `count()` for statistics (more efficient than fetching all)
- Use indexes on `userId`, `guildId`, `proposerId`, `proposedId`

**Resource management:**
- No special resource management needed
- Prisma handles connection pooling

## Security Notes
**What security measures are in place?**

**Authentication/authorization:**
- Discord handles authentication (user must be in server)
- No additional auth needed (read-only operation)

**Input validation:**
- Validate user parameter (must be valid Discord user)
- Check user is in server (for @user parameter)
- Handle invalid input gracefully

**Data encryption:**
- No sensitive data stored or transmitted
- All data is public (marriage/proposal info)

**Secrets management:**
- No new secrets needed
- Use existing environment variables


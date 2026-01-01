---
phase: implementation
title: Implementation Guide
description: Technical implementation notes, patterns, and code guidelines
---

# Implementation Guide

## Development Setup
**How do we get started?**

**Prerequisites and dependencies:**
- Existing bot infrastructure (from bot-foundation feature)
- Discord.js v14 with button support
- better-sqlite3 database
- Bot with required permissions (Send Messages, Send DMs, Create Channels)

**Environment setup steps:**
1. Ensure bot is running and connected
2. Test bot has required permissions in test server
3. Create test users for testing proposals
4. No additional environment variables needed

**Configuration needed:**
- Bot permissions in Discord server:
  - Send Messages
  - Send DMs
  - Create Channels
  - Manage Channels (for notification channel)
- No additional config files needed

## Code Structure
**How is the code organized?**

**Directory structure:**
```
src/
├── commands/
│   ├── kethon.ts          # /kethon command
│   └── divorce.ts         # /divorce command
├── services/
│   ├── marriageService.ts # Core marriage logic
│   └── channelManager.ts  # Channel management
├── database/
│   ├── migrations/
│   │   └── marriage.ts    # Database schema
│   └── db.ts              # Existing database connection
├── events/
│   └── interactionCreate.ts # Extended for button handling
└── utils/
    └── ...                # Existing utilities
```

**Module organization:**
- **Commands**: Slash command implementations
- **Services**: Business logic separated from commands
- **Database**: Schema and migrations
- **Events**: Extended interaction handler

**Naming conventions:**
- Commands: `kethon.ts`, `divorce.ts`
- Services: `marriageService.ts`, `channelManager.ts`
- Database tables: `marriages`, `proposals`, `notification_channels`
- Button custom IDs: `proposal_accept_{proposalId}`, `proposal_decline_{proposalId}`

## Implementation Notes
**Key technical details to remember:**

### Core Features

**Feature 1: Database Schema**
- Use migrations pattern (separate file for schema)
- Create tables with proper indexes
- Use prepared statements for all queries
- Transaction support for atomic operations

**Feature 2: Marriage Service**
- Singleton pattern (similar to database manager)
- Methods handle all business logic
- Database operations abstracted
- State management for proposals

**Feature 3: Kethon Command**
- User option type for @user mention
- Validation before creating proposal
- Error messages for invalid cases
- Create proposal and send DMs

**Feature 4: Button Interactions**
- Custom IDs include proposal ID
- Parse custom ID to get proposal
- Update proposal state atomically
- Handle both users' responses

**Feature 5: Channel Manager**
- Check if channel exists first
- Create channel with proper permissions
- Save channel ID to database
- Handle channel deletion gracefully

**Feature 6: Divorce Command**
- Check if user is married
- Support unilateral divorce
- Optional: Mutual consent flow (both confirm)
- Silent operation (no announcements)

### Patterns & Best Practices

**Design patterns being used:**
- **Service Layer**: Business logic in services, not commands
- **Repository Pattern**: Database operations in service
- **Singleton**: Services are singletons
- **State Machine**: Proposal states (pending → accepted/declined)

**Code style guidelines:**
- Use TypeScript strict mode
- Async/await for all async operations
- Error handling with try-catch
- JSDoc comments for public methods
- Consistent error messages

**Common utilities/helpers:**
- Proposal ID generation (UUID or timestamp-based)
- User mention formatting
- Embed message builders
- Error message formatters

## Integration Points
**How do pieces connect?**

**API integration details:**
- **Discord API**: Via discord.js
  - Slash commands: `ChatInputCommandInteraction`
  - Button interactions: `ButtonInteraction`
  - DMs: `user.send()` or `user.createDM()`
  - Channels: `guild.channels.create()`

**Database connections:**
- Use existing `db` singleton from `src/database/db.ts`
- All queries use prepared statements
- Transactions for multi-step operations

**Third-party service setup:**
- No external services beyond Discord API

## Error Handling
**How do we handle failures?**

**Error handling strategy:**
- **DM failures**: Catch error, send message in channel instead
- **Permission errors**: Check permissions first, clear error messages
- **Database errors**: Transaction rollback, log error, user-friendly message
- **Channel errors**: Fallback to command channel if notification channel missing
- **Button expiration**: Handle expired interactions gracefully

**Logging approach:**
- Log all errors with context
- Log proposal state changes
- Log marriage creation/divorce
- Use console.error for errors, console.log for info

**Retry/fallback mechanisms:**
- No retries for user actions (would be confusing)
- Fallback to command channel if notification channel fails
- Graceful degradation (feature works partially if some permissions missing)

## Performance Considerations
**How do we keep it fast?**

**Optimization strategies:**
- Database indexes on user_id and guild_id
- Prepared statements for all queries
- Batch operations where possible
- Cache notification channel IDs (in-memory, with DB fallback)

**Caching approach:**
- Cache notification channel IDs per guild (optional optimization)
- Invalidate cache on channel deletion

**Query optimization:**
- Use indexes for lookups
- Avoid N+1 queries
- Use transactions for related operations
- Clean up expired proposals periodically

**Resource management:**
- Close database connections properly (handled by singleton)
- No connection pooling needed (SQLite single connection)

## Security Notes
**What security measures are in place?**

**Authentication/authorization:**
- Discord handles user authentication
- Bot validates user exists and is in server
- No additional auth needed

**Input validation:**
- Validate user mentions (not self, not bot)
- Validate user is not already married
- Validate proposal doesn't already exist
- SQL injection prevention (prepared statements)

**Data encryption:**
- No sensitive data stored (just user IDs and timestamps)
- Database file permissions (read/write for bot only)

**Secrets management:**
- No additional secrets needed
- Use existing environment variable setup


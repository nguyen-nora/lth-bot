---
phase: implementation
title: Implementation Guide
description: Technical implementation notes, patterns, and code guidelines
---

# Implementation Guide

## Development Setup
**How do we get started?**

**Prerequisites and dependencies:**
- Existing Discord bot setup with Discord.js v14
- .env file with DISCORD_TOKEN (SUPER_ADMIN is optional but recommended)
- TypeScript development environment
- Access to Discord test server with roles having Administrator permission

**Environment setup steps:**
1. Ensure .env file exists in project root
2. Add `SUPER_ADMIN=<discord_user_id>` to .env (optional, but recommended)
3. Configure Discord roles in test server:
   - Grant Administrator permission to appropriate roles for ADMIN tier testing
   - Any user without Administrator permission will have USER tier
4. Grant bot "View Server Members" permission to check user permissions

**Configuration needed:**
- `.env`: Add `SUPER_ADMIN=<user_id>` (optional)
- Discord roles: Grant Administrator permission to roles that should have ADMIN tier

## Code Structure
**How is the code organized?**

**Directory structure:**
```
src/
  services/
    permissionService.ts  ✅ CREATED
  config/
    env.ts  ✅ MODIFIED - added getSuperAdminId()
  commands/
    *.ts  (No changes needed - permissions checked centrally)
  events/
    interactionCreate.ts  ✅ MODIFIED - added permission checks
  utils/
    loadCommands.ts  (No changes needed)
```

**Module organization:**
- `permissionService.ts`: Central permission logic (singleton pattern)
- `env.ts`: Environment variable access
- Commands: No changes needed (permission check happens in interaction handler)
- `interactionCreate.ts`: Permission check application point

**Naming conventions:**
- Permission tiers: `PermissionTier` enum (UPPER_SNAKE_CASE values)
- Service: `PermissionService` class
- Functions: `camelCase` (e.g., `getUserTier`, `hasPermission`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `COMMAND_PERMISSIONS`)

## Implementation Notes
**Key technical details to remember:**

### Core Features

**1. Permission Service (`src/services/permissionService.ts`)** ✅ IMPLEMENTED
- ✅ Created enum for permission tiers: `SUPER_ADMIN`, `ADMIN`, `USER`, `NONE`
- ✅ Implemented hierarchical checking: SUPER_ADMIN > ADMIN > USER > NONE
- ✅ Check SUPER_ADMIN first (fast, synchronous env lookup)
- ✅ Check Discord Administrator permission flag (async, requires member fetch)
- ✅ Default to USER tier for all users without Administrator permission
- ✅ Graceful error handling for member fetch failures
- ✅ Singleton pattern for consistency

**2. Environment Configuration (`src/config/env.ts`)** ✅ IMPLEMENTED
- ✅ Added `getSuperAdminId()` function
- ✅ Reads from `process.env.SUPER_ADMIN`
- ✅ Returns null if not set (graceful handling)
- ✅ Trims whitespace from value

**3. Command Permission Integration** ✅ IMPLEMENTED
- ✅ Central check in `interactionCreate.ts` (chosen approach)
- ✅ Permission check before command execution
- ✅ Hardcoded mapping `COMMAND_PERMISSIONS` for required tier
- ✅ Commands categorized:
  - ADMIN: `/diemdanh`, `/checkdd`, `/ping`
  - USER: `/kethon`, `/lyhon`, `/status`
- ✅ Default to USER tier if command not in mapping (fail-safe)

**4. Error Handling** ✅ IMPLEMENTED
- ✅ Permission check wrapped in try-catch
- ✅ User-friendly error messages (no internal details exposed)
- ✅ Special handling for DM context (clear error message)
- ✅ Audit logging for permission denials (includes user ID, command, tier, guild)
- ✅ Fail-safe: deny access on permission check errors (better safe than sorry)
- ✅ Handles member fetch failures gracefully (returns NONE tier)

### Patterns & Best Practices

**1. Fail-Fast Pattern:**
- ✅ Check permissions before any command logic
- ✅ Return error immediately if permission denied
- ✅ Don't waste resources on unauthorized requests

**2. Hierarchical Permissions:**
- ✅ Higher tiers automatically have lower tier access
- ✅ `hasPermission(user, guild, ADMIN)` returns true for SUPER_ADMIN
- ✅ Simplifies permission logic

**3. Graceful Degradation:**
- ✅ If permission check fails (API error), deny access (fail-safe)
- ✅ If SUPER_ADMIN not set, continue with permission-based checks only
- ✅ Log warnings/errors for debugging

**4. Error Messages:**
- ✅ User-friendly messages: "You do not have permission to use this command."
- ✅ Don't leak internal details (tier names, role names)
- ✅ Consistent error format across all commands
- ✅ Special message for DM context

## Integration Points
**How do pieces connect?**

**1. Permission Service → Environment Config:**
- `permissionService.ts` imports `getSuperAdminId()` from `env.ts`
- Reads SUPER_ADMIN on each check (or caches on startup)

**2. Permission Service → Discord.js:**
- Uses `guild.members.fetch()` to get member
- Uses `member.permissions.has(PermissionsBitField.Flags.Administrator)` to check permission
- Handles missing guild (DM context) gracefully

**3. Interaction Handler → Permission Service:**
- `interactionCreate.ts` imports `permissionService` and `PermissionTier`
- Calls `hasPermission()` before `command.execute()`
- Handles permission denied errors with user-friendly messages

**4. Commands → Permission System:**
- Commands don't need to import permission service directly
- Permission check happens in interaction handler
- Commands can assume they're only called if permission granted

## Error Handling
**How do we handle failures?**

**Error handling strategy:**
- **Missing SUPER_ADMIN in .env**: Log nothing (optional feature), continue with permission-based checks
- **Discord API error (can't fetch member)**: Log error, return NONE tier (deny access)
- **Missing guild (DM context)**: Return NONE tier, show clear error message
- **Bot lacks permissions**: Log error, return NONE tier (deny access)
- **Invalid user ID**: Handled by Discord.js (will throw error, caught and logged)
- **Permission check throws error**: Catch, log, deny access (fail-safe)

**Logging approach:**
- Log permission denials at INFO level (for auditing)
  - Includes: user ID, username, command name, required tier, guild ID
- Log configuration issues at WARN level (none currently)
- Log API errors at ERROR level
- Include context (user ID, guild ID, command name) in logs

**Retry/fallback mechanisms:**
- No retries for permission checks (fail fast)
- Fallback to NONE tier if permission check fails (deny access)
- Fallback to permission-based only if SUPER_ADMIN not configured

## Performance Considerations
**How do we keep it fast?**

**Optimization strategies:**
- ✅ Check SUPER_ADMIN first (synchronous, <1ms)
- ✅ Only check permissions if not SUPER_ADMIN
- ✅ Use Discord.js member cache when available
- ✅ No role name matching overhead (uses built-in permission flags)

**Caching approach:**
- Permission results: Don't cache (roles can change, keep fresh)
- Member data: Discord.js caches, but may need to fetch on first check
- SUPER_ADMIN: Read from env each time (fast, no caching needed)

**Query optimization:**
- Use `member.permissions.has()` (cached permission check)
- Only fetch member if not already cached
- Check SUPER_ADMIN before any async operations

**Resource management:**
- Permission checks are lightweight (no database queries)
- Permission checks use Discord.js cache when available
- No additional memory overhead beyond service instance

## Security Notes
**What security measures are in place?**

**Authentication/authorization:**
- ✅ Permission checks happen server-side (client cannot bypass)
- ✅ SUPER_ADMIN validated against .env (not user-provided)
- ✅ Permission checks use Discord API (trusted source)
- ✅ Fail-safe: deny access on errors

**Input validation:**
- ✅ User ID validated (Discord format, handled by Discord.js)
- ✅ Guild validated (exists, bot has access)
- ✅ Permission tier validated (enum values only)

**Data encryption:**
- SUPER_ADMIN in .env (should be in .gitignore)
- No sensitive data stored or transmitted

**Secrets management:**
- SUPER_ADMIN stored in .env (not in code)
- .env should be in .gitignore
- Consider using environment variables in production (not .env file)

## Testing Checklist
**What needs to be tested?**

**Manual Testing:**
- [ ] SUPER_ADMIN can execute all commands (ADMIN and USER tier)
- [ ] User with Administrator permission can execute ADMIN commands
- [ ] User with Administrator permission can execute USER commands
- [ ] User without Administrator permission can execute USER commands
- [ ] User without Administrator permission cannot execute ADMIN commands
- [ ] Permission denied error message is clear and user-friendly
- [ ] DM context: SUPER_ADMIN can execute commands
- [ ] DM context: Regular users get error message
- [ ] Bot lacks "View Server Members" permission: appropriate error handling
- [ ] User leaves server: permission check handles gracefully

**Edge Cases:**
- [ ] Missing SUPER_ADMIN in .env: system continues normally
- [ ] Multiple roles with Administrator permission: works correctly
- [ ] Permission check API error: access denied (fail-safe)
- [ ] Member fetch timeout: access denied (fail-safe)

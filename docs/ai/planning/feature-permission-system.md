---
phase: planning
title: Project Planning & Task Breakdown
description: Break down work into actionable tasks and estimate timeline
---

# Project Planning & Task Breakdown

## Milestones
**What are the major checkpoints?**

- [x] Milestone 1: Permission service created and tested ✅
- [x] Milestone 2: All commands updated with permission checks ✅
- [ ] Milestone 3: Testing and validation complete (requires manual testing)

## Task Breakdown
**What specific work needs to be done?**

### Phase 1: Foundation - Permission Service
- [x] Task 1.1: Create `src/services/permissionService.ts` with core permission logic ✅
  - ✅ Implement `PermissionTier` enum
  - ✅ Implement `isSuperAdmin()` method (uses getSuperAdminId from env.ts)
  - ✅ Implement `getUserTier()` method (checks SUPER_ADMIN, then Administrator permission)
  - ✅ Implement `hasPermission()` method (hierarchical check)
  - ✅ Implement `hasAdministratorPermission()` helper (checks Discord permission flag)
- [x] Task 1.2: Update `src/config/env.ts` to add `getSuperAdminId()` function ✅
  - ✅ Read SUPER_ADMIN from .env
  - ✅ Return null if not set (graceful handling)
  - ✅ Trim whitespace
- [x] Task 1.3: Error handling and edge cases ✅
  - ✅ Standardized error messages
  - ✅ Handle edge cases (DM, missing guild, member fetch failures)

### Phase 2: Core Features - Command Updates
- [x] Task 2.1: Categorize all commands by required permission tier ✅
  - ✅ ADMIN tier: `/diemdanh`, `/checkdd`, `/ping`
  - ✅ USER tier: `/kethon`, `/lyhon`, `/status`
  - ✅ Documented in design doc
- [x] Task 2.2: Update `src/events/interactionCreate.ts` to apply permission checks ✅
  - ✅ Added permission check before command execution
  - ✅ Handle permission denied errors with user-friendly messages
  - ✅ Added `COMMAND_PERMISSIONS` mapping
  - ✅ Audit logging for permission denials
  - ✅ Error handling for permission check failures
- [x] Task 2.3: Permission system integrated ✅
  - ✅ Using central permission check in interaction handler
  - ✅ All commands automatically protected
  - ⏳ Manual testing required with different permission levels

### Phase 3: Integration & Polish
- [ ] Task 3.1: Add permission tier to Command interface (optional enhancement - DEFERRED)
  - Can be added later if needed for more dynamic permission management
  - Current implementation using mapping is sufficient
- [x] Task 3.2: Error handling and edge cases ✅
  - ✅ Handle DM context (no guild) - returns NONE tier, clear error message
  - ✅ Handle missing bot permissions (can't fetch member) - returns NONE tier, logs error
  - ✅ Handle user not in server - returns NONE tier on member fetch failure
  - ✅ Handle missing SUPER_ADMIN in .env - returns false for isSuperAdmin, continues normally
  - ✅ Permission check errors wrapped in try-catch with fail-safe deny
- [x] Task 3.3: Documentation and code comments ✅
  - ✅ Documented permission tiers and hierarchy in JSDoc
  - ✅ Added comprehensive JSDoc comments to permission service
  - ✅ Added inline comments explaining permission logic
  - ✅ Updated implementation doc with completion status

## Dependencies
**What needs to happen in what order?**

**Task dependencies:**
- Task 1.1 (Permission Service) must be completed before Task 2.2 (Integration)
- Task 1.2 (Env Config) must be completed before Task 1.1 can use it
- Task 2.1 (Command Categorization) should be done before Task 2.3 (Command Updates)
- All Phase 1 tasks must complete before Phase 2
- All Phase 2 tasks must complete before Phase 3

**External dependencies:**
- Discord.js API for permission checking (Administrator flag)
- .env file with SUPER_ADMIN configured
- Bot must have "View Server Members" permission to check user permissions

**Team/resource dependencies:**
- ✅ Resolved: Using Discord's Administrator permission flag (no role names needed)
- Need to test with actual Discord server and roles with Administrator permission

## Timeline & Estimates
**When will things be done?**

**Estimated effort per task/phase:**
- Phase 1: 2-3 hours
  - Task 1.1: 1-1.5 hours (Permission Service)
  - Task 1.2: 0.5 hours (Env Config)
  - Task 1.3: 0.5-1 hour (Helper/Utility)
- Phase 2: 2-3 hours
  - Task 2.1: 0.5 hours (Categorization)
  - Task 2.2: 1 hour (Interaction Handler)
  - Task 2.3: 1-1.5 hours (Command Updates)
- Phase 3: 1-2 hours
  - Task 3.1: 0.5 hours (Interface Update)
  - Task 3.2: 0.5-1 hour (Error Handling)
  - Task 3.3: 0.5 hours (Documentation)

**Total estimated effort:** 5-8 hours

**Target dates for milestones:**
- Milestone 1: End of Phase 1
- Milestone 2: End of Phase 2
- Milestone 3: End of Phase 3

**Buffer for unknowns:**
- +1-2 hours for testing and debugging
- +0.5 hours for role name configuration decisions

## Risks & Mitigation
**What could go wrong?**

**Technical risks:**
- **Risk**: Discord API rate limits when checking roles
  - **Mitigation**: Cache role checks per user/guild (optional optimization)
- **Risk**: Bot doesn't have permission to read roles
  - **Mitigation**: Graceful error handling, fallback to USER tier or clear error message
- **Risk**: Performance impact from role checks
  - **Mitigation**: Check SUPER_ADMIN first (fast), only check roles if needed
- **Risk**: Bot can't check Administrator permission (missing bot permissions)
  - **Mitigation**: Graceful error handling, clear error message to user

**Resource risks:**
- **Risk**: Unclear which commands should be ADMIN vs USER
  - **Mitigation**: Start with conservative approach (most commands USER, few ADMIN), can adjust
- **Risk**: Server administrators don't understand Administrator permission requirement
  - **Mitigation**: Clear documentation, any role with Administrator permission works

**Dependency risks:**
- **Risk**: Missing SUPER_ADMIN in .env breaks permission system
  - **Mitigation**: Handle gracefully, log warning, continue with role-based permissions only

**Mitigation strategies:**
- Test with multiple permission scenarios before deployment
- Add comprehensive error logging
- Use Discord's built-in Administrator permission (flexible, works with any role)
- Start with minimal permission requirements, can tighten later

## Resources Needed
**What do we need to succeed?**

**Team members and roles:**
- Developer to implement permission service and update commands
- Tester to validate permission checks work correctly
- Server administrator to configure Discord roles for testing

**Tools and services:**
- Discord.js library (already available)
- Discord test server with configured roles
- Development environment with .env file

**Infrastructure:**
- No new infrastructure needed
- Existing bot deployment can be updated

**Documentation/knowledge:**
- Discord.js permission checking API documentation (PermissionsBitField.Flags.Administrator)
- Understanding of existing command structure
- ✅ Permission tier requirements determined: ADMIN (`/diemdanh`, `/checkdd`, `/ping`), USER (`/kethon`, `/lyhon`, `/status`)


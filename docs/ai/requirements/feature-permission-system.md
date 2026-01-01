---
phase: requirements
title: Requirements & Problem Understanding
description: Clarify the problem space, gather requirements, and define success criteria
---

# Requirements & Problem Understanding

## Problem Statement
**What problem are we solving?**

- Currently, all bot commands are accessible to all users without any permission checks
- There's no way to restrict certain commands to administrators or specific user roles
- The bot needs a hierarchical permission system to control access to commands based on user roles
- Server administrators need a way to manage who can use administrative commands

**Who is affected by this problem?**
- Server administrators who need to control bot command access
- Regular users who may accidentally use commands they shouldn't
- Bot maintainers who need to manage permissions centrally

**What is the current situation/workaround?**
- All commands are currently accessible to everyone
- No permission checks exist in any command handlers
- SUPER_ADMIN ID exists in .env but is not being used

## Goals & Objectives
**What do we want to achieve?**

**Primary goals:**
- Implement a three-tier permission system: SUPER_ADMIN, ADMIN, and USER
- SUPER_ADMIN permissions are determined by user ID stored in .env file
- ADMIN permissions are determined by Discord's built-in "Administrator" permission flag (any role with Administrator permission)
- USER tier is the default for all users (anyone without Administrator permission can use USER-tier commands)
- All existing commands must respect the new permission system
- Permission checks should be consistent and easy to apply to commands

**Secondary goals:**
- Create a reusable permission checking utility/service
- Make it easy to add permission requirements to new commands
- Provide clear error messages when users lack required permissions
- Support future expansion of permission tiers if needed

**Non-goals (what's explicitly out of scope):**
- Database storage of permissions (using .env and Discord roles only)
- Per-command permission configuration (using role-based tiers only)
- Permission management commands (can be added in future feature)
- Fine-grained permissions (only three tiers for now)

## User Stories & Use Cases
**How will users interact with the solution?**

- **As a SUPER_ADMIN**, I want to have access to all bot commands regardless of my server roles, so that I can manage the bot across all servers
- **As a server ADMIN** (with Administrator permission in Discord), I want to access administrative commands, so that I can manage server-specific bot features
- **As a regular USER**, I want to access basic commands, so that I can use the bot's core functionality (all users can access USER-tier commands by default)
- **As a user without required permissions**, I want to receive a clear error message, so that I understand why a command failed
- **As a bot developer**, I want to easily add permission checks to commands, so that new commands are secure by default

**Key workflows and scenarios:**
1. User executes a command → Permission service checks their tier → Command executes or returns error
2. SUPER_ADMIN executes any command → Always allowed (regardless of server permissions)
3. ADMIN executes admin-only command → Allowed if they have Administrator permission in the guild
4. USER executes user command → Allowed for all users (default tier)
5. User without Administrator permission executes admin command → Error message displayed
6. Command categorization:
   - ADMIN tier: `/diemdanh`, `/checkdd`, `/ping`
   - USER tier: `/kethon`, `/lyhon`, `/status`

**Edge cases to consider:**
- User is SUPER_ADMIN but also has Administrator permission (SUPER_ADMIN takes precedence)
- User has multiple roles with Administrator permission (any role with Administrator flag grants ADMIN tier)
- User leaves server and loses permissions (permission check should handle gracefully)
- Bot doesn't have permission to check user permissions (fallback behavior - return error or default to USER)
- .env file missing SUPER_ADMIN (should handle gracefully - continue with permission-based checks only)
- Command executed in DM (no guild context - only SUPER_ADMIN can execute, others get error)
- User has Administrator permission but bot can't verify (API error - handle gracefully)

## Success Criteria
**How will we know when we're done?**

**Measurable outcomes:**
- All existing commands have appropriate permission checks
- Permission service correctly identifies SUPER_ADMIN from .env
- Permission service correctly checks Discord Administrator permission flag for ADMIN tier
- USER tier is accessible to all users by default
- Permission checks are applied consistently across all commands
- Command categorization implemented: ADMIN (`/diemdanh`, `/checkdd`, `/ping`) and USER (`/kethon`, `/lyhon`, `/status`)

**Acceptance criteria:**
- SUPER_ADMIN can execute all commands regardless of server permissions
- Users with Administrator permission can execute admin-level commands (`/diemdanh`, `/checkdd`, `/ping`)
- All users (default USER tier) can execute user-level commands (`/kethon`, `/lyhon`, `/status`)
- Users without Administrator permission cannot execute admin commands and receive clear error messages
- Permission checks don't significantly impact command response time (<50ms overhead)
- All commands continue to work as before for authorized users

**Performance benchmarks:**
- Permission check overhead: <50ms per command
- No noticeable delay in command execution for authorized users

## Constraints & Assumptions
**What limitations do we need to work within?**

**Technical constraints:**
- Must work with Discord.js v14
- Must use existing .env configuration for SUPER_ADMIN
- Must use Discord's built-in Administrator permission flag (no custom database tables for permissions)
- Must maintain backward compatibility with existing command structure
- Bot must have "View Server Members" permission to check user permissions

**Business constraints:**
- Should not require database schema changes
- Should not break existing functionality
- Should be easy to configure per server (via Discord role permissions - any role with Administrator permission grants ADMIN tier)

**Time/budget constraints:**
- Implementation should be straightforward and not require major refactoring

**Assumptions we're making:**
- Server administrators will configure Discord role permissions appropriately (granting Administrator permission to appropriate roles)
- SUPER_ADMIN ID in .env is a valid Discord user ID
- Bot has necessary permissions to read server members and check their permissions ("View Server Members" permission)
- Permission tiers are hierarchical (SUPER_ADMIN > ADMIN > USER)
- Any role with Administrator permission flag grants ADMIN tier (more flexible than role name matching)

## Questions & Open Items
**What do we still need to clarify?**

- ✅ **Which commands should require ADMIN tier?** → **RESOLVED**: `/diemdanh`, `/checkdd`, `/ping`
- ✅ **Which commands should require USER tier?** → **RESOLVED**: `/kethon`, `/lyhon`, `/status`
- ✅ **What should be the default permission tier?** → **RESOLVED**: USER tier is default (all users can access)
- ✅ **How should we handle commands in DMs?** → **RESOLVED**: Only SUPER_ADMIN can execute in DMs, others get error (no guild context)
- ✅ **What role names should be used for ADMIN and USER tiers?** → **RESOLVED**: Use Discord's Administrator permission flag (any role with Administrator permission grants ADMIN tier)
- **Should there be a way to bypass permission checks for testing?** (Development mode override - optional enhancement)


---
phase: requirements
title: Requirements & Problem Understanding
description: Clarify the problem space, gather requirements, and define success criteria
---

# Requirements & Problem Understanding

## Problem Statement
**What problem are we solving?**

- **Core Problem:** Discord server members want a fun, interactive marriage system where users can propose to each other, get married, and manage their relationships within the server. Currently, there is no way for users to form and track marriages in the Discord bot.
- **Who is affected:** 
  - Discord server members who want to use the marriage feature
  - Server administrators who want to provide engaging bot features
  - Users who want to manage their relationships (marry, divorce)
- **Current situation:** The bot has no marriage or relationship management functionality. Users cannot propose marriages, accept/decline proposals, or manage existing marriages.

## Goals & Objectives
**What do we want to achieve?**

- **Primary goals:**
  1. Implement `/kethon @user` command to propose marriage between two users
  2. Send private DM to proposer with confirmation message (no buttons needed)
  3. Send private DM to proposed user with accept/decline buttons
  4. Handle proposal acceptance/decline logic (only proposed user needs to accept; proposer already initiated)
  5. Announce successful marriages in the notification channel (auto-created per guild)
  6. Automatically create and manage a notification channel for marriage announcements
  7. Implement divorce functionality (unilateral or mutual consent)
  8. Store marriage data and proposal states in the database

- **Secondary goals:**
  1. Prevent duplicate marriages (users already married)
  2. Prevent self-marriage proposals
  3. Handle edge cases (user leaves server, bot can't DM user, etc.)
  4. Provide clear, specific error messages for invalid operations
  5. Store notification channel ID per guild for future announcements
  6. Implement rate limiting to prevent spam proposals (1 proposal per hour per user)
  7. Clean up expired/declined proposals after 7 days
  8. Handle Discord button expiration (buttons expire after 15 minutes)

- **Non-goals (what's explicitly out of scope):**
  1. Multiple marriages per user (one marriage at a time)
  2. Marriage statistics/leaderboards (future feature)
  3. Marriage ceremonies or additional rituals
  4. Marriage expiration or automatic divorce
  5. Marriage permissions or restrictions based on roles

## User Stories & Use Cases
**How will users interact with the solution?**

- **As a Discord server member**, I want to use `/kethon @user` to propose marriage so that I can ask another user to marry me
- **As a Discord server member**, I want to receive a private DM with accept/decline buttons when someone proposes to me so that I can respond privately
- **As a Discord server member**, I want my marriage announcement to appear in the server channel so that everyone knows about our marriage
- **As a Discord server member**, I want to divorce my partner (unilaterally or mutually) so that I can end the marriage
- **As a Discord server member**, I want to know if my proposal was declined without revealing who declined so that privacy is maintained

**Key workflows and scenarios:**

**Marriage Proposal Flow:**
1. User A executes `/kethon @UserB` in a channel
2. Bot validates proposal (not self, not already married, rate limit check)
3. Bot sends private DM to User A with confirmation message: "You have proposed to @UserB. Waiting for their response..."
4. Bot sends private DM to User B with accept/decline buttons and proposal details
5. User B clicks accept or decline button (buttons expire after 15 minutes - Discord limitation)
6. If declined: Bot sends rejection message to both users (anonymous: "The proposal has been declined.")
7. If accepted: Bot creates marriage record, announces in notification channel, sends confirmation DMs
8. Bot creates notification channel if it doesn't exist (default name: "marriage-announcements") and saves channel ID

**Divorce Flow:**
1. User A executes `/lyhon` command
2. Bot checks if user is married
3. **Unilateral divorce**: Bot immediately divorces and sends confirmation DM to both users
4. **Mutual consent (optional)**: Bot sends DM to partner asking for confirmation, proceeds only if both confirm
5. Marriage record is removed from database (no announcement sent)
6. Both users receive confirmation DM: "Your marriage has been dissolved."

**Notification Channel Management:**
1. On first marriage announcement, check if notification channel exists for guild
2. If not exists, create channel "marriage-announcements" with read-only permissions for @everyone
3. Save channel ID to database per guild
4. If channel is deleted by admin, recreate on next announcement

**Edge cases to consider:**
- User tries to propose to themselves → Error: "You cannot propose to yourself!"
- User tries to propose when already married → Error: "You are already married! Use `/lyhon` first."
- User tries to propose to someone already married → Error: "@User is already married to someone else."
- User who receives proposal has DMs disabled → Send error message in command channel: "Could not send proposal DM. User may have DMs disabled."
- User leaves server during pending proposal → Proposal becomes invalid, cleanup on next check
- Notification channel is deleted by admin → Recreate channel on next announcement
- Both users try to propose to each other simultaneously → First proposal wins, second gets error: "A proposal already exists between you and @User."
- Proposal buttons expire (15 minutes) → User must use command again to re-propose
- User tries to divorce when not married → Error: "You are not currently married."
- User tries to propose to bot → Error: "You cannot propose to a bot!"
- Rate limit exceeded (more than 1 proposal per hour) → Error: "You can only propose once per hour. Please wait before proposing again."
- Proposal to user who blocked proposer → Handle gracefully, send error to proposer

## Success Criteria
**How will we know when we're done?**

- **Measurable outcomes:**
  1. `/kethon @user` command is registered and functional
  2. Private DM sent to proposer with confirmation (no buttons)
  3. Private DM sent to proposed user with accept/decline buttons
  4. Marriage proposals can be accepted or declined via buttons
  5. Successful marriages are announced in the notification channel (not command channel)
  6. Notification channel is automatically created and managed per guild
  7. Lyhon command works for unilateral divorce (mutual consent optional)
  8. All marriage data is stored in the database
  9. Rate limiting prevents spam proposals
  10. Expired proposals are cleaned up automatically

- **Acceptance criteria:**
  1. ✅ `/kethon @user` command accepts a user mention and validates input
  2. ✅ Bot sends private DM to proposer with confirmation message (no buttons)
  3. ✅ Bot sends private DM to proposed user with accept/decline buttons
  4. ✅ Button interactions work correctly (accept/decline)
  5. ✅ If proposed user declines, both receive anonymous rejection message
  6. ✅ If proposed user accepts, marriage is announced in notification channel (not command channel)
  7. ✅ Notification channel is created automatically if it doesn't exist (default: "marriage-announcements")
  8. ✅ Notification channel ID is saved to database per guild
  9. ✅ `/lyhon` command allows unilateral divorce (immediate) and optional mutual consent
  10. ✅ Divorce does not send announcements (silent operation)
  11. ✅ Database stores marriages, pending proposals, and notification channels
  12. ✅ Prevents duplicate marriages, invalid proposals, and self-marriage
  13. ✅ Handles errors gracefully (DM failures, missing channels, permission errors)
  14. ✅ Rate limiting prevents spam (1 proposal per hour per user)
  15. ✅ Expired proposals are cleaned up after 7 days
  16. ✅ Button expiration is handled (15-minute Discord limit)
  17. ✅ Specific error messages for all invalid operations

- **Performance benchmarks (if applicable):**
  - Command response time: < 500ms
  - DM delivery: < 2 seconds
  - Button interaction response: < 200ms
  - Database queries: < 100ms
  - Channel creation: < 1 second
  - Proposal cleanup job: < 5 seconds (for all expired proposals)

- **Security requirements:**
  - Rate limiting: Maximum 1 proposal per hour per user
  - Input validation: Prevent self-marriage, bot-marriage, duplicate proposals
  - SQL injection prevention: All queries use prepared statements
  - Spam prevention: Rate limiting and duplicate proposal checks
  - Privacy: Anonymous rejection messages, no revealing who declined

- **Data retention policy:**
  - Active marriages: Stored indefinitely (until divorce)
  - Pending proposals: Stored until accepted/declined or buttons expire
  - Declined proposals: Cleaned up after 7 days
  - Expired proposals (buttons expired): Cleaned up after 7 days
  - Divorced marriages: Optionally keep history (not required for MVP)

- **Error message specifications:**
  - Self-marriage: "You cannot propose to yourself!"
  - Already married (proposer): "You are already married! Use `/lyhon` first."
  - Already married (proposed): "@User is already married to someone else."
  - Bot marriage: "You cannot propose to a bot!"
  - Rate limit: "You can only propose once per hour. Please wait before proposing again."
  - Duplicate proposal: "A proposal already exists between you and @User."
  - DM failure: "Could not send proposal DM. User may have DMs disabled."
  - Not married (divorce): "You are not currently married."
  - Permission error: "I don't have permission to create channels. Please contact an administrator."

## Constraints & Assumptions
**What limitations do we need to work within?**

- **Technical constraints:**
  1. Must use Discord.js v14 button interactions
  2. Must use SQLite database (better-sqlite3)
  3. Must handle Discord API rate limits
  4. Must work within Discord's DM restrictions (users can disable DMs)
  5. Must handle missing permissions (bot can't create channels, send DMs, etc.)
  6. Discord button interactions expire after 15 minutes (Discord limitation)
  7. Must handle button expiration gracefully (user must re-propose if buttons expire)
  8. Rate limiting: Maximum 1 proposal per hour per user to prevent spam

- **Business constraints:**
  1. One marriage per user at a time
  2. No marriage statistics or analytics (for now)
  3. Local development focus initially

- **Time/budget constraints:**
  1. Focus on core functionality first
  2. Advanced features (timeouts, statistics) deferred

- **Assumptions we're making:**
  1. Users have DMs enabled (or we handle gracefully if not)
  2. Bot has permissions to create channels and send messages
  3. Bot has permission to send DMs to users
  4. Users understand how to use slash commands and buttons
  5. Server admins want automatic channel creation
  6. Users will re-propose if buttons expire (15-minute limit)
  7. One proposal at a time per user (can't have multiple pending proposals)
  8. Re-proposing after decline is allowed immediately (no cooldown for declined proposals)

## Questions & Open Items
**What do we still need to clarify?**

- **Resolved decisions:**
  1. ✅ Feature name: `marriage-system` (kebab-case)
  2. ✅ Command name: `/kethon` (as specified by user)
  3. ✅ Divorce command: `/lyhon` (unilateral by default, optional mutual consent)
  4. ✅ Notification channel: Auto-create if doesn't exist
  5. ✅ Privacy: Don't reveal who declined proposal
  6. ✅ Notification channel name: "marriage-announcements" (default, can be changed later)
  7. ✅ Proposal acceptance: Only proposed user needs to accept (proposer already initiated)
  8. ✅ Announcement location: Notification channel (not command channel)
  9. ✅ Proposal timeout: No automatic timeout (proposals persist until accepted/declined or buttons expire)
  10. ✅ Re-proposing: Allowed immediately after decline (no restrictions)
  11. ✅ Channel permissions: Read-only for @everyone, bot can send messages
  12. ✅ Rate limiting: 1 proposal per hour per user
  13. ✅ Data retention: Clean up declined/expired proposals after 7 days
  14. ✅ Button expiration: Handle gracefully (15-minute Discord limit, user must re-propose)

- **Items requiring stakeholder input:**
  1. None - all decisions resolved

- **Research needed:**
  1. ✅ Discord.js button interaction patterns
  2. ✅ Discord.js DM sending best practices
  3. ✅ Channel creation and management via Discord.js
  4. Database schema design for marriages and proposals


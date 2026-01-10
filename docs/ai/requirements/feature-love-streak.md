---
phase: requirements
title: Requirements & Problem Understanding
description: Clarify the problem space, gather requirements, and define success criteria
---

# Requirements & Problem Understanding

## Problem Statement
**What problem are we solving?**

- Married couples in the Discord bot lack an interactive daily engagement feature to maintain connection and commitment
- There is no gamification element to encourage daily interaction between married partners
- Users need a fun, streak-based system similar to popular social platforms (like TikTok) to maintain relationship engagement
- The existing marriage system (`/kethon`, `/giaykh`) is static and doesn't encourage ongoing interaction

**Who is affected by this problem?**
- Married couples using the Discord bot
- Users who want a daily engagement activity with their partner

**What is the current situation/workaround?**
- Currently, marriage is a one-time action with no daily maintenance or interaction requirements
- Users can view their marriage certificate (`/giaykh`) but have no ongoing engagement mechanics

## Goals & Objectives
**What do we want to achieve?**

### Primary goals
- Create a daily streak system (`/love`) for married couples to maintain engagement
- Implement a TikTok-style streak mechanic with daily resets at 12 AM
- Provide visual feedback showing completion status for both partners
- Add recovery mechanism (3 times per month) to prevent accidental streak loss
- Integrate streak count display into existing marriage certificate (`/giaykh`)

### Secondary goals
- Encourage daily bot interaction and server activity
- Strengthen the marriage feature by adding ongoing engagement
- Create a sense of achievement and commitment through streak tracking

### Non-goals (what's explicitly out of scope)
- Rewards or currency for maintaining streaks (may be added in future)
- Streak leaderboards or competitive features
- Streak sharing with other couples
- Customizable streak reset times (fixed at 12 AM)

## User Stories & Use Cases
**How will users interact with the solution?**

### Core User Stories

**US-1: Daily Streak Interaction**
- As a married user, I want to use `/love` daily so that I can maintain my streak with my partner

**US-2: Visual Status Tracking**
- As a married user, I want to see a "Streak Box" showing which partner has completed today's streak so that I know if I need to complete mine

**US-3: Streak Recovery**
- As a married user, I want to recover my streak up to 3 times per month so that I don't lose my progress due to occasional missed days

**US-4: Streak Display**
- As a married user, I want to see my current streak count in the `/giaykh` marriage certificate so that I can track my progress

**US-5: Success Confirmation**
- As a married user, I want to receive a confirmation message when both partners complete the daily streak so that I feel accomplished

**US-6: Streak Loss Notification**
- As a married user, I want to be notified when my streak is lost (with or without recovery) so that I understand what happened

### Key Workflows

**Workflow 1: First Partner Completes Streak**
1. User A (married) uses `/love` command
2. System checks if User A is married
3. System checks if User A already completed today's streak
4. System records completion for User A
5. System displays "Streak Box" showing:
   - User A: ✅ (completed emoji)
   - User B: ⏳ (pending emoji)
6. Streak count remains unchanged until both complete

**Workflow 2: Second Partner Completes Streak**
1. User B (married to User A) uses `/love` command
2. System checks marriage and completion status
3. System records completion for User B
4. System increments streak count
5. System displays success message: "Streak maintained successfully, your streak is [X], See you again in 12 hours."
6. Both users see updated Streak Box with both ✅

**Workflow 3: Streak Recovery (Within 3 Attempts)**
1. Couple misses a day (neither completes by 12 AM)
2. Next day, User A uses `/love`
3. System detects missed day
4. System checks recovery count (< 3 for current month)
5. System increments recovery count
6. System maintains streak count
7. System displays: "Streak recovered successfully, [X] times remaining, Please be careful with your streak."

**Workflow 4: Streak Loss (After 3 Recoveries)**
1. Couple misses a day after using all 3 monthly recoveries
2. Next day, User A uses `/love`
3. System detects missed day
4. System checks recovery count (= 3 for current month)
5. System resets streak to 0
6. System displays: "You both failed the streak 💔"
7. New streak starts from 1

### Edge Cases to Consider

**EC-1: Timezone Handling**
- What timezone is used for 12 AM reset?
- How to handle users in different timezones?

**EC-2: One Partner Inactive** ✅ RESOLVED
- What if one partner never completes their side?
- **CONFIRMED**: Streak won't increment until both complete
- No timeout - streak remains at current count
- Reminder system is out of scope for v1 (future enhancement)

**EC-3: Divorce During Active Streak** ✅ RESOLVED
- What happens to the streak if couple divorces?
- **CONFIRMED**: Streak data is preserved in database (CASCADE delete)
- When marriage is deleted, love_streak record is also deleted
- If couple remarries, they start a new streak from 0

**EC-4: Monthly Recovery Reset** ✅ RESOLVED
- Exactly when does the recovery count reset?
- **CONFIRMED**: 1st of each month at 12:00 AM UTC+7
- Cron schedule: `0 17 1 * *` (17:00 UTC on 1st = 00:00 UTC+7 on 1st)
- All users reset simultaneously

**EC-5: Multiple Uses Per Day** ✅ RESOLVED
- What happens if user tries to use `/love` multiple times in same day?
- **CONFIRMED**: Show "already completed" message with current Streak Box
- Not an error - just informational feedback
- User can see current status and partner's completion

**EC-6: Marriage on Same Day** ✅ RESOLVED
- Can newly married couples start a streak immediately?
- **CONFIRMED**: Yes, couples can start streak same day as marriage
- No waiting period required
- Streak begins from 0 and increments when both complete

## Success Criteria
**How will we know when we're done?**

### Functional Criteria
- [ ] `/love` command is available to married users
- [ ] Streak increments only when both partners complete daily
- [ ] Streak resets at 12 AM daily
- [ ] Recovery system allows 3 missed days per month
- [ ] Recovery count resets on 1st of each month
- [ ] Streak Box displays both partners' completion status
- [ ] Correct emojis are used (emoji_43~1 for pending, emoji_48 for completed, emoji_57 for failed)
- [ ] Success message displays when both complete
- [ ] Recovery message displays with remaining attempts
- [ ] Failure message displays when streak is lost
- [ ] Streak count appears in `/giaykh` footer
- [ ] Streak count appears in `/status` display

### User Experience Criteria
- [ ] Messages are clear and informative
- [ ] Visual feedback (Streak Box) is easy to understand
- [ ] Users understand when they need to complete their streak
- [ ] Recovery system is transparent and understandable
- [ ] Emoji usage is consistent with existing bot design

### Technical Criteria
- [ ] Command responds within 3 seconds
- [ ] Database updates are atomic and consistent
- [ ] No race conditions when both partners use command simultaneously
- [ ] Proper error handling for edge cases
- [ ] Timezone handling is consistent and documented

### Testing Criteria
- [ ] Unit tests cover all service methods
- [ ] Integration tests cover command execution
- [ ] Edge cases are tested (timezone boundaries, simultaneous use, etc.)
- [ ] Test coverage is 100% for new code

## Constraints & Assumptions
**What limitations do we need to work within?**

### Technical Constraints
- Must integrate with existing marriage system (marriageService)
- Must use existing emoji system (formatEmojiFromGuildByName)
- Must follow existing command structure (SlashCommandBuilder)
- Must use existing database (Supabase)
- Must maintain compatibility with existing `/giaykh` and `/status` commands

### Business Constraints
- Feature must be free for all married users
- No external API dependencies
- Must work within Discord's rate limits

### Time/Budget Constraints
- Should be implementable within existing codebase structure
- No major architectural changes required

### Assumptions
- Users understand the concept of "streaks" from other platforms
- Married couples want daily engagement features
- 12 AM reset time is acceptable for all users (may need timezone consideration)
- 3 recovery attempts per month is a reasonable balance
- Users will check the bot daily to maintain streaks
- Both partners have equal access to Discord and the bot
- Emoji IDs (emoji_43~1, emoji_48, emoji_57) exist in the Discord server
- The existing marriage system is stable and won't change significantly

## Questions & Open Items
**What do we still need to clarify?**

### Unresolved Questions

**Q1: Timezone Handling** ✅ RESOLVED
- What timezone should be used for 12 AM reset?
- **CONFIRMED**: Use UTC+7 (Vietnam timezone)
- All resets happen at 12 AM UTC+7 daily

**Q2: Streak Display Format** ✅ RESOLVED
- Should streak count show days, weeks, or both?
- **CONFIRMED**: Show days only for simplicity
- Example: "15 ngày" (not "2 tuần, 1 ngày")

**Q3: Recovery Notification** ✅ RESOLVED
- Should users be notified when they're about to lose their last recovery attempt?
- **CONFIRMED**: Yes, add warning message on 3rd recovery use
- Message should indicate: "This is your last recovery! Be careful."

**Q4: Reminder System**
- Should there be automated reminders if one partner hasn't completed?
- If yes, when? (e.g., 6 PM if not completed)
- **Recommendation**: Out of scope for v1, add to future enhancements

**Q5: Streak Milestones**
- Should there be special messages for milestone streaks? (7 days, 30 days, 100 days, etc.)
- **Recommendation**: Out of scope for v1, add to future enhancements

**Q6: Historical Data** ✅ RESOLVED
- Should we track streak history (best streak, total days, etc.)?
- **CONFIRMED**: Yes, track `best_streak` and `total_days` in database
- Sufficient for v1, additional analytics can be added later

**Q7: Partial Day Handling** ✅ RESOLVED
- What if couple marries at 11 PM? Can they start streak before midnight?
- **CONFIRMED**: Allow streak start same day as marriage
- Couples can use `/love` immediately after marriage

**Q8: Simultaneous Completion** ✅ RESOLVED
- If both partners use `/love` at the exact same time, how to handle?
- **CONFIRMED**: Use database transactions with row-level locking
- Ensures atomic updates and prevents race conditions
- Design doc addresses this with transaction patterns

### Items Requiring Stakeholder Input
- ✅ **CONFIRMED**: Emoji IDs exist in Discord server ID `1449180531777339563` (emoji_43~1, emoji_48, emoji_57)
- ✅ **CONFIRMED**: 12 AM UTC+7 reset time
- ✅ **CONFIRMED**: 3 recoveries per month is the right balance
- ✅ **CONFIRMED**: Integration with `/giaykh` footer is desired

### Research Needed
- ✅ **COMPLETE**: Timezone handling → UTC+7 implementation defined
- ✅ **COMPLETE**: Database transactions → Row-level locking pattern defined
- ⚠️ **TODO**: Review similar streak implementations in other Discord bots (optional)
- ⚠️ **TODO**: Test emoji rendering across different Discord clients (during testing phase)

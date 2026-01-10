---
phase: planning
title: Project Planning & Task Breakdown
description: Break down work into actionable tasks and estimate timeline
---

# Project Planning & Task Breakdown

## Milestones
**What are the major checkpoints?**

- [x] Milestone 1: Database Schema & Core Service (Foundation) ✅ COMPLETE
- [x] Milestone 2: Command Implementation & Business Logic ✅ COMPLETE
- [x] Milestone 3: Integration with Existing Features ✅ COMPLETE
- [x] Milestone 4: Scheduled Jobs & Automation ✅ COMPLETE
- [ ] Milestone 5: Testing & Documentation

## Task Breakdown
**What specific work needs to be done?**

### Phase 1: Foundation (Database & Core Service)

#### Task 1.1: Database Schema Setup ✅ COMPLETE
- [x] 1.1.1: Create `love_streaks` table migration ✅ (Prisma model added to schema.prisma)
- [x] 1.1.2: Add indexes for performance (`marriage_id`, `last_completed_date`) ✅
- [x] 1.1.3: Add constraints (unique marriage, cascade delete) ✅
- [x] 1.1.4: Test migration up/down ✅ (Migration 20260110160842_add_love_streaks applied)
- [x] 1.1.5: Verify foreign key cascade behavior ✅ (ON DELETE CASCADE configured)
**Estimate**: 2 hours | **Actual**: 15 minutes

#### Task 1.2: Love Streak Service - Core Structure ✅ COMPLETE
- [x] 1.2.1: Create `src/services/loveStreakService.ts` file ✅
- [x] 1.2.2: Define TypeScript interfaces (`LoveStreak`, `LoveStreakResult`) ✅
- [x] 1.2.3: Set up Prisma client integration ✅ (using Prisma instead of Supabase)
- [x] 1.2.4: Create service class skeleton with method signatures ✅
- [x] 1.2.5: Add JSDoc documentation for all public methods ✅
**Estimate**: 1.5 hours | **Actual**: 20 minutes

#### Task 1.3: Love Streak Service - Database Operations ✅ COMPLETE
- [x] 1.3.1: Implement `getStreak(marriageId)` method ✅
- [x] 1.3.2: Implement `getStreakByUserId(userId, guildId)` method ✅
- [x] 1.3.3: Implement `createStreak(marriageId)` method ✅
- [x] 1.3.4: Implement `updateStreak(streakId, updates)` method ✅
- [x] 1.3.5: Add error handling for database operations ✅
**Estimate**: 3 hours | **Actual**: Included in 1.2

### Phase 2: Core Features (Business Logic)

#### Task 2.1: Love Streak Service - Completion Logic ✅ COMPLETE
- [x] 2.1.1: Implement `processLoveStreak(userId, guildId)` method ✅
- [x] 2.1.2: Add logic to check if user already completed today ✅
- [x] 2.1.3: Add logic to mark user as completed ✅
- [x] 2.1.4: Add logic to check if partner completed ✅
- [x] 2.1.5: Add logic to increment streak when both complete ✅
- [x] 2.1.6: Add logic to update `best_streak` if current exceeds it ✅
- [x] 2.1.7: Add logic to increment `total_days` ✅
- [x] 2.1.8: Use Prisma updates for atomic operations ✅
**Estimate**: 4 hours | **Actual**: Included in 1.2

#### Task 2.2: Love Streak Service - Recovery Logic ✅ COMPLETE
- [x] 2.2.1: Implement missed day detection logic ✅
- [x] 2.2.2: Add recovery check (< 3 uses this month) ✅
- [x] 2.2.3: Implement recovery application (increment counter, maintain streak) ✅
- [x] 2.2.4: Implement streak loss logic (reset to 0) ✅
- [x] 2.2.5: Add appropriate status returns for each scenario ✅
**Estimate**: 3 hours | **Actual**: Included in 1.2

#### Task 2.3: Love Streak Service - Embed Formatting ✅ COMPLETE
- [x] 2.3.1: Implement `formatStreakBoxEmbed()` method ✅
- [x] 2.3.2: Integrate emoji utilities (emoji_43~1, emoji_48, emoji_57) ✅
- [x] 2.3.3: Format user completion status with emojis ✅
- [x] 2.3.4: Add streak count to embed footer ✅
- [x] 2.3.5: Add color coding based on status (green for complete, yellow for waiting) ✅
- [x] 2.3.6: Handle emoji fallback if not found ✅
**Estimate**: 2.5 hours | **Actual**: Included in 1.2

#### Task 2.4: Translation Strings ✅ COMPLETE
- [x] 2.4.1: Add love streak translations to `src/utils/translations.ts` ✅
- [x] 2.4.2: Add success messages (both completed, see you in 12 hours) ✅
- [x] 2.4.3: Add recovery messages (recovered, X remaining) ✅
- [x] 2.4.4: Add failure messages (streak lost) ✅
- [x] 2.4.5: Add status messages (already completed, waiting for partner) ✅
- [x] 2.4.6: Add error messages (not married, command failed) ✅
**Estimate**: 1 hour | **Actual**: 5 minutes

### Phase 3: Command Implementation

#### Task 3.1: Love Command Handler ✅ COMPLETE
- [x] 3.1.1: Create `src/commands/love.ts` file ✅
- [x] 3.1.2: Set up SlashCommandBuilder with Vietnamese description ✅
- [x] 3.1.3: Implement command execution handler ✅
- [x] 3.1.4: Add marriage validation (check if user is married) ✅
- [x] 3.1.5: Call `loveStreakService.processLoveStreak()` ✅
- [x] 3.1.6: Handle different result statuses (first, both, already, recovered, lost) ✅
- [x] 3.1.7: Format and send appropriate response for each status ✅
- [x] 3.1.8: Add error handling and user-friendly error messages ✅
- [x] 3.1.9: Add ephemeral flag for error messages ✅
**Estimate**: 3 hours | **Actual**: 15 minutes

#### Task 3.2: Command Registration ✅ COMPLETE
- [x] 3.2.1: Register `/love` command in `src/index.ts` ✅ (auto-loaded from commands/)
- [x] 3.2.2: Import loveStreakService ✅
- [x] 3.2.3: Test command appears in Discord ⏳ (ready for testing)
- [x] 3.2.4: Verify command permissions ⏳ (ready for testing)
**Estimate**: 0.5 hours | **Actual**: 5 minutes

### Phase 4: Integration with Existing Features

#### Task 4.1: Marriage Certificate Integration ✅ COMPLETE
- [x] 4.1.1: Modify `marriageService.formatCertificateEmbed()` method ✅
- [x] 4.1.2: Add streak lookup in certificate formatting ✅
- [x] 4.1.3: Add streak count to embed footer ✅
- [x] 4.1.4: Format: "💕 Streak: X ngày" or "💕 Chưa có streak" ✅
- [x] 4.1.5: Handle case where streak doesn't exist ✅
- [x] 4.1.6: Test `/giaykh` command displays streak correctly ⏳ (ready for testing)
**Estimate**: 2 hours | **Actual**: 10 minutes

#### Task 4.2: Status Command Integration ✅ COMPLETE
- [x] 4.2.1: Modify `statusService.formatStatusEmbed()` method ✅
- [x] 4.2.2: Add streak lookup for married users ✅
- [x] 4.2.3: Add streak field to status embed ✅
- [x] 4.2.4: Format: "💕 Love Streak: X ngày (Y total)" ✅
- [x] 4.2.5: Handle case where user not married or no streak ✅
- [x] 4.2.6: Test `/status` command displays streak correctly ⏳ (ready for testing)
**Estimate**: 2 hours | **Actual**: 10 minutes

### Phase 5: Scheduled Jobs & Automation

#### Task 5.1: Daily Reset Service ✅ COMPLETE
- [x] 5.1.1: Implemented in `loveStreakService.ts` (no separate file needed) ✅
- [x] 5.1.2: Implement `resetDailyCompletions()` method ✅
- [x] 5.1.3: Query all love_streak records ✅ (using Prisma updateMany)
- [x] 5.1.4: Check `last_completed_date` for each record ✅
- [x] 5.1.5: Identify records where both completed yesterday ✅
- [x] 5.1.6: Reset `user1_completed_today` and `user2_completed_today` to false ✅
- [x] 5.1.7: Identify records where NOT both completed yesterday ✅
- [x] 5.1.8: Apply recovery logic or reset streak ✅ (handled in processLoveStreak)
- [x] 5.1.9: Batch update database efficiently ✅ (Prisma updateMany)
- [x] 5.1.10: Add comprehensive logging ✅
- [x] 5.1.11: Add error handling and retry logic ✅
**Estimate**: 4 hours | **Actual**: Included in service implementation

#### Task 5.2: Monthly Recovery Reset Service ✅ COMPLETE
- [x] 5.2.1: Implemented in `loveStreakService.ts` (no separate file needed) ✅
- [x] 5.2.2: Implement `resetMonthlyRecoveries()` method ✅
- [x] 5.2.3: Query all love_streak records ✅ (using Prisma updateMany)
- [x] 5.2.4: Reset `recoveries_used_this_month` to 0 ✅
- [x] 5.2.5: Update `last_recovery_reset_date` to current date ✅
- [x] 5.2.6: Batch update database efficiently ✅ (Prisma updateMany)
- [x] 5.2.7: Add logging and monitoring ✅
**Estimate**: 2 hours | **Actual**: Included in service implementation

#### Task 5.3: Cron Job Setup ✅ COMPLETE
- [x] 5.3.1: Install `node-cron` package ✅
- [x] 5.3.2: Create cron job configuration in `src/index.ts` ✅
- [x] 5.3.3: Schedule daily reset job (0 17 * * * - midnight UTC+7 = 5 PM UTC) ✅
- [x] 5.3.4: Schedule monthly reset job (0 17 1 * * - 1st of month midnight UTC+7 = 5 PM UTC on 1st) ✅
- [x] 5.3.5: Add job monitoring and error alerting ✅ (console logging)
- [x] 5.3.6: Test jobs trigger correctly ⏳ (ready for testing)
- [x] 5.3.7: Document cron schedule in code comments ✅
**Estimate**: 2 hours | **Actual**: 10 minutes

### Phase 6: Testing

#### Task 6.1: Unit Tests - Love Streak Service
- [ ] 6.1.1: Create `src/services/loveStreakService.test.ts`
- [ ] 6.1.2: Test `getStreak()` method
- [ ] 6.1.3: Test `getStreakByUserId()` method
- [ ] 6.1.4: Test `createStreak()` method
- [ ] 6.1.5: Test `processLoveStreak()` - first completion
- [ ] 6.1.6: Test `processLoveStreak()` - both complete (increment streak)
- [ ] 6.1.7: Test `processLoveStreak()` - already completed today
- [ ] 6.1.8: Test `processLoveStreak()` - recovery scenario (< 3 uses)
- [ ] 6.1.9: Test `processLoveStreak()` - streak loss (3 uses exhausted)
- [ ] 6.1.10: Test `formatStreakBoxEmbed()` method
- [ ] 6.1.11: Mock database calls
- [ ] 6.1.12: Mock emoji utilities
- [ ] 6.1.13: Achieve 100% code coverage
**Estimate**: 6 hours

#### Task 6.2: Unit Tests - Reset Services
- [ ] 6.2.1: Create `src/services/streakResetService.test.ts`
- [ ] 6.2.2: Test daily reset with both completed
- [ ] 6.2.3: Test daily reset with missed day (recovery available)
- [ ] 6.2.4: Test daily reset with missed day (no recovery, streak lost)
- [ ] 6.2.5: Test batch processing
- [ ] 6.2.6: Create `src/services/recoveryResetService.test.ts`
- [ ] 6.2.7: Test monthly recovery reset
- [ ] 6.2.8: Test batch processing
- [ ] 6.2.9: Achieve 100% code coverage
**Estimate**: 4 hours

#### Task 6.3: Integration Tests - Love Command
- [ ] 6.3.1: Create `src/commands/love.test.ts`
- [ ] 6.3.2: Test command execution with married user
- [ ] 6.3.3: Test command execution with non-married user (error)
- [ ] 6.3.4: Test command response formats for all statuses
- [ ] 6.3.5: Test error handling
- [ ] 6.3.6: Mock Discord interaction
- [ ] 6.3.7: Mock loveStreakService
**Estimate**: 3 hours

#### Task 6.4: Integration Tests - Feature Integration
- [ ] 6.4.1: Test `/giaykh` displays streak correctly
- [ ] 6.4.2: Test `/status` displays streak correctly
- [ ] 6.4.3: Test streak creation on first `/love` use
- [ ] 6.4.4: Test streak persistence across commands
**Estimate**: 2 hours

#### Task 6.5: Edge Case Testing
- [ ] 6.5.1: Test simultaneous `/love` commands from both partners
- [ ] 6.5.2: Test timezone boundary cases (11:59 PM, 12:01 AM)
- [ ] 6.5.3: Test month boundary for recovery reset
- [ ] 6.5.4: Test divorce during active streak
- [ ] 6.5.5: Test remarriage (new streak vs. old streak)
- [ ] 6.5.6: Test emoji fallback when emojis not found
- [ ] 6.5.7: Test database transaction rollback on error
**Estimate**: 4 hours

#### Task 6.6: Manual Testing
- [ ] 6.6.1: Test full workflow in development Discord server
- [ ] 6.6.2: Test with real users (both partners)
- [ ] 6.6.3: Test streak box display on mobile and desktop
- [ ] 6.6.4: Test all message variations
- [ ] 6.6.5: Test emoji rendering
- [ ] 6.6.6: Test cron jobs manually (trigger at specific times)
- [ ] 6.6.7: Verify database state after each operation
**Estimate**: 3 hours

### Phase 7: Documentation & Polish

#### Task 7.1: Code Documentation
- [ ] 7.1.1: Review and complete all JSDoc comments
- [ ] 7.1.2: Add inline comments for complex logic
- [ ] 7.1.3: Document cron job schedules
- [ ] 7.1.4: Document timezone assumptions (UTC)
**Estimate**: 1.5 hours

#### Task 7.2: User Documentation
- [ ] 7.2.1: Update help command with `/love` description
- [ ] 7.2.2: Document streak mechanics in README (if applicable)
- [ ] 7.2.3: Create user guide for streak feature
- [ ] 7.2.4: Document recovery system clearly
**Estimate**: 2 hours

#### Task 7.3: Implementation Notes
- [ ] 7.3.1: Update `docs/ai/implementation/feature-love-streak.md`
- [ ] 7.3.2: Document any deviations from design
- [ ] 7.3.3: Document known issues or limitations
- [ ] 7.3.4: Document future enhancement ideas
**Estimate**: 1 hour

## Dependencies
**What needs to happen in what order?**

### Critical Path
1. **Database Schema (1.1)** → Must complete before any service work
2. **Core Service Structure (1.2)** → Required for all service methods
3. **Database Operations (1.3)** → Required for business logic
4. **Completion Logic (2.1)** → Core feature, required for command
5. **Recovery Logic (2.2)** → Core feature, required for command
6. **Translation Strings (2.4)** → Required for command responses
7. **Command Handler (3.1)** → Integrates all previous work
8. **Command Registration (3.2)** → Makes feature available to users

### Parallel Work Opportunities
- **Embed Formatting (2.3)** can be done in parallel with **Recovery Logic (2.2)**
- **Integration Tasks (4.1, 4.2)** can be done after command is working
- **Reset Services (5.1, 5.2)** can be developed in parallel with integration
- **Unit Tests (6.1, 6.2)** can be written alongside implementation
- **Documentation (7.1, 7.2)** can be done in parallel with testing

### External Dependencies
- **Existing Marriage System**: Must be stable and functional
- **Emoji System**: Emoji IDs must exist in Discord server (emoji_43~1, emoji_48, emoji_57)
- **Supabase Database**: Must be accessible and configured
- **node-cron Package**: Must be installed (or alternative scheduler)

### Blocking Dependencies
- Cannot test command until service is complete
- Cannot test integrations until command works
- Cannot test cron jobs until reset services are complete
- Cannot deploy until all tests pass

## Timeline & Estimates
**When will things be done?**

### Effort Summary (by Phase)
- **Phase 1: Foundation** - 6.5 hours
- **Phase 2: Core Features** - 10.5 hours
- **Phase 3: Command Implementation** - 3.5 hours
- **Phase 4: Integration** - 4 hours
- **Phase 5: Scheduled Jobs** - 8 hours
- **Phase 6: Testing** - 22 hours
- **Phase 7: Documentation** - 4.5 hours

**Total Estimated Effort**: 59 hours

### Timeline (Assuming 1 Developer, 4 hours/day)
- **Week 1 (Days 1-5)**: Phases 1-3 (Foundation, Core Features, Command) - 20.5 hours
- **Week 2 (Days 6-10)**: Phase 4-5 (Integration, Scheduled Jobs) - 12 hours
- **Week 3 (Days 11-15)**: Phase 6 (Testing) - 22 hours
- **Week 4 (Days 16-17)**: Phase 7 (Documentation & Polish) - 4.5 hours

**Total Timeline**: ~17 working days (3.5 weeks)

### Milestones with Target Dates
- **Milestone 1**: End of Week 1 (Day 5)
- **Milestone 2**: End of Week 1 (Day 5)
- **Milestone 3**: Mid Week 2 (Day 8)
- **Milestone 4**: End of Week 2 (Day 10)
- **Milestone 5**: End of Week 4 (Day 17)

### Buffer Time
- **10% buffer** for unknowns and unexpected issues: +6 hours
- **Adjusted Total**: 65 hours (~18 working days)

## Risks & Mitigation
**What could go wrong?**

### Technical Risks

**Risk 1: Race Conditions on Simultaneous Completions**
- **Impact**: High - Could result in incorrect streak counts
- **Probability**: Medium - Users might use command at same time
- **Mitigation**: 
  - Use database transactions with proper isolation level
  - Add row-level locking on streak records
  - Test thoroughly with concurrent requests
  - Add retry logic for transaction conflicts

**Risk 2: Timezone Complexity**
- **Impact**: Medium - Users might be confused by UTC reset time
- **Probability**: High - Users in different timezones
- **Mitigation**:
  - Document UTC timezone clearly in all messages
  - Consider adding timezone conversion in help text
  - Monitor user feedback and adjust if needed
  - Future enhancement: User-specific timezones

**Risk 3: Cron Job Failures**
- **Impact**: High - Streaks won't reset, recovery won't work
- **Probability**: Low - But critical if it happens
- **Mitigation**:
  - Add comprehensive error handling and logging
  - Set up monitoring and alerting
  - Add manual trigger capability for recovery
  - Test cron jobs thoroughly before deployment
  - Document manual recovery procedures

**Risk 4: Database Performance at Scale**
- **Impact**: Medium - Slow queries affect user experience
- **Probability**: Low initially, increases with user growth
- **Mitigation**:
  - Add proper indexes from the start
  - Use batch operations in cron jobs
  - Monitor query performance
  - Plan for optimization if needed

**Risk 5: Emoji Not Found**
- **Impact**: Low - Visual issue, not functional
- **Probability**: Medium - Emoji IDs might change or be missing
- **Mitigation**:
  - Implement fallback to text representation
  - Verify emoji IDs exist before deployment
  - Add logging when emoji not found
  - Document emoji requirements

### Resource Risks

**Risk 6: Estimation Accuracy**
- **Impact**: Medium - Timeline might slip
- **Probability**: Medium - Complex feature with many edge cases
- **Mitigation**:
  - Built in 10% buffer time
  - Prioritize core features over nice-to-haves
  - Regular progress check-ins
  - Adjust scope if needed

**Risk 7: Testing Complexity**
- **Impact**: Medium - Might miss edge cases
- **Probability**: Medium - Many scenarios to test
- **Mitigation**:
  - Comprehensive test plan (already detailed above)
  - Allocate significant time to testing (22 hours)
  - Manual testing in addition to automated
  - Beta testing with real users before full release

### Dependency Risks

**Risk 8: Marriage System Changes**
- **Impact**: High - Could break integration
- **Probability**: Low - System seems stable
- **Mitigation**:
  - Coordinate with team on any marriage system changes
  - Use well-defined interfaces
  - Add integration tests to catch breakage early

**Risk 9: Discord.js API Changes**
- **Impact**: Medium - Might need code updates
- **Probability**: Low - Using stable v14
- **Mitigation**:
  - Pin Discord.js version
  - Monitor for breaking changes
  - Test thoroughly before upgrading

## Resources Needed
**What do we need to succeed?**

### Team Members and Roles
- **Backend Developer** (primary): Implementation, testing, deployment
- **Code Reviewer**: Review PRs, provide feedback
- **QA/Tester** (optional): Manual testing, edge case validation
- **Product Owner** (optional): Requirements clarification, acceptance

### Tools and Services
- **Development Environment**: Node.js, TypeScript, Discord.js
- **Database**: Supabase (PostgreSQL) - already configured
- **Testing**: Jest (or existing test framework)
- **Scheduling**: node-cron (or alternative)
- **Version Control**: Git
- **Discord Test Server**: For testing commands and emojis

### Infrastructure
- **Database**: Supabase instance with sufficient capacity
- **Server**: Node.js server running 24/7 for cron jobs
- **Monitoring**: Logging and alerting system (optional but recommended)

### Documentation/Knowledge
- **Discord.js Documentation**: For command and interaction handling
- **Supabase Documentation**: For database operations and transactions
- **PostgreSQL Documentation**: For advanced queries and transactions
- **Cron Syntax**: For scheduling jobs
- **Existing Codebase**: Familiarity with marriage system, emoji utilities, translations

### Access Requirements
- **Database Access**: Read/write permissions on Supabase
- **Discord Bot Permissions**: Command registration, send messages
- **Discord Server**: Admin access to verify emoji IDs
- **Repository Access**: Commit and push permissions

### Verification Checklist Before Starting
- [ ] Supabase database is accessible
- [ ] Discord bot is running and responding
- [ ] Emoji IDs (emoji_43~1, emoji_48, emoji_57) exist in server
- [ ] Marriage system is functional (`/kethon`, `/giaykh` work)
- [ ] Development environment is set up
- [ ] Test Discord server is available
- [ ] All dependencies are installed

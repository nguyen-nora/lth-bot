---
phase: testing
title: Testing Strategy
description: Define testing approach, test cases, and quality assurance
---

# Testing Strategy

## ✅ Test Execution Summary

**Date**: 2026-01-10
**Status**: ✅ **100% Coverage Achieved**

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Statements | 100% | 100% | ✅ |
| Branches | 100% | 100% | ✅ |
| Functions | 100% | 100% | ✅ |
| Lines | 100% | 100% | ✅ |
| Tests Passing | All | 92/92 | ✅ |

### Test Files Created
- `src/services/loveStreakService.test.ts` - 61 tests
- `src/commands/love.test.ts` - 17 tests
- `src/services/cleanupService.test.ts` - 14 tests (existing)

### Run Tests
```bash
npm test                    # Run all tests
npm test -- --coverage      # Run with coverage report
npx vitest run --coverage   # Same as above
```

---

## Test Coverage Goals
**What level of testing do we aim for?**

- **Unit test coverage target**: ✅ 100% of new code (services, utilities)
- **Integration test scope**: ✅ All command handlers, service integrations, cron jobs
- **End-to-end test scenarios**: Complete user workflows (first use, both complete, recovery, loss)
- **Alignment with requirements**: All success criteria from requirements doc must be testable

## Unit Tests
**What individual components need testing?**

### Component 1: LoveStreakService

#### Test Suite: Database Operations
- [x] **Test 1.1**: `getStreak()` returns streak when exists
- [x] **Test 1.2**: `getStreak()` returns null when doesn't exist
- [x] **Test 1.3**: `getStreakByUserId()` returns streak for user1 in marriage
- [x] **Test 1.4**: `getStreakByUserId()` returns streak for user2 in marriage
- [x] **Test 1.5**: `getStreakByUserId()` returns null when user not married
- [x] **Test 1.6**: `createStreak()` creates new streak with default values
- [x] **Test 1.7**: `updateStreak()` updates streak fields correctly
- [x] **Test 1.8**: Database errors are caught and handled

#### Test Suite: Completion Logic
- [x] **Test 2.1**: First partner completes - marks user as completed
- [x] **Test 2.2**: First partner completes - returns 'first_completed' status
- [x] **Test 2.3**: First partner completes - does NOT increment streak
- [x] **Test 2.4**: Second partner completes - marks user as completed
- [x] **Test 2.5**: Second partner completes - returns 'both_completed' status
- [x] **Test 2.6**: Second partner completes - increments current_streak
- [x] **Test 2.7**: Second partner completes - updates best_streak if current exceeds it
- [x] **Test 2.8**: Second partner completes - increments total_days
- [x] **Test 2.9**: Second partner completes - updates last_completed_date to today
- [x] **Test 2.10**: User already completed today - returns 'already_completed' status
- [x] **Test 2.11**: User already completed today - does NOT modify streak

#### Test Suite: Recovery Logic
- [x] **Test 3.1**: Missed day with 0 recoveries used - applies recovery
- [x] **Test 3.2**: Missed day with 1 recovery used - applies recovery
- [x] **Test 3.3**: Missed day with 2 recoveries used - applies recovery
- [x] **Test 3.4**: Missed day with 3 recoveries used - resets streak to 0
- [x] **Test 3.5**: Recovery applied - increments recoveries_used_this_month
- [x] **Test 3.6**: Recovery applied - maintains current_streak value
- [x] **Test 3.7**: Recovery applied - returns 'streak_recovered' status
- [x] **Test 3.8**: Recovery applied - returns correct recoveriesRemaining count
- [x] **Test 3.9**: Streak lost - resets current_streak to 0
- [x] **Test 3.10**: Streak lost - returns 'streak_lost' status
- [x] **Test 3.11**: Streak lost - does NOT reset best_streak
- [x] **Test 3.12**: User2 recovery scenario - marks user2 as completed

#### Test Suite: Embed Formatting
- [x] **Test 4.1**: `formatStreakBoxEmbed()` shows both users
- [x] **Test 4.2**: Completed user shows completed emoji (emoji_48)
- [x] **Test 4.3**: Pending user shows pending emoji (emoji_43~1)
- [x] **Test 4.4**: Footer shows current streak count
- [x] **Test 4.5**: Embed color is green when both completed
- [x] **Test 4.6**: Embed color is yellow when waiting for partner
- [x] **Test 4.7**: Emoji fallback works when emoji not found
- [x] **Test 4.8**: User display names are fetched correctly
- [x] **Test 4.9**: Username fallback when displayName not available

### Component 2: StreakResetService (in LoveStreakService)

#### Test Suite: Daily Reset Logic
- [x] **Test 5.1**: Resets completion flags for all streaks
- [x] **Test 5.2**: Returns 0 when no streaks exist
- [x] **Test 5.3**: Handles database errors gracefully
- [x] **Test 5.4**: Returns count of processed records

### Component 3: RecoveryResetService (in LoveStreakService)

#### Test Suite: Monthly Reset Logic
- [x] **Test 6.1**: Resets recoveries_used_this_month to 0 for all streaks
- [x] **Test 6.2**: Updates last_recovery_reset_date to current date
- [x] **Test 6.3**: Returns 0 when no streaks exist
- [x] **Test 6.4**: Handles database errors gracefully
- [x] **Test 6.5**: Returns count of processed records

### Component 4: Love Command Handler

#### Test Suite: Command Validation
- [x] **Test 7.1**: User not married - returns error message
- [x] **Test 7.2**: User married - proceeds to process streak
- [x] **Test 7.3**: Guild not found - returns error message
- [x] **Test 7.4**: Service error - returns generic error message
- [x] **Test 7.5**: Error messages are ephemeral
- [x] **Test 7.6**: Non-Error exceptions handled gracefully

#### Test Suite: Response Formatting
- [x] **Test 8.1**: 'first_completed' status - shows Streak Box with waiting message
- [x] **Test 8.2**: 'both_completed' status - shows success message with streak count
- [x] **Test 8.3**: 'already_completed' status - shows "already completed" message (ephemeral)
- [x] **Test 8.4**: 'streak_recovered' status - shows recovery message with remaining count
- [x] **Test 8.5**: 'streak_recovered' with isLastRecovery - shows last chance warning
- [x] **Test 8.6**: 'streak_lost' status - shows failure message with broken heart emoji
- [x] **Test 8.7**: Emoji fallback when formatEmojiFromGuildByName returns null
- [x] **Test 8.8**: Unknown status handled gracefully (default case)

## Integration Tests
**How do we test component interactions?**

### Integration 1: Love Command → Love Streak Service → Database
- [ ] **Test 9.1**: Full workflow - user1 completes first
- [ ] **Test 9.2**: Full workflow - user2 completes second, streak increments
- [ ] **Test 9.3**: Full workflow - user tries to complete twice in same day
- [ ] **Test 9.4**: Full workflow - missed day triggers recovery
- [ ] **Test 9.5**: Full workflow - missed day after 3 recoveries resets streak
- [ ] **Test 9.6**: Database transaction commits on success
- [ ] **Test 9.7**: Database transaction rolls back on error

### Integration 2: Marriage Service → Love Streak Service
- [ ] **Test 10.1**: Certificate embed includes streak count when exists
- [ ] **Test 10.2**: Certificate embed shows "no streak" when doesn't exist
- [ ] **Test 10.3**: Certificate footer formatting is correct

### Integration 3: Status Service → Love Streak Service
- [ ] **Test 11.1**: Status embed includes streak field when married and streak exists
- [ ] **Test 11.2**: Status embed excludes streak field when not married
- [ ] **Test 11.3**: Status embed excludes streak field when married but no streak
- [ ] **Test 11.4**: Streak field shows current and total days

### Integration 4: Cron Jobs
- [ ] **Test 12.1**: Daily reset job triggers at correct time (00:00 UTC+7 = 17:00 UTC)
- [ ] **Test 12.2**: Monthly reset job triggers at correct time (1st 00:00 UTC+7 = 17:00 UTC on last day of prev month)
- [ ] **Test 12.3**: Daily reset job processes all streaks
- [ ] **Test 12.4**: Monthly reset job processes all streaks
- [ ] **Test 12.5**: Jobs log execution start and completion
- [ ] **Test 12.6**: Jobs handle errors without crashing

## End-to-End Tests
**What user flows need validation?**

### User Flow 1: New Couple Starts Streak
- [ ] **Test 13.1**: Couple gets married
- [ ] **Test 13.2**: User1 uses `/love` - sees Streak Box with self completed, partner pending
- [ ] **Test 13.3**: User2 uses `/love` - sees success message "Streak maintained, your streak is 1"
- [ ] **Test 13.4**: Both see Streak Box with both completed
- [ ] **Test 13.5**: `/giaykh` shows streak count of 1
- [ ] **Test 13.6**: `/status` shows streak count of 1

### User Flow 2: Maintaining Streak Daily
- [ ] **Test 14.1**: Day 1 - both complete, streak = 1
- [ ] **Test 14.2**: Day 2 - both complete, streak = 2
- [ ] **Test 14.3**: Day 3 - both complete, streak = 3
- [ ] **Test 14.4**: Each day, success message shows correct streak count
- [ ] **Test 14.5**: `/giaykh` always shows current streak count

### User Flow 3: Recovery Scenario
- [ ] **Test 15.1**: Couple has 5-day streak
- [ ] **Test 15.2**: Day 6 - neither completes (miss day)
- [ ] **Test 15.3**: Day 7 - user1 completes, sees recovery message "3 times remaining"
- [ ] **Test 15.4**: Day 7 - user2 completes, streak remains 5 (not incremented yet)
- [ ] **Test 15.5**: Day 8 - both complete, streak = 6
- [ ] **Test 15.6**: Recovery count is now 1

### User Flow 4: Streak Loss
- [ ] **Test 16.1**: Couple has used 3 recoveries this month
- [ ] **Test 16.2**: Couple misses another day
- [ ] **Test 16.3**: User1 completes next day, sees "You both failed the streak 💔"
- [ ] **Test 16.4**: Streak is reset to 0
- [ ] **Test 16.5**: User2 completes, streak starts fresh at 1
- [ ] **Test 16.6**: Best streak is preserved (not reset)

### User Flow 5: Monthly Recovery Reset
- [ ] **Test 17.1**: Couple has used 2 recoveries in January
- [ ] **Test 17.2**: February 1st arrives (monthly reset)
- [ ] **Test 17.3**: Recovery count resets to 0
- [ ] **Test 17.4**: Couple can use recoveries again

### User Flow 6: Edge Cases
- [ ] **Test 18.1**: User tries `/love` twice in same day - sees "already completed"
- [ ] **Test 18.2**: Both partners use `/love` simultaneously - no race condition
- [ ] **Test 18.3**: Couple divorces - streak data persists (but not accessible)
- [ ] **Test 18.4**: Couple remarries - new streak starts from 0
- [ ] **Test 18.5**: Midnight boundary - completion before/after resets correctly

## Test Data
**What data do we use for testing?**

### Test Fixtures

#### Fixture 1: Mock Marriage Data
```typescript
const mockMarriage = {
  id: 'marriage-uuid-1',
  user1_id: 'user1-discord-id',
  user2_id: 'user2-discord-id',
  guild_id: 'guild-discord-id',
  married_at: new Date('2024-01-01'),
};
```

#### Fixture 2: Mock Streak Data (New)
```typescript
const mockStreakNew = {
  id: 'streak-uuid-1',
  marriage_id: 'marriage-uuid-1',
  current_streak: 0,
  best_streak: 0,
  total_days: 0,
  user1_completed_today: false,
  user2_completed_today: false,
  last_completed_date: null,
  recoveries_used_this_month: 0,
  last_recovery_reset_date: new Date('2024-01-01'),
};
```

#### Fixture 3: Mock Streak Data (Active)
```typescript
const mockStreakActive = {
  id: 'streak-uuid-2',
  marriage_id: 'marriage-uuid-1',
  current_streak: 5,
  best_streak: 10,
  total_days: 15,
  user1_completed_today: true,
  user2_completed_today: false,
  last_completed_date: new Date('2024-01-14'),
  recoveries_used_this_month: 1,
  last_recovery_reset_date: new Date('2024-01-01'),
};
```

#### Fixture 4: Mock Discord Interaction
```typescript
const mockInteraction = {
  user: { id: 'user1-discord-id', displayName: 'User1' },
  guild: { id: 'guild-discord-id' },
  options: {
    getUser: jest.fn(),
  },
  reply: jest.fn(),
  editReply: jest.fn(),
  client: mockClient,
};
```

### Seed Data Requirements
- At least 2 test users in Discord test server
- Test users must be able to marry each other
- Emoji IDs must exist in test server (emoji_43~1, emoji_48, emoji_57)
- Test database with migrations applied

### Test Database Setup
```sql
-- Setup script for test database
-- Run before each test suite

-- Create test marriage
INSERT INTO marriages (id, user1_id, user2_id, guild_id, married_at)
VALUES ('test-marriage-1', 'user1-id', 'user2-id', 'guild-id', NOW());

-- Create test streak
INSERT INTO love_streaks (id, marriage_id, current_streak, best_streak, total_days)
VALUES ('test-streak-1', 'test-marriage-1', 0, 0, 0);

-- Cleanup script (run after each test)
DELETE FROM love_streaks WHERE id LIKE 'test-%';
DELETE FROM marriages WHERE id LIKE 'test-%';
```

## Test Reporting & Coverage
**How do we verify and communicate test results?**

### Coverage Commands and Thresholds
```bash
# Run all tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- loveStreakService.test.ts --coverage

# Alternative command
npx vitest run --coverage
```

### Coverage Results (2026-01-10)
```
-------------------|---------|----------|---------|---------|
File               | % Stmts | % Branch | % Funcs | % Lines |
-------------------|---------|----------|---------|---------|
All files          |     100 |      100 |     100 |     100 |
 commands          |     100 |      100 |     100 |     100 |
  love.ts          |     100 |      100 |     100 |     100 |
 services          |     100 |      100 |     100 |     100 |
  cleanupService.ts|     100 |      100 |     100 |     100 |
  loveStreakSvc.ts |     100 |      100 |     100 |     100 |
-------------------|---------|----------|---------|---------|
```

### Coverage Gaps
**Target**: ✅ 100% coverage achieved!

**All branches covered including**:
- Emoji fallback when `formatEmojiFromGuildByName` returns null
- Username fallback when `displayName` is empty
- User2 recovery scenario (branch in `handleMissedDay`)
- Error handling in all database operations
- All command status handlers (including default case)

### Links to Test Reports
- Local: `coverage/lcov-report/index.html` (generated after test run)
- CI/CD: Link to be added when CI is set up

### Manual Testing Outcomes
**Manual Test Checklist**:
- [ ] `/love` command appears in Discord command list
- [ ] Command works for married users
- [ ] Command shows error for non-married users
- [ ] Streak Box displays correctly on desktop
- [ ] Streak Box displays correctly on mobile
- [ ] Emojis render correctly (not showing as :emoji_name:)
- [ ] Success messages are clear and informative
- [ ] Recovery messages show correct remaining count
- [ ] Failure messages display broken heart emoji
- [ ] `/giaykh` shows streak in footer
- [ ] `/status` shows streak in fields
- [ ] Timezone behavior is consistent (UTC+7 Vietnam timezone)

**Sign-off**: [Pending manual testing]

### Automated Test Sign-off
- **Date**: 2026-01-10
- **Tests**: 92 passing
- **Coverage**: 100% (statements, branches, functions, lines)
- **Status**: ✅ Ready for manual testing

## Manual Testing
**What requires human validation?**

### UI/UX Testing Checklist
- [ ] **Visual Design**: Streak Box is visually appealing and easy to read
- [ ] **Emoji Rendering**: All emojis display correctly (not as text)
- [ ] **Color Coding**: Green for complete, yellow for waiting is clear
- [ ] **Message Clarity**: All messages are understandable to users
- [ ] **Vietnamese Language**: All translations are grammatically correct
- [ ] **Mobile Experience**: Embeds display well on mobile Discord app
- [ ] **Desktop Experience**: Embeds display well on desktop Discord app
- [ ] **Accessibility**: Color blind users can understand status (emojis help)

### Browser/Device Compatibility
- [ ] **Discord Desktop App** (Windows, macOS, Linux)
- [ ] **Discord Mobile App** (iOS, Android)
- [ ] **Discord Web** (Chrome, Firefox, Safari, Edge)

### Smoke Tests After Deployment
- [ ] Bot is online and responding
- [ ] `/love` command is registered and visible
- [ ] Database connection is working
- [ ] Cron jobs are scheduled and running
- [ ] No errors in logs
- [ ] Test with real users in production server

## Performance Testing
**How do we validate performance?**

### Load Testing Scenarios

#### Scenario 1: Concurrent Command Usage
- **Test**: 50 users use `/love` simultaneously
- **Expected**: All commands complete within 5 seconds
- **Metric**: Average response time < 3 seconds

#### Scenario 2: Daily Reset with Large Dataset
- **Test**: Daily reset job with 1000 active streaks
- **Expected**: Job completes within 5 minutes
- **Metric**: Process all records without timeout

#### Scenario 3: Database Query Performance
- **Test**: Query streak by marriage_id with 10,000 records
- **Expected**: Query completes within 100ms
- **Metric**: Index usage confirmed in query plan

### Stress Testing Approach
- **Test**: 200 simultaneous `/love` commands
- **Expected**: No crashes, graceful degradation if needed
- **Metric**: Error rate < 1%

### Performance Benchmarks
- **Command Response**: < 3 seconds (95th percentile)
- **Database Query**: < 500ms (99th percentile)
- **Cron Job**: < 5 minutes for 1000 records
- **Memory Usage**: < 100MB increase per 1000 active streaks

## Bug Tracking
**How do we manage issues?**

### Issue Tracking Process
1. **Discovery**: Bug found during testing
2. **Documentation**: Create issue with reproduction steps
3. **Prioritization**: Assign severity level
4. **Assignment**: Assign to developer
5. **Fix**: Implement fix and add regression test
6. **Verification**: Verify fix in test environment
7. **Closure**: Close issue after verification

### Bug Severity Levels

**Critical (P0)**: Blocks core functionality
- Example: `/love` command crashes bot
- Example: Streak data is corrupted
- **SLA**: Fix within 24 hours

**High (P1)**: Major feature broken
- Example: Recovery logic doesn't work
- Example: Streak doesn't increment when both complete
- **SLA**: Fix within 3 days

**Medium (P2)**: Minor feature issue
- Example: Wrong emoji displays
- Example: Message formatting is off
- **SLA**: Fix within 1 week

**Low (P3)**: Cosmetic issue
- Example: Typo in message
- Example: Color is slightly off
- **SLA**: Fix in next release

### Regression Testing Strategy
- **Automated**: Run full test suite on every commit
- **Manual**: Run smoke tests before each deployment
- **Continuous**: Monitor logs for errors in production
- **Periodic**: Full manual testing monthly

## Test Execution Plan
**Order of test execution:**

1. **Unit Tests** (Phase 1)
   - Run during development
   - Must pass before moving to integration tests
   - Target: 100% coverage

2. **Integration Tests** (Phase 2)
   - Run after unit tests pass
   - Test service interactions
   - Verify database operations

3. **End-to-End Tests** (Phase 3)
   - Run after integration tests pass
   - Test complete user workflows
   - Verify all features work together

4. **Manual Tests** (Phase 4)
   - Run in test Discord server
   - Verify UI/UX
   - Test on multiple devices

5. **Performance Tests** (Phase 5)
   - Run after manual tests pass
   - Verify performance benchmarks
   - Load and stress testing

6. **Smoke Tests** (Phase 6)
   - Run in production after deployment
   - Verify basic functionality
   - Monitor for errors

## Test Sign-off Criteria
**Feature is ready for production when:**

- [ ] All unit tests pass (100% coverage)
- [ ] All integration tests pass
- [ ] All end-to-end tests pass
- [ ] All manual tests pass
- [ ] All performance benchmarks met
- [ ] No critical or high severity bugs
- [ ] Code reviewed and approved
- [ ] Documentation complete
- [ ] Smoke tests pass in production

---
phase: testing
title: Testing Strategy
description: Define testing approach, test cases, and quality assurance
---

# Testing Strategy

## Test Coverage Goals
**What level of testing do we aim for?**

- Unit test coverage target: 100% of new code (AttendanceService, diemdanh command, checkdd command)
- Integration test scope: Command execution with database queries, voice state detection
- End-to-end test scenarios: Full user workflows (take attendance, check attendance, view status)
- Alignment with requirements/design acceptance criteria: All acceptance criteria must be testable

## Unit Tests
**What individual components need testing?**

### AttendanceService Component
- [ ] Test `recordAttendance()` with multiple users
  - Creates correct number of records
  - Stores correct user IDs, channel IDs, guild ID, date
  - Returns correct count
- [ ] Test `recordAttendance()` with empty map
  - Handles empty input gracefully
  - Returns 0 count
- [ ] Test `recordAttendance()` with database error
  - Handles database errors gracefully
  - Throws appropriate error
- [ ] Test `getAttendanceByDate()` with existing records
  - Returns correct records for date
  - Groups by user correctly
  - Includes channel information
- [ ] Test `getAttendanceByDate()` with no records
  - Returns empty array
  - Handles gracefully
- [ ] Test `getAttendanceByDate()` with invalid date
  - Handles invalid date format
  - Returns appropriate error
- [ ] Test `getUserAttendanceStats()` with multiple attendance days
  - Returns correct total days count
  - Returns correct last attendance date
- [ ] Test `getUserAttendanceStats()` with no attendance
  - Returns 0 total days
  - Returns null for last attendance date
- [ ] Test date formatting helpers
  - Current date format is correct (YYYY-MM-DD)
  - Date validation works correctly

### DiemDanh Command Component
- [ ] Test command execution with users in voice channels
  - Detects users correctly
  - Calls attendance service correctly
  - Returns confirmation message with count
- [ ] Test command execution with no users in voice channels
  - Returns appropriate error message
  - Handles gracefully
- [ ] Test command execution with bots in channels
  - Optionally filters out bots
  - Handles bot filtering correctly
- [ ] Test error handling for permission errors
  - Returns appropriate error message
  - Handles gracefully
- [ ] Test error handling for database errors
  - Returns user-friendly error
  - Logs error for debugging

### CheckDD Command Component
- [ ] Test command execution with date parameter
  - Parses date correctly
  - Queries attendance service correctly
  - Returns embed with results
- [ ] Test command execution without date parameter
  - Defaults to today
  - Queries correctly
- [ ] Test command execution with invalid date format
  - Returns error message
  - Handles gracefully
- [ ] Test command execution with future date
  - Returns error message
  - Handles gracefully
- [ ] Test command execution with no records
  - Returns appropriate message
  - Handles gracefully
- [ ] Test embed formatting
  - Embed contains correct information
  - Embed is properly formatted

### Status Service Extension
- [ ] Test `getUserStatus()` includes attendance stats
  - Returns attendance statistics
  - Handles users with no attendance
- [ ] Test `formatStatusEmbed()` includes attendance fields
  - Embed contains attendance information
  - Handles missing attendance gracefully
- [ ] Test attendance display formatting
  - Dates formatted correctly
  - Counts displayed correctly

## Integration Tests
**How do we test component interactions?**

- [ ] Integration test: DiemDanh Command → Attendance Service → Database
  - Command detects voice states correctly
  - Service stores records correctly
  - Database contains correct data
- [ ] Integration test: CheckDD Command → Attendance Service → Database
  - Command parses date correctly
  - Service queries database correctly
  - Results formatted correctly
- [ ] Integration test: Status Command → Status Service → Attendance Service → Database
  - Status service queries attendance correctly
  - Attendance stats included in status
  - Embed formatted correctly
- [ ] Integration test: Voice State Detection → Attendance Recording
  - Voice states detected correctly
  - Records created for all users
  - Handles users leaving during execution
- [ ] Integration test: Error handling flow
  - Database error → Service → Command → User
  - Error message is user-friendly
  - Error is logged

## End-to-End Tests
**What user flows need validation?**

- [ ] User flow 1: Take attendance with users in voice channels
  - Execute `/diemdanh`
  - Verify users are recorded
  - Verify confirmation message
  - Verify database contains records
- [ ] User flow 2: Take attendance with no users
  - Execute `/diemdanh`
  - Verify error message
  - Verify no records created
- [ ] User flow 3: Check attendance for today
  - Execute `/checkdd`
  - Verify today's records displayed
  - Verify embed format
- [ ] User flow 4: Check attendance for specific date
  - Execute `/checkdd 2024-01-15`
  - Verify records for that date displayed
  - Verify correct date in embed
- [ ] User flow 5: Check attendance with no records
  - Execute `/checkdd 2024-01-01` (date with no records)
  - Verify "no records" message
- [ ] User flow 6: Check status with attendance
  - Execute `/status`
  - Verify attendance statistics displayed
  - Verify total days and last date
- [ ] User flow 7: Multiple users in multiple channels
  - Have users in different voice channels
  - Execute `/diemdanh`
  - Verify all users recorded
  - Verify correct channel IDs stored
- [ ] Critical path testing: All scenarios work correctly
- [ ] Regression: Existing commands still work (status, marriage, etc.)

## Test Data
**What data do we use for testing?**

**Test fixtures and mocks:**
- Mock Discord guild with voice states
- Mock voice state objects
- Mock interaction objects
- Mock Prisma client responses
- Test dates (today, past dates, future dates)

**Seed data requirements:**
- Test users in voice channels
- Test attendance records in database
- Test dates: today, yesterday, last week
- Test users with multiple attendance days
- Test users with no attendance

**Test database setup:**
- Use test database or mock Prisma client
- Clean up test data after tests
- Use transactions for test isolation
- Seed test data before tests

## Test Reporting & Coverage
**How do we verify and communicate test results?**

- Coverage commands: `npm run test -- --coverage`
- Coverage threshold: 100% for new code
- Coverage gaps: Document any gaps with rationale
- Manual testing: Document outcomes in this file

## Manual Testing
**What requires human validation?**

**UI/UX testing checklist:**
- [ ] DiemDanh command confirmation message is clear
- [ ] CheckDD embed is readable and well-formatted
- [ ] Status embed includes attendance information clearly
- [ ] Dates are formatted correctly (readable format)
- [ ] Error messages are clear and helpful
- [ ] Commands respond within acceptable time (< 3 seconds)

**Voice channel testing:**
- [ ] Bot detects users in voice channels correctly
- [ ] Bot handles users leaving during command execution
- [ ] Bot handles multiple voice channels correctly
- [ ] Bot handles empty voice channels correctly
- [ ] Bot permission errors are clear

**Date handling testing:**
- [ ] Date format validation works correctly
- [ ] Default to today works correctly
- [ ] Future date validation works correctly
- [ ] Date parsing handles edge cases (leap years, etc.)

**Smoke tests after deployment:**
- [ ] `/diemdanh` command works
- [ ] `/checkdd` command works
- [ ] `/checkdd` without date works (defaults to today)
- [ ] `/status` shows attendance information
- [ ] No console errors
- [ ] Response times acceptable

## Performance Testing
**How do we validate performance?**

**Load testing scenarios:**
- Multiple users taking attendance simultaneously
- Large number of users in voice channels (50+)
- Checking attendance for dates with many records
- Verify response time < 3 seconds under load

**Stress testing approach:**
- Test with maximum voice channel capacity
- Test with many attendance records in database
- Test batch insert with 100+ users
- Verify no performance degradation

**Performance benchmarks:**
- `/diemdanh` response time: < 3 seconds
- `/checkdd` response time: < 2 seconds
- Database query time: < 500ms
- Voice state detection: < 1 second
- Batch insert (100 users): < 1 second

## Bug Tracking
**How do we manage issues?**

**Issue tracking process:**
- Document bugs in GitHub issues
- Include steps to reproduce
- Include expected vs actual behavior
- Include test environment details

**Bug severity levels:**
- Critical: Commands don't work, data loss
- High: Incorrect data displayed, missing records
- Medium: Formatting issues, error messages unclear
- Low: Minor UI issues, edge cases

**Regression testing strategy:**
- Run all tests before deployment
- Test existing commands still work
- Verify no breaking changes
- Test database migration doesn't break existing data

## Edge Case Testing
**What edge cases need special attention?**

- [ ] User leaves voice channel during `/diemdanh` execution
- [ ] User joins voice channel during `/diemdanh` execution
- [ ] Multiple `/diemdanh` commands executed simultaneously
- [ ] Very old dates (years ago) in attendance records
- [ ] Timezone differences (server vs user timezone)
- [ ] Bot restarts (voice state cache may be empty)
- [ ] Voice channel deleted (channelId becomes invalid)
- [ ] User deleted from server (userId becomes invalid)
- [ ] Database connection lost during operation
- [ ] Invalid date formats (various edge cases)

## Voice State Detection Testing
**What voice state scenarios need testing?**

- [ ] Users in different voice channels
- [ ] Users in same voice channel
- [ ] Users moving between channels
- [ ] Users muted/deafened (should still be counted)
- [ ] Users streaming/sharing screen (should still be counted)
- [ ] Bot in voice channel (optional: include or exclude)
- [ ] Empty voice channels
- [ ] All voice channels empty


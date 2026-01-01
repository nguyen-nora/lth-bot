---
phase: testing
title: Testing Strategy
description: Define testing approach, test cases, and quality assurance
---

# Testing Strategy

## Test Coverage Goals
**What level of testing do we aim for?**

- Unit test coverage target: 100% of new code (StatusService, status command)
- Integration test scope: Command execution with database queries
- End-to-end test scenarios: Full user workflows (check own status, check other user's status)
- Alignment with requirements/design acceptance criteria: All acceptance criteria must be testable

## Unit Tests
**What individual components need testing?**

### StatusService Component
- [ ] Test `getUserStatus()` with married user
  - Returns correct marriage information
  - Returns correct proposal statistics
  - Returns correct rate limit status
- [ ] Test `getUserStatus()` with unmarried user
  - Returns null for marriage
  - Returns correct proposal statistics
  - Returns correct rate limit status
- [ ] Test `getUserStatus()` with no proposals
  - Returns zero counts for all proposal statistics
- [ ] Test `getUserStatus()` with pending proposals
  - Returns correct pending counts for sent/received
- [ ] Test `formatStatusEmbed()` with married user
  - Embed contains marriage information
  - Embed contains proposal statistics
  - Embed is properly formatted
- [ ] Test `formatStatusEmbed()` with unmarried user
  - Embed shows "Not married"
  - Embed contains proposal statistics
  - Embed is properly formatted
- [ ] Test `formatStatusEmbed()` with null/undefined values
  - Handles missing data gracefully
  - Shows "N/A" or "None" appropriately

### Status Command Component
- [ ] Test command execution without user parameter
  - Defaults to interaction user
  - Calls status service correctly
  - Sends ephemeral response
- [ ] Test command execution with user parameter
  - Uses provided user
  - Validates user parameter
  - Calls status service correctly
- [ ] Test error handling for invalid user
  - Returns error message
  - Handles gracefully
- [ ] Test error handling for database errors
  - Returns user-friendly error
  - Logs error for debugging

## Integration Tests
**How do we test component interactions?**

- [ ] Integration test: Command → Service → Database
  - Command calls service correctly
  - Service queries database correctly
  - Data flows through correctly
- [ ] Integration test: Service → Embed formatting
  - Service formats embed correctly
  - Embed contains all expected fields
  - Embed is sent correctly
- [ ] Integration test: Error handling flow
  - Database error → Service → Command → User
  - Error message is user-friendly
  - Error is logged

## End-to-End Tests
**What user flows need validation?**

- [ ] User flow 1: Check own status (married)
  - Execute `/status`
  - Verify marriage information displayed
  - Verify proposal statistics displayed
  - Verify embed format
- [ ] User flow 2: Check own status (unmarried)
  - Execute `/status`
  - Verify "Not married" displayed
  - Verify proposal statistics displayed
- [ ] User flow 3: Check other user's status
  - Execute `/status @user`
  - Verify target user's information displayed
  - Verify ephemeral response (only visible to command user)
- [ ] User flow 4: Check status with no proposals
  - Execute `/status` for user with no proposals
  - Verify zero counts displayed
  - Verify no errors
- [ ] Critical path testing: All scenarios work correctly
- [ ] Regression: Existing commands still work

## Test Data
**What data do we use for testing?**

**Test fixtures and mocks:**
- Mock Discord user objects
- Mock interaction objects
- Mock Prisma client responses

**Seed data requirements:**
- Test user with marriage
- Test user without marriage
- Test user with proposals (sent/received)
- Test user with no proposals
- Test user with pending proposals

**Test database setup:**
- Use test database or mock Prisma client
- Clean up test data after tests
- Use transactions for test isolation

## Test Reporting & Coverage
**How do we verify and communicate test results?**

- Coverage commands: `npm run test -- --coverage`
- Coverage threshold: 100% for new code
- Coverage gaps: Document any gaps with rationale
- Manual testing: Document outcomes in this file

## Manual Testing
**What requires human validation?**

**UI/UX testing checklist:**
- [ ] Embed is readable and well-formatted
- [ ] Colors are appropriate (pink theme)
- [ ] Dates are formatted correctly
- [ ] Numbers are formatted correctly
- [ ] "N/A" or "None" displayed for missing data
- [ ] Ephemeral response works (only visible to command user)
- [ ] Error messages are clear and helpful

**Browser/device compatibility:**
- N/A (Discord bot, not web app)

**Smoke tests after deployment:**
- [ ] `/status` command works
- [ ] `/status @user` command works
- [ ] No console errors
- [ ] Response time < 2 seconds

## Performance Testing
**How do we validate performance?**

**Load testing scenarios:**
- Multiple users checking status simultaneously
- Verify response time < 2 seconds under load

**Stress testing approach:**
- Test with high proposal counts
- Test with complex marriage data
- Verify no performance degradation

**Performance benchmarks:**
- Command response time: < 2 seconds
- Database query time: < 500ms
- Embed rendering time: < 100ms

## Bug Tracking
**How do we manage issues?**

**Issue tracking process:**
- Document bugs in GitHub issues
- Include steps to reproduce
- Include expected vs actual behavior

**Bug severity levels:**
- Critical: Command doesn't work
- High: Incorrect data displayed
- Medium: Formatting issues
- Low: Minor UI issues

**Regression testing strategy:**
- Run all tests before deployment
- Test existing commands still work
- Verify no breaking changes


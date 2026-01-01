---
phase: testing
title: Testing Strategy
description: Define testing approach, test cases, and quality assurance
---

# Testing Strategy

## Test Coverage Goals
**What level of testing do we aim for?**

- **Unit test coverage target**: 100% of new/changed code
  - Marriage service methods
  - Channel manager methods
  - Command handlers
  - Database operations

- **Integration test scope**: Critical paths + error handling
  - Full proposal flow (command → DM → button → announcement)
  - Divorce flow
  - Error scenarios (DM failures, permission errors)

- **End-to-end test scenarios**: Key user journeys
  - Successful marriage proposal and acceptance
  - Proposal decline
  - Divorce scenarios
  - Error handling

- **Alignment with requirements/design acceptance criteria**: All acceptance criteria must be testable and verified

## Unit Tests
**What individual components need testing?**

### Component: Marriage Service (`src/services/marriageService.ts`)
- [ ] **Test case 1**: Create proposal successfully
  - Covers: Proposal creation, database insertion
  - **Test**: Create proposal, verify in database

- [ ] **Test case 2**: Handle proposal acceptance
  - Covers: Update proposal state, check if both accepted
  - **Test**: Accept proposal, verify state update

- [ ] **Test case 3**: Handle proposal decline
  - Covers: Update proposal state, mark as declined
  - **Test**: Decline proposal, verify state

- [ ] **Test case 4**: Create marriage from accepted proposal
  - Covers: Both users accepted, create marriage record
  - **Test**: Both accept, verify marriage created

- [ ] **Test case 5**: Get marriage by user
  - Covers: Query marriage, return correct marriage
  - **Test**: Query married user, verify correct marriage returned

- [ ] **Test case 6**: Divorce functionality
  - Covers: Remove marriage, handle unilateral/mutual
  - **Test**: Divorce, verify marriage removed

- [ ] **Test case 7**: Prevent duplicate proposals
  - Covers: Validation, prevent duplicate
  - **Test**: Try to create duplicate proposal, verify error

- [ ] **Test case 8**: Prevent self-marriage
  - Covers: Validation, prevent self-proposal
  - **Test**: Try to propose to self, verify error

### Component: Channel Manager (`src/services/channelManager.ts`)
- [ ] **Test case 1**: Get existing notification channel
  - Covers: Query database, return channel ID
  - **Test**: Channel exists, verify correct ID returned

- [ ] **Test case 2**: Create notification channel if doesn't exist
  - Covers: Channel creation, save to database
  - **Test**: Channel doesn't exist, verify creation and save

- [ ] **Test case 3**: Handle channel creation permission error
  - Covers: Permission check, error handling
  - **Test**: No permission, verify error handled

### Component: Kethon Command (`src/commands/kethon.ts`)
- [ ] **Test case 1**: Command validates user input
  - Covers: User mention validation
  - **Test**: Valid user, invalid user, self, bot

- [ ] **Test case 2**: Command creates proposal
  - Covers: Proposal creation, DM sending
  - **Test**: Valid proposal, verify proposal created

- [ ] **Test case 3**: Command handles errors
  - Covers: Already married, duplicate proposal
  - **Test**: Error cases, verify error messages

### Component: Divorce Command (`src/commands/divorce.ts`)
- [ ] **Test case 1**: Command validates user is married
  - Covers: Marriage check
  - **Test**: Married user, unmarried user

- [ ] **Test case 2**: Command executes divorce
  - Covers: Divorce execution, database update
  - **Test**: Divorce, verify marriage removed

## Integration Tests
**How do we test component interactions?**

- [ ] **Integration scenario 1**: Full proposal and acceptance flow
  - **Test**: User A proposes to User B → Both receive DMs → User B accepts → User A accepts → Marriage announced
  - **Verify**: All steps work, marriage created, announcement sent

- [ ] **Integration scenario 2**: Proposal decline flow
  - **Test**: User A proposes → User B declines → Both receive rejection messages
  - **Verify**: Rejection messages sent, proposal removed, no announcement

- [ ] **Integration scenario 3**: Divorce flow
  - **Test**: Married users → One user divorces → Marriage removed silently
  - **Verify**: Marriage removed, no announcement, confirmation sent

- [ ] **Integration scenario 4**: Channel creation and announcement
  - **Test**: No notification channel → Proposal accepted → Channel created → Announcement sent
  - **Verify**: Channel created, announcement in correct channel

- [ ] **Integration scenario 5**: Error recovery
  - **Test**: DM failure → Channel creation failure → Permission errors
  - **Verify**: Errors handled gracefully, user receives feedback

## End-to-End Tests
**What user flows need validation?**

- [ ] **User flow 1**: Successful marriage
  - **Description**: User proposes, both accept, marriage announced
  - **Steps**: 
    1. User A executes `/kethon @UserB`
    2. Both users receive DMs
    3. User B clicks accept
    4. User A clicks accept
    5. Marriage announced in channel
  - **Expected**: Marriage successful, announcement visible

- [ ] **User flow 2**: Proposal declined
  - **Description**: User proposes, one declines
  - **Steps**:
    1. User A executes `/kethon @UserB`
    2. Both users receive DMs
    3. User B clicks decline
    4. Both receive rejection messages
  - **Expected**: No marriage, rejection messages sent (anonymous)

- [ ] **User flow 3**: Divorce
  - **Description**: Married user divorces
  - **Steps**:
    1. User executes `/divorce`
    2. Marriage removed
    3. Confirmation sent
  - **Expected**: Marriage removed, no announcement

- [ ] **User flow 4**: Error handling
  - **Description**: User with DMs disabled tries to use feature
  - **Steps**:
    1. User with DMs disabled executes `/kethon @UserB`
    2. Bot tries to send DM
    3. DM fails
  - **Expected**: Error message in channel, feature fails gracefully

## Test Data
**What data do we use for testing?**

**Test fixtures and mocks:**
- Mock Discord users (test accounts)
- Mock Discord guild/server
- Mock Discord channels
- Test database (separate from production)

**Seed data requirements:**
- Test marriages in database
- Test proposals in database
- Test notification channels

**Test database setup:**
- Use separate test database file: `data/test-database.sqlite`
- Clean up test data after tests
- Or use in-memory database for unit tests

## Test Reporting & Coverage
**How do we verify and communicate test results?**

**Coverage commands and thresholds:**
- Run tests: `npm test` (when test framework added)
- Coverage report: `npm run test:coverage`
- Coverage threshold: 100% for new code
- View coverage: Open coverage report

**Coverage gaps:**
- Document any files/functions below 100% coverage
- Provide rationale for gaps

**Manual testing outcomes and sign-off:**
- Document manual test results
- Sign-off checklist:
  - [ ] `/kethon` command works
  - [ ] DMs sent correctly
  - [ ] Buttons work
  - [ ] Announcements work
  - [ ] Divorce works
  - [ ] Error handling works

## Manual Testing
**What requires human validation?**

**UI/UX testing checklist:**
- [ ] `/kethon` command appears in Discord
- [ ] Command autocomplete works
- [ ] DMs are clear and well-formatted
- [ ] Buttons are clearly labeled
- [ ] Announcements are formatted nicely
- [ ] Error messages are user-friendly

**Discord-specific testing:**
- [ ] Test with multiple users
- [ ] Test with users who have DMs disabled
- [ ] Test in different servers
- [ ] Test with different bot permissions

**Smoke tests after deployment:**
- [ ] Bot starts without errors
- [ ] Commands register correctly
- [ ] Database operations work
- [ ] No console errors

## Performance Testing
**How do we validate performance?**

**Load testing scenarios:**
- Multiple simultaneous proposals
- Rapid button clicks
- Multiple divorces

**Stress testing approach:**
- Test with many pending proposals
- Test with many marriages
- Test database query performance

**Performance benchmarks:**
- Command response: < 500ms ✅
- DM delivery: < 2 seconds ✅
- Button interaction: < 200ms ✅
- Database queries: < 100ms ✅

## Bug Tracking
**How do we manage issues?**

**Issue tracking process:**
- Document bugs found during testing
- Prioritize by severity
- Fix before considering feature complete

**Bug severity levels:**
- **Critical**: Commands don't work, database errors
- **High**: Buttons don't work, DMs not sent
- **Medium**: Error messages unclear, edge cases
- **Low**: UI/formatting issues

**Regression testing strategy:**
- Re-run all tests after bug fixes
- Verify fix doesn't break existing functionality
- Update test cases if needed


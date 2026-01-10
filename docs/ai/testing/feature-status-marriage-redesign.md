---
phase: testing
title: Testing Strategy
description: Define testing approach, test cases, and quality assurance
---

# Testing Strategy

## Test Coverage Goals
**What level of testing do we aim for?**

- **Unit test coverage target:** 100% of new/changed code
- **Integration test scope:** All command flows + service interactions + error handling
- **End-to-end test scenarios:** Key user journeys (status update, image upload, certificate viewing)
- **Alignment with requirements:** All user stories (US-1 through US-8) must have corresponding tests
- **Regression testing:** Verify existing commands (marriage, divorce, attendance) still work

## Unit Tests
**What individual components need testing?**

### ImageService (`src/services/imageService.ts`)
- [ ] **Test: validateImage() - valid formats**
  - Input: JPG, PNG, GIF, WebP attachments
  - Expected: Returns true
  - Coverage: Happy path validation

- [ ] **Test: validateImage() - invalid formats**
  - Input: PDF, TXT, MP4 attachments
  - Expected: Throws error with message "Invalid image format"
  - Coverage: Error handling for unsupported types

- [ ] **Test: validateImage() - file size limits**
  - Input: 10MB image (over 8MB limit)
  - Expected: Throws error "Image too large"
  - Coverage: Size validation edge case

- [ ] **Test: cropToSquare() - landscape image**
  - Input: 1920x1080 image buffer
  - Expected: Returns 480x480 buffer, center cropped
  - Coverage: Aspect ratio handling

- [ ] **Test: cropToSquare() - portrait image**
  - Input: 1080x1920 image buffer
  - Expected: Returns 480x480 buffer, center cropped
  - Coverage: Aspect ratio handling

- [ ] **Test: cropToSquare() - already square**
  - Input: 1000x1000 image buffer
  - Expected: Returns 480x480 buffer, resized
  - Coverage: Square image optimization

- [ ] **Test: processImage() - full flow**
  - Input: Valid attachment
  - Expected: Returns Discord CDN URL
  - Coverage: End-to-end image processing

- [ ] **Test: processImage() - network error**
  - Input: Attachment with invalid URL
  - Expected: Throws error
  - Coverage: Network failure handling

### ProfileService (`src/services/profileService.ts`)
- [ ] **Test: getProfile() - new user**
  - Input: userId, guildId (no existing profile)
  - Expected: Creates and returns profile with status "single"
  - Coverage: Profile creation

- [ ] **Test: getProfile() - existing user**
  - Input: userId, guildId (existing profile)
  - Expected: Returns existing profile without creating new
  - Coverage: Idempotent behavior

- [ ] **Test: setStatus() - valid status**
  - Input: userId, guildId, status "married"
  - Expected: Updates profile, returns updated profile
  - Coverage: Status update happy path

- [ ] **Test: setStatus() - invalid status**
  - Input: userId, guildId, status "invalid"
  - Expected: Throws error "Invalid status"
  - Coverage: Validation error

- [ ] **Test: setStatusImage() - valid URL**
  - Input: userId, guildId, imageUrl
  - Expected: Updates profile with image URL
  - Coverage: Image URL update

- [ ] **Test: setStatusImage() - null URL (remove image)**
  - Input: userId, guildId, imageUrl = null
  - Expected: Clears image URL
  - Coverage: Image removal

- [ ] **Test: getFullProfile() - complete data**
  - Input: userId, guildId (has profile, marriage, attendance)
  - Expected: Returns all joined data
  - Coverage: Data aggregation

- [ ] **Test: getFullProfile() - partial data**
  - Input: userId, guildId (has profile, no marriage)
  - Expected: Returns profile with null marriage
  - Coverage: Null handling

### MarriageService Extensions (`src/services/marriageService.ts`)
- [ ] **Test: getCertificate() - existing certificate**
  - Input: marriageId
  - Expected: Returns certificate data
  - Coverage: Certificate retrieval

- [ ] **Test: getCertificate() - no certificate**
  - Input: marriageId (no certificate exists)
  - Expected: Creates and returns new certificate
  - Coverage: Auto-creation behavior

- [ ] **Test: setUserMessage() - user1 updates**
  - Input: marriageId, user1Id, "My message"
  - Expected: Updates user1Message field
  - Coverage: User1 message update

- [ ] **Test: setUserMessage() - user2 updates**
  - Input: marriageId, user2Id, "My message"
  - Expected: Updates user2Message field
  - Coverage: User2 message update

- [ ] **Test: setUserMessage() - unauthorized user**
  - Input: marriageId, randomUserId, "Message"
  - Expected: Throws error "Unauthorized"
  - Coverage: Authorization check

- [ ] **Test: setUserMessage() - message too long**
  - Input: marriageId, userId, 501-char message
  - Expected: Throws error "Message too long"
  - Coverage: Length validation

- [ ] **Test: setCertificateImage() - valid URL**
  - Input: marriageId, imageUrl
  - Expected: Updates certificate image URL
  - Coverage: Image update

- [ ] **Test: calculateMarriageDuration() - same day**
  - Input: marriedAt = today
  - Expected: { days: 0, formatted: "0 ngày" }
  - Coverage: Edge case - married today

- [ ] **Test: calculateMarriageDuration() - 30 days**
  - Input: marriedAt = 30 days ago
  - Expected: { days: 30, formatted: "30 ngày" }
  - Coverage: Standard duration calculation

- [ ] **Test: calculateMarriageDuration() - 1 year**
  - Input: marriedAt = 365 days ago
  - Expected: { days: 365, formatted: "365 ngày" }
  - Coverage: Long duration

- [ ] **Test: createMarriage() - auto-creates certificate**
  - Input: user1Id, user2Id, guildId, channelId
  - Expected: Creates marriage AND certificate
  - Coverage: Certificate auto-creation

### StatusService Updates (`src/services/statusService.ts`)
- [ ] **Test: getUserStatus() - with profile**
  - Input: userId, guildId (has profile)
  - Expected: Returns status including profile data
  - Coverage: Profile integration

- [ ] **Test: getUserStatus() - no profile**
  - Input: userId, guildId (no profile)
  - Expected: Returns status with default "single"
  - Coverage: Fallback behavior

- [ ] **Test: formatStatusEmbed() - with custom status**
  - Input: status with relationshipStatus "married"
  - Expected: Embed shows "married" status
  - Coverage: Status display

- [ ] **Test: formatStatusEmbed() - with custom image**
  - Input: status with statusImageUrl
  - Expected: Embed includes image
  - Coverage: Image display

- [ ] **Test: formatStatusEmbed() - no custom data**
  - Input: status with no profile data
  - Expected: Embed shows defaults
  - Coverage: Default display

## Integration Tests
**How do we test component interactions?**

### Status Command Flow
- [ ] **Integration: View own status**
  - Flow: User runs `/status` → ProfileService → StatusService → Embed
  - Verify: Embed shows correct user data
  - Coverage: US-1 (view profile)

- [ ] **Integration: View other user's status**
  - Flow: User runs `/status @user` → Fetch target user → Display
  - Verify: Shows target user's data, not command user
  - Coverage: US-4 (view others)

- [ ] **Integration: Set status**
  - Flow: User runs `/status set married` → ProfileService → Success
  - Verify: Status updated in database
  - Coverage: US-2 (set status)

- [ ] **Integration: Upload status image**
  - Flow: User runs `/status image [file]` → ImageService → ProfileService → Success
  - Verify: Image processed, URL saved, displayed in status
  - Coverage: US-3 (upload image)

### Certificate Command Flow
- [ ] **Integration: View certificate when married**
  - Flow: User runs `/giaykh` → MarriageService → Certificate embed
  - Verify: Shows marriage date, duration, messages
  - Coverage: US-5 (view certificate)

- [ ] **Integration: View certificate when not married**
  - Flow: User runs `/giaykh` → MarriageService → Error
  - Verify: Error message "You are not married"
  - Coverage: Error handling

- [ ] **Integration: Set certificate message**
  - Flow: User runs `/giaykh message "Love you"` → MarriageService → Success
  - Verify: Message saved, displayed in certificate
  - Coverage: US-6 (add message)

- [ ] **Integration: Upload certificate image**
  - Flow: User runs `/giaykh image [file]` → ImageService → MarriageService → Success
  - Verify: Image processed, URL saved, displayed in certificate
  - Coverage: US-8 (customize certificate)

### Marriage Integration
- [ ] **Integration: Marriage creates certificate**
  - Flow: User proposes → Partner accepts → Marriage + Certificate created
  - Verify: Certificate exists with null messages
  - Coverage: Auto-creation

- [ ] **Integration: Divorce deletes certificate**
  - Flow: User divorces → Marriage deleted → Certificate deleted
  - Verify: Certificate cascade deleted
  - Coverage: Cleanup

### Error Scenarios
- [ ] **Integration: Invalid image format**
  - Flow: User uploads PDF as status image → Validation error
  - Verify: Error message, no database change
  - Coverage: Validation

- [ ] **Integration: Image too large**
  - Flow: User uploads 10MB image → Size validation error
  - Verify: Error message, no processing
  - Coverage: Size limit

- [ ] **Integration: Unauthorized certificate update**
  - Flow: User tries to update someone else's certificate → Error
  - Verify: Error message "Unauthorized"
  - Coverage: Authorization

- [ ] **Integration: Rate limiting**
  - Flow: User updates status 3 times in 1 minute → Rate limit error
  - Verify: Error message, last update not saved
  - Coverage: Rate limiting

## End-to-End Tests
**What user flows need validation?**

### E2E Flow 1: Complete Status Customization
- [ ] **Step 1:** New user joins server
- [ ] **Step 2:** User runs `/status` → sees default "single" status
- [ ] **Step 3:** User runs `/status set dating` → success message
- [ ] **Step 4:** User runs `/status image [upload]` → image processed
- [ ] **Step 5:** User runs `/status` → sees "dating" status with custom image
- [ ] **Step 6:** Another user runs `/status @user` → sees same data
- **Coverage:** US-1, US-2, US-3, US-4

### E2E Flow 2: Marriage Certificate Journey
- [ ] **Step 1:** User A proposes to User B via `/kethon @userB`
- [ ] **Step 2:** User B accepts proposal
- [ ] **Step 3:** Marriage created, certificate auto-created
- [ ] **Step 4:** User A runs `/giaykh` → sees certificate with no messages
- [ ] **Step 5:** User A runs `/giaykh message "Forever together"` → success
- [ ] **Step 6:** User B runs `/giaykh message "Love you always"` → success
- [ ] **Step 7:** User A runs `/giaykh image [upload]` → image uploaded
- [ ] **Step 8:** User A runs `/giaykh` → sees complete certificate
- [ ] **Step 9:** User B runs `/giaykh` → sees same certificate
- **Coverage:** US-5, US-6, US-7, US-8

### E2E Flow 3: Status Independence from Marriage
- [ ] **Step 1:** User is married (via `/kethon`)
- [ ] **Step 2:** User runs `/status set single` → success
- [ ] **Step 3:** User runs `/status` → shows "single" status
- [ ] **Step 4:** User runs `/giaykh` → still shows marriage certificate
- [ ] **Step 5:** User divorces via `/lyhon`
- [ ] **Step 6:** User runs `/status` → still shows "single" (unchanged)
- [ ] **Step 7:** User runs `/giaykh` → error "not married"
- **Coverage:** Status/marriage independence requirement

### E2E Flow 4: Error Handling Journey
- [ ] **Step 1:** User runs `/giaykh` (not married) → error message
- [ ] **Step 2:** User runs `/status image [PDF file]` → validation error
- [ ] **Step 3:** User runs `/status set invalid` → invalid status error
- [ ] **Step 4:** User runs `/giaykh message [600 chars]` → too long error
- [ ] **Step 5:** User updates status 3x in 1 min → rate limit error
- **Coverage:** Error handling

### Regression Testing
- [ ] **Regression: Existing marriage commands**
  - Verify `/kethon` still works
  - Verify `/lyhon` still works
  - Verify proposal accept/decline still works
  - Coverage: No breaking changes

- [ ] **Regression: Existing status command**
  - Verify `/status` shows attendance data
  - Verify `/status` shows join date
  - Verify `/status` shows marriage info
  - Coverage: Backward compatibility

- [ ] **Regression: Attendance commands**
  - Verify `/diemdanh` still works
  - Verify `/checkdd` still works
  - Coverage: No breaking changes

## Test Data
**What data do we use for testing?**

### Test Fixtures
```typescript
// Mock user profiles
const mockProfiles = {
  user1: {
    userId: 'user1',
    guildId: 'guild1',
    relationshipStatus: 'single',
    statusImageUrl: null
  },
  user2: {
    userId: 'user2',
    guildId: 'guild1',
    relationshipStatus: 'married',
    statusImageUrl: 'https://cdn.discord.com/...'
  }
};

// Mock marriages
const mockMarriages = {
  marriage1: {
    id: 1,
    user1Id: 'user1',
    user2Id: 'user2',
    guildId: 'guild1',
    marriedAt: new Date('2024-01-01')
  }
};

// Mock certificates
const mockCertificates = {
  cert1: {
    id: 1,
    marriageId: 1,
    user1Message: 'My love',
    user2Message: 'Forever',
    certificateImageUrl: 'https://cdn.discord.com/...'
  }
};

// Mock images
const mockImages = {
  validJpg: Buffer.from('...'),
  validPng: Buffer.from('...'),
  invalidPdf: Buffer.from('...'),
  tooLarge: Buffer.alloc(10 * 1024 * 1024) // 10MB
};
```

### Seed Data Requirements
- At least 3 test users with different statuses
- At least 2 test marriages with certificates
- At least 1 user with custom image
- At least 1 user with no profile (for default testing)

### Test Database Setup
```typescript
// Before each test suite
beforeAll(async () => {
  // Create test database
  await prisma.$executeRaw`DELETE FROM user_profiles`;
  await prisma.$executeRaw`DELETE FROM marriage_certificates`;
  await prisma.$executeRaw`DELETE FROM marriages`;
  
  // Seed test data
  await prisma.userProfile.createMany({ data: mockProfiles });
  await prisma.marriage.createMany({ data: mockMarriages });
});

// After each test suite
afterAll(async () => {
  await prisma.$disconnect();
});
```

## Test Reporting & Coverage
**How do we verify and communicate test results?**

### Coverage Commands
```bash
# Run all tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- src/services/profileService.test.ts

# Run tests in watch mode
npm test -- --watch

# Generate HTML coverage report
npm test -- --coverage --reporter=html
```

### Coverage Thresholds
```json
// vitest.config.ts
{
  "test": {
    "coverage": {
      "provider": "v8",
      "reporter": ["text", "json", "html"],
      "lines": 100,
      "functions": 100,
      "branches": 100,
      "statements": 100,
      "exclude": [
        "**/*.test.ts",
        "**/node_modules/**",
        "**/dist/**"
      ]
    }
  }
}
```

### Coverage Gaps (Expected)
Files/functions that may be below 100% and rationale:
- **Image upload to Discord:** Hard to test without real Discord API (mock instead)
- **Sharp image processing:** Library internals not testable (test interface only)
- **Error logging:** Console.log/error statements (acceptable to skip)

### Test Reports
- **Unit test report:** `coverage/index.html`
- **Integration test report:** Manual verification checklist
- **E2E test report:** User acceptance testing document

### Manual Testing Outcomes
- [ ] All commands tested in development Discord server
- [ ] All error messages verified for clarity
- [ ] All embeds verified for formatting
- [ ] All images verified for display quality
- [ ] Performance verified (< 2s for status, < 5s for image upload)

## Manual Testing
**What requires human validation?**

### UI/UX Testing Checklist
- [ ] **Embed Formatting**
  - Status embed displays correctly on desktop
  - Status embed displays correctly on mobile
  - Certificate embed displays correctly on desktop
  - Certificate embed displays correctly on mobile
  - Images display at correct size (480x480)
  - Text is readable and properly formatted

- [ ] **Command Autocomplete**
  - `/status` shows user option
  - `/status set` shows 4 status choices
  - `/status image` shows attachment option
  - `/giaykh` shows user option
  - `/giaykh message` shows message option
  - `/giaykh image` shows attachment option

- [ ] **Error Messages**
  - All error messages are clear and actionable
  - Error messages are in Vietnamese
  - Errors are shown ephemerally (not public)

- [ ] **Success Messages**
  - Success messages are clear and confirming
  - Success messages are in Vietnamese
  - Success messages show what was updated

- [ ] **Accessibility**
  - Emojis have text alternatives
  - Color contrast is sufficient
  - Screen reader compatibility (Discord's responsibility)

### Browser/Device Compatibility
- [ ] **Desktop Discord**
  - Windows client
  - macOS client
  - Linux client
  - Web browser

- [ ] **Mobile Discord**
  - iOS app
  - Android app
  - Mobile web browser

### Smoke Tests After Deployment
- [ ] Bot comes online successfully
- [ ] All commands are registered
- [ ] `/status` command works
- [ ] `/status set` command works
- [ ] `/status image` command works
- [ ] `/giaykh` command works
- [ ] `/giaykh message` command works
- [ ] `/giaykh image` command works
- [ ] Existing commands still work (regression)
- [ ] Database migrations applied successfully
- [ ] No errors in logs

## Performance Testing
**How do we validate performance?**

### Load Testing Scenarios
- [ ] **Scenario 1: Concurrent status views**
  - Simulate 10 users running `/status` simultaneously
  - Expected: All respond within 2 seconds
  - Measure: Response time, database query time

- [ ] **Scenario 2: Concurrent image uploads**
  - Simulate 5 users uploading images simultaneously
  - Expected: All process within 5 seconds
  - Measure: Processing time, memory usage

- [ ] **Scenario 3: Database query performance**
  - Run 100 profile lookups
  - Expected: Each query < 100ms
  - Measure: Query execution time

### Performance Benchmarks
```typescript
// Example performance test
describe('Performance', () => {
  it('should fetch profile in < 100ms', async () => {
    const start = Date.now();
    await profileService.getProfile('user1', 'guild1');
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(100);
  });
  
  it('should process image in < 3s', async () => {
    const start = Date.now();
    await imageService.processImage(mockAttachment);
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(3000);
  });
});
```

### Stress Testing Approach
- [ ] Test with 1000 user profiles in database
- [ ] Test with 100 concurrent requests
- [ ] Test with maximum size images (8MB)
- [ ] Monitor memory usage during tests
- [ ] Monitor CPU usage during tests

## Bug Tracking
**How do we manage issues?**

### Issue Tracking Process
1. **Discovery:** Bug found during testing
2. **Documentation:** Create issue with:
   - Title: Brief description
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots/logs
3. **Triage:** Assign severity level
4. **Fix:** Implement fix and add regression test
5. **Verify:** Re-test to confirm fix
6. **Close:** Mark as resolved

### Bug Severity Levels
- **Critical:** Bot crashes, data loss, security issue
- **High:** Feature completely broken, major UX issue
- **Medium:** Feature partially broken, minor UX issue
- **Low:** Cosmetic issue, typo, minor improvement

### Regression Testing Strategy
- Add test case for every bug fixed
- Run full test suite before each deployment
- Maintain regression test checklist
- Automate regression tests where possible

## Test Execution Checklist

### Pre-Implementation Testing
- [x] Requirements documented and reviewed
- [x] Design documented and reviewed
- [x] Test plan documented and reviewed

### During Implementation
- [ ] Write unit tests alongside code
- [ ] Run tests frequently during development
- [ ] Maintain 100% coverage for new code
- [ ] Fix linter errors immediately

### Post-Implementation Testing
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E flows tested manually
- [ ] Performance benchmarks met
- [ ] No regression in existing features
- [ ] Code reviewed and approved
- [ ] Documentation updated

### Pre-Deployment Testing
- [ ] Test on staging environment
- [ ] Run database migrations on staging
- [ ] Smoke test all commands
- [ ] Verify no errors in logs
- [ ] Get stakeholder approval

### Post-Deployment Testing
- [ ] Smoke test in production
- [ ] Monitor error logs for 24 hours
- [ ] Verify user feedback is positive
- [ ] Document any issues found
- [ ] Plan fixes for any issues

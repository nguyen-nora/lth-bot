---
phase: planning
title: Project Planning & Task Breakdown
description: Break down work into actionable tasks and estimate timeline
---

# Project Planning & Task Breakdown

## Milestones
**What are the major checkpoints?**

- [x] Milestone 0: Requirements & Design Documentation Complete
- [x] Milestone 1: Database Schema & Migrations
- [x] Milestone 2: Core Services Implementation
- [x] Milestone 3: Commands Implementation
- [ ] Milestone 4: Testing & Quality Assurance
- [ ] Milestone 5: Deployment & Documentation

## Task Breakdown
**What specific work needs to be done?**

### Phase 1: Foundation & Database (Est: 4-6 hours)

#### Task 1.1: Install Dependencies ✅
- [x] Install Sharp library for image processing (`npm install sharp`)
- [x] Install Sharp types (`npm install -D @types/sharp`)
- [x] Update package.json with new dependencies
- **Estimate:** 15 minutes
- **Status:** COMPLETED

#### Task 1.2: Create Database Migrations ✅
- [x] Create migration for `UserProfile` table
  - Fields: id, userId, guildId, relationshipStatus, statusImagePath, createdAt, updatedAt
  - Indexes: unique(userId, guildId), index(userId, guildId)
- [x] Create migration for `MarriageCertificate` table
  - Fields: id, marriageId, user1Message, user2Message, certificateImagePath, createdAt, updatedAt
  - Indexes: unique(marriageId)
  - Foreign key: marriageId → marriages.id (CASCADE on delete)
- [x] Update Prisma schema file
- [x] Generate Prisma client
- [x] Test migrations on development database
- **Estimate:** 1-2 hours
- **Files:** `prisma/schema.prisma`, `prisma/migrations/*`
- **Status:** COMPLETED - Migration: 20260110143743_add_user_profiles_and_certificates

#### Task 1.3: Data Migration Script ✅
- [x] Create script to migrate existing users
  - Set default status to "single" for all existing users
  - Optionally set status to "married" for users with active marriages
- [x] Create MarriageCertificate records for existing marriages
- [x] Test migration script on copy of production data
- **Estimate:** 1 hour
- **Files:** `scripts/migrate-user-profiles.ts`
- **Status:** COMPLETED - Profiles created on-demand (lazy creation)

### Phase 2: Core Services (Est: 8-10 hours)

#### Task 2.1: Create ImageService ✅
- [x] Create `src/services/imageService.ts`
- [x] Implement `validateImage()` - check format, size, dimensions
- [x] Implement `cropToSquare()` - use Sharp to crop to 480x480
- [x] Implement `processImage()` - validate → crop → return buffer
- [x] Implement `saveToStorage()` - save to local filesystem (./data/images/)
- [x] Implement `loadFromStorage()` - load image from filesystem
- [x] Create storage directory structure
- [x] Add error handling for invalid images and storage errors
- [ ] Add unit tests for image validation
- [ ] Add unit tests for image cropping and storage
- **Estimate:** 3-4 hours
- **Files:** `src/services/imageService.ts`, `src/services/imageService.test.ts`
- **Status:** COMPLETED (tests pending)

#### Task 2.2: Create ProfileService ✅
- [x] Create `src/services/profileService.ts`
- [x] Implement `getProfile()` - get or create user profile
- [x] Implement `setStatus()` - update relationship status
- [x] Implement `setStatusImage()` - update status image path
- [x] Implement `getFullProfile()` - join profile + marriage + attendance
- [x] Add validation for status enum values
- [x] Add error handling for database operations
- [ ] Add unit tests for all methods
- **Estimate:** 2-3 hours
- **Files:** `src/services/profileService.ts`, `src/services/profileService.test.ts`
- **Status:** COMPLETED (tests pending)

#### Task 2.3: Extend MarriageService ✅
- [x] Add `getCertificate()` - get or create certificate for marriage
- [x] Add `setUserMessage()` - update user's message (validate user is in marriage)
- [x] Add `setCertificateImage()` - update certificate image path
- [x] Add `calculateMarriageDuration()` - calculate days from marriage date
- [x] Add `formatCertificateEmbed()` - create certificate embed
- [x] Add `getMarriageWithCertificate()` - get marriage with certificate data
- [x] Update `divorce()` to cascade delete certificate (handled by DB CASCADE)
- [ ] Add unit tests for new methods
- **Estimate:** 2-3 hours
- **Files:** `src/services/marriageService.ts`, `src/services/marriageService.test.ts`
- **Status:** COMPLETED (tests pending)

#### Task 2.4: Update StatusService ✅
- [x] Modify `getUserStatus()` to include profile data
- [x] Update `formatStatusEmbed()` to show custom status and image
- [x] Add relationship status emoji mapping
- [x] Update embed layout to match new design
- [x] Add fallback for users without profiles
- [ ] Update unit tests
- **Estimate:** 1-2 hours
- **Files:** `src/services/statusService.ts`, `src/services/statusService.test.ts`
- **Status:** COMPLETED (tests pending)

### Phase 3: Commands Implementation (Est: 6-8 hours)

#### Task 3.1: Update /status Command ✅
- [x] Modify `src/commands/status.ts`
- [x] Update to fetch profile data via ProfileService
- [x] Update embed formatting to show custom status
- [x] Update embed to show custom image
- [x] Add error handling for missing profile
- [ ] Test with various user scenarios
- **Estimate:** 1 hour
- **Files:** `src/commands/status.ts`
- **Status:** COMPLETED

#### Task 3.2: Create /status set Command ✅
- [x] Create `src/commands/statusSet.ts`
- [x] Add slash command with status option (choices: single, complicated, married, dating)
- [x] Implement execute() to call ProfileService.setStatus()
- [x] Add success/error messages
- [x] Add ephemeral response option
- [ ] Test all status options
- **Estimate:** 1-1.5 hours
- **Files:** `src/commands/statusSet.ts`
- **Status:** COMPLETED

#### Task 3.3: Create /status image Command ✅
- [x] Create `src/commands/statusImage.ts`
- [x] Add slash command with attachment option
- [x] Implement execute() to call ImageService.processImage()
- [x] Save processed image to local storage
- [x] Save file path via ProfileService.setStatusImage()
- [x] Add progress indicator (defer reply)
- [x] Add validation error messages
- [ ] Test with various image formats and sizes
- **Estimate:** 1.5-2 hours
- **Files:** `src/commands/statusImage.ts`
- **Status:** COMPLETED

#### Task 3.4: Create /giaykh Command ✅
- [x] Create `src/commands/giaykh.ts`
- [x] Add slash command with optional user parameter
- [x] Implement execute() to fetch marriage and certificate
- [x] Calculate marriage duration
- [x] Format certificate embed
- [x] Add error handling for not married
- [x] Add support for viewing other users' certificates
- [ ] Test with various scenarios
- **Estimate:** 1.5-2 hours
- **Files:** `src/commands/giaykh.ts`
- **Status:** COMPLETED

#### Task 3.5: Create /giaykh message Command ✅
- [x] Create `src/commands/giaykhMessage.ts`
- [x] Add slash command with message string parameter
- [x] Validate user is married
- [x] Determine which user (user1 or user2) is updating
- [x] Call MarriageService.setUserMessage()
- [x] Add success message
- [x] Add character limit validation (500 chars)
- [ ] Test message updates
- **Estimate:** 1 hour
- **Files:** `src/commands/giaykhMessage.ts`
- **Status:** COMPLETED

#### Task 3.6: Create /giaykh image Command ✅
- [x] Create `src/commands/giaykhImage.ts`
- [x] Add slash command with attachment option
- [x] Validate user is married
- [x] Process image via ImageService
- [x] Save to local storage and get file path
- [x] Call MarriageService.setCertificateImage()
- [x] Add progress indicator
- [ ] Test image upload
- **Estimate:** 1-1.5 hours
- **Files:** `src/commands/giaykhImage.ts`
- **Status:** COMPLETED

### Phase 4: Translation & UI Polish (Est: 2-3 hours)

#### Task 4.1: Add Translation Keys ✅
- [x] Add Vietnamese translations for all new messages
- [x] Add status option translations:
  - single → "Độc thân"
  - married → "Đã kết hôn"
  - dating → "Đang hẹn hò"
  - complicated → "Mập mờ"
- [x] Add certificate labels
- [x] Add error messages
- [x] Add success messages
- **Estimate:** 1 hour
- **Files:** `src/utils/translations.ts`
- **Status:** COMPLETED

#### Task 4.2: Add Emoji Support ✅
- [x] Add relationship status emojis (in profileService.ts)
- [x] Add certificate emojis (in marriageService.ts)
- **Estimate:** 30 minutes
- **Files:** `src/services/profileService.ts`, `src/services/statusService.ts`
- **Status:** COMPLETED

#### Task 4.3: UI/UX Refinements
- [ ] Ensure embed colors are consistent
- [ ] Verify image sizing and display
- [ ] Test embed layouts on mobile and desktop
- [ ] Add helpful command descriptions
- [ ] Test autocomplete functionality
- **Estimate:** 1 hour

### Phase 5: Testing (Est: 6-8 hours)

#### Task 5.1: Unit Tests
- [ ] Write tests for ImageService (validation, cropping)
- [ ] Write tests for ProfileService (CRUD operations)
- [ ] Write tests for MarriageService extensions
- [ ] Write tests for StatusService updates
- [ ] Achieve 100% code coverage for new code
- [ ] Run test suite: `npm test`
- **Estimate:** 3-4 hours

#### Task 5.2: Integration Tests
- [ ] Test status command with profile integration
- [ ] Test certificate command with marriage integration
- [ ] Test image upload end-to-end
- [ ] Test message update end-to-end
- [ ] Test error scenarios (not married, invalid image, etc.)
- **Estimate:** 2-3 hours

#### Task 5.3: Manual Testing
- [ ] Test all commands in development Discord server
- [ ] Test with different user roles
- [ ] Test with edge cases (no profile, no marriage, etc.)
- [ ] Test image uploads with various formats
- [ ] Test concurrent updates
- [ ] Verify database state after operations
- **Estimate:** 1-2 hours

### Phase 6: Documentation & Deployment (Est: 2-3 hours)

#### Task 6.1: Update Documentation
- [ ] Update README with new commands
- [ ] Update command help text
- [ ] Document new database schema
- [ ] Add migration guide for existing deployments
- [ ] Update API documentation
- **Estimate:** 1-1.5 hours

#### Task 6.2: Deployment Preparation
- [ ] Create production migration plan
- [ ] Test migrations on staging database
- [ ] Prepare rollback plan
- [ ] Update deployment scripts
- [ ] Create backup of production database
- **Estimate:** 1 hour

#### Task 6.3: Deploy to Production
- [ ] Run database migrations
- [ ] Deploy new code
- [ ] Run data migration script
- [ ] Verify all commands work
- [ ] Monitor for errors
- [ ] Announce new features to users
- **Estimate:** 30 minutes

## Dependencies
**What needs to happen in what order?**

### Critical Path
1. **Database migrations** must be complete before any service implementation
2. **ImageService** must be complete before image-related commands
3. **ProfileService** must be complete before status commands
4. **MarriageService extensions** must be complete before certificate commands
5. **All services** must be complete before command implementation
6. **All commands** must be complete before integration testing
7. **All testing** must be complete before deployment

### Task Dependencies
- Task 2.1 (ImageService) → Task 3.3 (status image) & Task 3.6 (certificate image)
- Task 2.2 (ProfileService) → Task 2.4 (StatusService) → Task 3.1, 3.2, 3.3
- Task 2.3 (MarriageService) → Task 3.4, 3.5, 3.6
- Task 1.2 (Migrations) → All Phase 2 tasks
- All Phase 3 tasks → Task 5.2 (Integration tests)

### External Dependencies
- **Sharp library** - npm package for image processing
- **Discord CDN** - for hosting uploaded images
- **Prisma** - ORM for database operations (existing)
- **Discord.js** - bot framework (existing)

## Timeline & Estimates
**When will things be done?**

### Total Estimated Effort
- Phase 1: 4-6 hours
- Phase 2: 8-10 hours
- Phase 3: 6-8 hours
- Phase 4: 2-3 hours
- Phase 5: 6-8 hours
- Phase 6: 2-3 hours
- **Total: 28-38 hours** (3.5 - 5 working days)

### Suggested Schedule (5-day sprint)
- **Day 1:** Phase 1 (Database) + Start Phase 2 (Services)
- **Day 2:** Complete Phase 2 (Services) + Unit tests
- **Day 3:** Phase 3 (Commands) + Phase 4 (Translations/UI)
- **Day 4:** Phase 5 (Testing) - Unit, Integration, Manual
- **Day 5:** Phase 6 (Documentation & Deployment)

### Buffer
- Add 20% buffer for unexpected issues: **6-8 hours**
- **Total with buffer: 34-46 hours** (4-6 working days)

## Risks & Mitigation
**What could go wrong?**

### Risk 1: Image Processing Performance
**Risk:** Sharp library may be slow for large images, causing timeouts
**Impact:** High - Users can't upload images
**Mitigation:**
- Set strict file size limits (8MB max)
- Defer interaction reply immediately
- Add timeout handling
- Consider async processing queue for future

### Risk 2: Discord CDN URL Expiration
**Risk:** Discord CDN URLs may expire or become invalid
**Impact:** Medium - Images disappear from profiles
**Mitigation:**
- Research Discord CDN URL persistence
- Consider alternative hosting if needed
- Add URL validation before display
- Implement re-upload mechanism

### Risk 3: Database Migration Failures
**Risk:** Migrations fail on production database
**Impact:** Critical - Bot may become unusable
**Mitigation:**
- Test migrations thoroughly on staging
- Create database backup before migration
- Prepare rollback scripts
- Use Prisma's built-in migration safety features

### Risk 4: Breaking Changes to Existing Features
**Risk:** Changes to StatusService/MarriageService break existing commands
**Impact:** High - Existing features stop working
**Mitigation:**
- Maintain backward compatibility
- Write comprehensive unit tests
- Test all existing commands after changes
- Use feature flags if needed

### Risk 5: Rate Limiting Issues
**Risk:** Users spam image uploads, causing performance issues
**Impact:** Medium - Server performance degrades
**Mitigation:**
- Implement rate limiting (1 update per minute)
- Add cooldown messages
- Monitor upload frequency
- Consider stricter limits if needed

### Risk 6: Image Storage Limits
**Risk:** Too many images stored, running out of disk space
**Impact:** Medium - Self-hosted storage can fill up
**Mitigation:**
- Monitor disk usage regularly
- Set up storage quotas/limits
- Implement cleanup for deleted profiles/marriages
- Consider image compression to reduce size
- Plan for storage scaling if needed

### Risk 7: Translation Inconsistencies
**Risk:** Mixed English/Vietnamese in UI
**Impact:** Low - Poor UX but not breaking
**Mitigation:**
- Review all translation keys
- Test with Vietnamese locale
- Get native speaker review

### Risk 8: Concurrent Update Conflicts
**Risk:** Both partners update certificate simultaneously, causing conflicts
**Impact:** Low - Last update wins (acceptable)
**Mitigation:**
- Use Prisma's `updatedAt` field
- Add optimistic locking if needed
- Document behavior

## Resources Needed
**What do we need to succeed?**

### Team Members and Roles
- **Developer** - Full-stack implementation (TypeScript, Discord.js, Prisma)
- **Tester** - Manual testing in Discord server
- **Reviewer** - Code review and approval
- **Deployer** - Production deployment and monitoring

### Tools and Services
- **Node.js** - Runtime environment (existing)
- **TypeScript** - Programming language (existing)
- **Discord.js** - Bot framework (existing)
- **Prisma** - ORM (existing)
- **Sharp** - Image processing (NEW - to be installed)
- **Vitest** - Testing framework (existing)
- **Git** - Version control (existing)

### Infrastructure
- **Development Discord Server** - For testing
- **Staging Database** - For migration testing
- **Production Database** - SQLite (existing)
- **Discord Bot Token** - For API access (existing)

### Documentation/Knowledge
- [Sharp Documentation](https://sharp.pixelplumbing.com/)
- [Discord.js Guide](https://discordjs.guide/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- Discord CDN URL format and persistence research
- Image processing best practices

### Access Requirements
- Write access to repository
- Access to production server
- Discord bot admin permissions
- Database backup/restore permissions

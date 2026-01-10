# Feature Development Checklist

## Status & Marriage Certificate Redesign

Use this checklist to track progress through the feature development workflow.

---

## ✅ Phase 1: Requirements & Documentation (COMPLETE)

- [x] **Capture Requirements**
  - [x] Feature name defined: `status-marriage-redesign`
  - [x] Problem statement documented
  - [x] User stories written (US-1 to US-8)
  - [x] Success criteria defined
  - [x] Constraints identified

- [x] **Create Documentation Structure**
  - [x] `docs/ai/requirements/feature-status-marriage-redesign.md`
  - [x] `docs/ai/design/feature-status-marriage-redesign.md`
  - [x] `docs/ai/planning/feature-status-marriage-redesign.md`
  - [x] `docs/ai/implementation/feature-status-marriage-redesign.md`
  - [x] `docs/ai/testing/feature-status-marriage-redesign.md`

- [x] **Design Phase**
  - [x] Architecture diagrams created (mermaid)
  - [x] Database schema designed
  - [x] API interfaces defined
  - [x] Component breakdown documented
  - [x] Design decisions recorded

- [x] **Planning Phase**
  - [x] Tasks broken down (30+ tasks)
  - [x] Dependencies identified
  - [x] Timeline estimated (34-46 hours)
  - [x] Risks documented with mitigation

- [x] **Implementation Guide**
  - [x] Setup instructions written
  - [x] Code patterns documented
  - [x] Integration points defined
  - [x] Security notes included

- [x] **Testing Strategy**
  - [x] Unit test cases defined (50+)
  - [x] Integration test scenarios defined (15+)
  - [x] E2E flows documented (4 flows)
  - [x] Coverage goals set (100%)

---

## ✅ Phase 2: Review & Approval (COMPLETE)

- [x] **Answer Open Questions**
  - [x] Review `docs/ai/requirements/feature-status-marriage-redesign-questions.md`
  - [x] Decide on image storage strategy → Self-hosted (./data/images/)
  - [x] Decide on command structure → Separate commands
  - [x] Decide on certificate viewing permissions → Option A (anyone can view)
  - [x] Decide on other medium/low priority questions
  - [x] Update requirements doc with final decisions

- [x] **Documentation Review**
  - [x] Run `/review-requirements` on requirements doc
  - [x] Address any feedback from requirements review
  - [x] Run `/review-design` on design doc
  - [x] Address any feedback from design review
  - [x] Get stakeholder approval on approach

- [x] **Pre-Implementation Checklist**
  - [x] All open questions resolved
  - [x] All design decisions finalized
  - [x] All team members aligned on approach
  - [x] Development environment ready
  - [x] Test environment ready

---

## ✅ Phase 3: Implementation (COMPLETE)

### Foundation (Est: 4-6 hours) ✅
- [x] **Dependencies**
  - [x] Install Sharp library: `npm install sharp`
  - [x] Install Sharp types: `npm install -D @types/sharp`
  - [x] Verify installation: `npm list sharp`

- [x] **Database Migrations**
  - [x] Create UserProfile migration
  - [x] Create MarriageCertificate migration
  - [x] Update Marriage model with relation
  - [x] Run migrations: `npx prisma migrate dev`
  - [x] Generate Prisma client: `npx prisma generate`
  - [x] Migration: `20260110143743_add_user_profiles_and_certificates`

- [x] **Data Migration**
  - [x] Profiles created on-demand (lazy creation pattern)
  - [x] Certificates created on-demand

### Core Services (Est: 8-10 hours) ✅
- [x] **ImageService**
  - [x] Create `src/services/imageService.ts`
  - [x] Implement validateImage()
  - [x] Implement cropToSquare()
  - [x] Implement processImage()
  - [x] Implement saveToStorage()
  - [x] Implement loadFromStorage()
  - [x] Implement deleteFromStorage()
  - [ ] Write unit tests (pending)

- [x] **ProfileService**
  - [x] Create `src/services/profileService.ts`
  - [x] Implement getProfile()
  - [x] Implement setStatus()
  - [x] Implement setStatusImage()
  - [x] Implement getFullProfile()
  - [x] Implement deleteProfile()
  - [x] Add STATUS_TRANSLATIONS constant
  - [ ] Write unit tests (pending)

- [x] **MarriageService Extensions**
  - [x] Implement getCertificate()
  - [x] Implement setUserMessage()
  - [x] Implement setCertificateImage()
  - [x] Implement calculateMarriageDuration()
  - [x] Implement getMarriageWithCertificate()
  - [x] Implement formatCertificateEmbed()
  - [ ] Write unit tests (pending)

- [x] **StatusService Updates**
  - [x] Update getUserStatus() with profile data
  - [x] Update formatStatusEmbed() with custom status/image
  - [x] Add relationship status emoji mapping
  - [x] Return attachment along with embed
  - [ ] Update unit tests (pending)

### Commands (Est: 6-8 hours) ✅
- [x] **Update /status**
  - [x] Modify `src/commands/status.ts`
  - [x] Integrate ProfileService
  - [x] Update embed formatting
  - [x] Support image attachments

- [x] **Create /status-set**
  - [x] Create `src/commands/statusSet.ts`
  - [x] Add slash command definition with choices
  - [x] Implement execute()
  - [x] Ephemeral response

- [x] **Create /status-image**
  - [x] Create `src/commands/statusImage.ts`
  - [x] Add slash command definition
  - [x] Implement execute() with image processing
  - [x] Add progress indicator (defer reply)

- [x] **Create /giaykh**
  - [x] Create `src/commands/giaykh.ts`
  - [x] Add slash command definition
  - [x] Implement execute() with certificate display
  - [x] Add support for viewing others' certificates

- [x] **Create /giaykh-message**
  - [x] Create `src/commands/giaykhMessage.ts`
  - [x] Add slash command definition
  - [x] Implement execute() with message update
  - [x] Add authorization check

- [x] **Create /giaykh-image**
  - [x] Create `src/commands/giaykhImage.ts`
  - [x] Add slash command definition
  - [x] Implement execute() with image processing
  - [x] Add authorization check

### UI Polish (Est: 2-3 hours) ✅
- [x] **Translations**
  - [x] Add Vietnamese translations for new messages
  - [x] Add status option translations
  - [x] Add certificate labels
  - [x] Add error messages

- [x] **Emojis**
  - [x] Add relationship status emojis (in statusService)
  - [x] Add certificate emojis (in marriageService)

---

## ⏳ Phase 4: Testing (IN PROGRESS)

### Unit Tests (Est: 3-4 hours)
- [ ] **ImageService Tests**
  - [ ] Test validateImage() with valid/invalid formats
  - [ ] Test cropToSquare() with various aspect ratios
  - [ ] Test processImage() end-to-end
  - [ ] Test error scenarios

- [ ] **ProfileService Tests**
  - [ ] Test getProfile() create/retrieve
  - [ ] Test setStatus() with valid/invalid values
  - [ ] Test setStatusImage()
  - [ ] Test getFullProfile() with various data

- [ ] **MarriageService Tests**
  - [ ] Test getCertificate()
  - [ ] Test setUserMessage() with authorization
  - [ ] Test setCertificateImage()
  - [ ] Test calculateMarriageDuration()

- [ ] **StatusService Tests**
  - [ ] Test getUserStatus() with profile
  - [ ] Test formatStatusEmbed() variations
  - [ ] Test fallback behavior

- [ ] **Coverage Verification**
  - [ ] Run: `npm test -- --coverage`
  - [ ] Verify 100% coverage for new code
  - [ ] Document any acceptable gaps

### Integration Tests (Est: 2-3 hours)
- [ ] Test status command flow
- [ ] Test status set flow
- [ ] Test status image upload flow
- [ ] Test certificate view flow
- [ ] Test certificate message flow
- [ ] Test certificate image flow
- [ ] Test marriage creation with certificate
- [ ] Test divorce with certificate deletion
- [ ] Test error scenarios
- [ ] Test rate limiting

### E2E Tests (Est: 1-2 hours)
- [ ] **Flow 1: Complete Status Customization**
  - [ ] New user → view status → set status → upload image → verify

- [ ] **Flow 2: Marriage Certificate Journey**
  - [ ] Propose → accept → view certificate → add messages → upload image → verify

- [ ] **Flow 3: Status Independence**
  - [ ] Married user → set single status → verify both work → divorce → verify

- [ ] **Flow 4: Error Handling**
  - [ ] Test all error scenarios → verify clear messages

### Manual Testing
- [ ] Test all commands in Discord server
- [ ] Test on desktop Discord client
- [ ] Test on mobile Discord app
- [ ] Test with various user roles
- [ ] Test edge cases
- [ ] Verify database state

---

## ⏳ Phase 5: Code Review & Quality (NOT STARTED)

- [ ] **Pre-Review Checklist**
  - [x] All tests passing (existing tests)
  - [x] No linter errors
  - [x] Code formatted consistently
  - [ ] Documentation updated
  - [x] No console.log statements (except intentional logging)

- [ ] **Code Review**
  - [ ] Run `/code-review` with file list
  - [ ] Address all feedback
  - [ ] Get approval from reviewer

- [ ] **Verification**
  - [ ] Run `/check-implementation` against design doc
  - [ ] Verify all requirements met
  - [ ] Verify all user stories implemented

---

## ⏳ Phase 6: Deployment (NOT STARTED)

### Pre-Deployment (Est: 1 hour)
- [ ] **Documentation**
  - [ ] Update README with new commands
  - [ ] Update command help text
  - [ ] Document database schema changes
  - [ ] Create migration guide

- [ ] **Preparation**
  - [ ] Create production migration plan
  - [ ] Test migrations on staging
  - [ ] Prepare rollback plan
  - [ ] Create database backup

### Deployment (Est: 30 minutes)
- [ ] **Execute Deployment**
  - [ ] Backup production database
  - [ ] Run database migrations
  - [ ] Deploy new code
  - [ ] Run data migration script
  - [ ] Verify bot starts successfully

- [ ] **Smoke Testing**
  - [ ] Test `/status` command
  - [ ] Test `/status-set` command
  - [ ] Test `/status-image` command
  - [ ] Test `/giaykh` command
  - [ ] Test `/giaykh-message` command
  - [ ] Test `/giaykh-image` command
  - [ ] Test existing commands (regression)

### Post-Deployment (Est: 30 minutes)
- [ ] **Monitoring**
  - [ ] Monitor error logs for 24 hours
  - [ ] Monitor performance metrics
  - [ ] Monitor user feedback
  - [ ] Document any issues

- [ ] **Announcement**
  - [ ] Announce new features to users
  - [ ] Provide usage examples
  - [ ] Share documentation links

---

## 📊 Progress Summary

| Phase | Status | Progress |
|-------|--------|----------|
| 1. Requirements & Documentation | ✅ Complete | 100% |
| 2. Review & Approval | ✅ Complete | 100% |
| 3. Implementation | ✅ Complete | 100% |
| 4. Testing | ⏳ In Progress | 10% |
| 5. Code Review | ⏳ Not Started | 0% |
| 6. Deployment | ⏳ Not Started | 0% |

**Overall Progress:** 55% (3/6 phases complete)

---

## 🎯 Current Focus

**Next Action:** Write unit tests for new services

**Files Created/Modified:**
- `src/services/imageService.ts` (NEW)
- `src/services/profileService.ts` (NEW)
- `src/services/marriageService.ts` (EXTENDED)
- `src/services/statusService.ts` (MODIFIED)
- `src/commands/status.ts` (MODIFIED)
- `src/commands/statusSet.ts` (NEW)
- `src/commands/statusImage.ts` (NEW)
- `src/commands/giaykh.ts` (NEW)
- `src/commands/giaykhMessage.ts` (NEW)
- `src/commands/giaykhImage.ts` (NEW)
- `src/utils/translations.ts` (EXTENDED)
- `prisma/schema.prisma` (EXTENDED)

**Commands to Run:**
```bash
# Run tests
npm test

# Build project
npm run build

# Start bot
npm start
```

---

**Last Updated:** 2026-01-10  
**Status:** ✅ Implementation Complete - Testing Phase

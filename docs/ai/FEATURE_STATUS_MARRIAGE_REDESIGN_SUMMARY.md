# Feature: Status & Marriage Certificate Redesign - Summary

## 📋 Overview

This feature redesigns the `/status` command and introduces a new `/giaykh` (marriage certificate) command to provide users with customizable profiles and beautiful marriage certificates.

**Feature Name:** `status-marriage-redesign`  
**Status:** 📝 Documentation Complete - Ready for Review  
**Estimated Effort:** 34-46 hours (4-6 working days)

---

## 🎯 Key Changes

### 1. Status Command Redesign (`/status`)
- **Decouples relationship status from actual marriages**
- Users can set their own status: `single`, `complicated`, `married`, `dating`
- Users can upload custom 480x480px images
- Status is independent - being married in-game doesn't force "married" status

### 2. New Marriage Certificate Command (`/giaykh`)
- Beautiful certificate design showing marriage details
- Displays: marriage date, duration (days), personal messages, custom image
- Both partners can add/update their personal messages anytime
- Certificate image is customizable (separate from status image)

### 3. Database Changes
- **New table:** `UserProfile` - stores relationship status and status image
- **New table:** `MarriageCertificate` - stores certificate data (messages, image)
- **Modified table:** `Marriage` - adds relation to certificate

---

## 📚 Documentation Structure

All documentation has been created following the ai-devkit structure:

### ✅ Requirements Phase
- **File:** `docs/ai/requirements/feature-status-marriage-redesign.md`
- **Contents:** Problem statement, goals, user stories (US-1 to US-8), success criteria
- **Open Questions:** `docs/ai/requirements/feature-status-marriage-redesign-questions.md`

### ✅ Design Phase
- **File:** `docs/ai/design/feature-status-marriage-redesign.md`
- **Contents:** Architecture diagrams, data models, API design, component breakdown
- **Key Decisions:** Separate tables, Discord CDN for images, Sharp for processing

### ✅ Planning Phase
- **File:** `docs/ai/planning/feature-status-marriage-redesign.md`
- **Contents:** 6 phases, 30+ tasks, timeline estimates, risk mitigation
- **Phases:** Foundation (4-6h), Services (8-10h), Commands (6-8h), UI (2-3h), Testing (6-8h), Deployment (2-3h)

### ✅ Implementation Phase
- **File:** `docs/ai/implementation/feature-status-marriage-redesign.md`
- **Contents:** Setup instructions, code patterns, integration points, security notes
- **Key Patterns:** Service layer, error handling, validation, rate limiting

### ✅ Testing Phase
- **File:** `docs/ai/testing/feature-status-marriage-redesign.md`
- **Contents:** 100% coverage goal, unit tests, integration tests, E2E flows
- **Test Count:** 50+ unit tests, 15+ integration tests, 4 E2E flows

---

## 🔑 Key Features

### User Stories Covered

| ID | User Story | Status |
|----|-----------|--------|
| US-1 | View my profile with avatar, username, join date, check-in stats | ✅ Documented |
| US-2 | Set relationship status independently of marriages | ✅ Documented |
| US-3 | Upload custom image for status display | ✅ Documented |
| US-4 | View another user's status | ✅ Documented |
| US-5 | View beautiful marriage certificate | ✅ Documented |
| US-6 | Add/update personal message on certificate | ✅ Documented |
| US-7 | See marriage duration calculated from date | ✅ Documented |
| US-8 | Customize certificate image | ✅ Documented |

---

## 🏗️ Architecture Overview

```
Commands Layer
├── /status (modified) - View user profile
├── /status set (new) - Set relationship status
├── /status image (new) - Upload status image
├── /giaykh (new) - View marriage certificate
├── /giaykh message (new) - Set certificate message
└── /giaykh image (new) - Set certificate image

Services Layer
├── StatusService (modified) - Extended with profile data
├── MarriageService (modified) - Extended with certificate
├── ProfileService (new) - User profile management
└── ImageService (new) - Image processing with Sharp

Database Layer
├── UserProfile (new) - Relationship status + image
├── MarriageCertificate (new) - Messages + image
└── Marriage (modified) - Relation to certificate
```

---

## 📊 Database Schema Changes

### New Table: UserProfile
```sql
CREATE TABLE user_profiles (
  id INTEGER PRIMARY KEY,
  user_id TEXT NOT NULL,
  guild_id TEXT NOT NULL,
  relationship_status TEXT DEFAULT 'single',
  status_image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, guild_id)
);
```

### New Table: MarriageCertificate
```sql
CREATE TABLE marriage_certificates (
  id INTEGER PRIMARY KEY,
  marriage_id INTEGER UNIQUE NOT NULL,
  user1_message TEXT,
  user2_message TEXT,
  certificate_image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (marriage_id) REFERENCES marriages(id) ON DELETE CASCADE
);
```

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (4-6 hours)
- Install Sharp library
- Create database migrations
- Write data migration script

### Phase 2: Core Services (8-10 hours)
- Create ImageService (validation, cropping, upload)
- Create ProfileService (CRUD operations)
- Extend MarriageService (certificate methods)
- Update StatusService (profile integration)

### Phase 3: Commands (6-8 hours)
- Update `/status` command
- Create `/status set` command
- Create `/status image` command
- Create `/giaykh` command
- Create `/giaykh message` command
- Create `/giaykh image` command

### Phase 4: UI Polish (2-3 hours)
- Add Vietnamese translations
- Add status emojis
- Refine embed layouts

### Phase 5: Testing (6-8 hours)
- Write 50+ unit tests
- Write 15+ integration tests
- Execute 4 E2E flows
- Manual testing in Discord

### Phase 6: Deployment (2-3 hours)
- Update documentation
- Run migrations
- Deploy to production
- Verify functionality

---

## ⚠️ Open Questions (Requires User Input)

Before implementation, please review and decide on these questions:

### High Priority (Blocking)
1. **Image Storage:** Discord CDN vs External service? → Recommend: Discord CDN
2. **Command Structure:** `/status set` vs `/status-set`? → Recommend: `/status set`
3. **Certificate Viewing:** Public or private? → Recommend: Public

### Medium Priority (Can Use Defaults)
4. **Images:** Separate for status/certificate or shared? → Recommend: Separate
5. **Default Image:** Discord avatar, placeholder, or none? → Recommend: Discord avatar
6. **File Size Limit:** 5MB, 8MB, or 10MB? → Recommend: 8MB

### Low Priority (Use Defaults)
7. **Status Language:** Vietnamese or English? → Recommend: Vietnamese
8. **Existing Users:** Auto-set status or default to single? → Recommend: Default to single

**See full details:** `docs/ai/requirements/feature-status-marriage-redesign-questions.md`

---

## 🎨 UI/UX Design

### Status Embed Layout
```
┌─────────────────────────────────────┐
│ Thông tin của tôi                   │
├─────────────────────────────────────┤
│ [Avatar]                            │
│                                     │
│ 📅 Gia nhập LHT:                    │
│ 01/01/2024                          │
│                                     │
│ ✅ Điểm danh:                       │
│ • Bang chiến: 30 ngày               │
│ • Lần đây nhất: 10/01/2026          │
│                                     │
│ 💕 Trạng thái:                      │
│ Đang hẹn hò                         │
│                                     │
│ [Custom Image 480x480]              │
│                                     │
│ Soo cute<333                        │
└─────────────────────────────────────┘
```

### Certificate Embed Layout
```
┌─────────────────────────────────────┐
│ 💒 Giấy Kết Hôn 💒                  │
├─────────────────────────────────────┤
│ Ngày kết hôn: 01/01/2024            │
│ Thời gian: 10 ngày                  │
│                                     │
│ ─────────────────────────────────   │
│                                     │
│ 💌 Lời nhắn từ User A:              │
│ "Forever together"                  │
│                                     │
│ 💌 Lời nhắn từ User B:              │
│ "Love you always"                   │
│                                     │
│ [Custom Certificate Image 480x480]  │
│                                     │
│ User A ❤️ User B                    │
└─────────────────────────────────────┘
```

---

## 🔒 Security Considerations

### Input Validation
- ✅ Status enum validation (4 options only)
- ✅ Image format validation (jpg, png, gif, webp)
- ✅ Image size validation (max 8MB)
- ✅ Message length validation (max 500 chars)

### Authorization
- ✅ Users can only modify their own profile
- ✅ Users can only modify their own certificate message
- ✅ Both partners can update certificate image

### Rate Limiting
- ✅ 1 status update per minute
- ✅ 1 image upload per minute
- ✅ Prevents spam and abuse

---

## 📈 Success Metrics

### Functional Metrics
- [ ] All 8 user stories implemented and tested
- [ ] 100% unit test coverage achieved
- [ ] All integration tests passing
- [ ] All E2E flows verified

### Performance Metrics
- [ ] Status command: < 2 seconds response time
- [ ] Image upload: < 5 seconds processing time
- [ ] Certificate command: < 2 seconds response time
- [ ] Database queries: < 100ms per query

### Quality Metrics
- [ ] Zero breaking changes to existing features
- [ ] All existing tests still passing
- [ ] No linter errors
- [ ] Code reviewed and approved

---

## 🛠️ Dependencies

### New Dependencies
- `sharp` - Image processing library
- `@types/sharp` - TypeScript types for Sharp

### Existing Dependencies
- `discord.js` - Discord bot framework
- `prisma` - ORM for database
- `typescript` - Programming language
- `vitest` - Testing framework

---

## 📝 Next Steps

### Step 1: Review Documentation ✅
- [x] Requirements documented
- [x] Design documented
- [x] Planning documented
- [x] Implementation guide documented
- [x] Testing strategy documented

### Step 2: Answer Open Questions ⏳
- [ ] Review `feature-status-marriage-redesign-questions.md`
- [ ] Make decisions on high-priority questions
- [ ] Update requirements doc with final decisions

### Step 3: Review & Approve 📋
Run these commands to review the documentation:
```bash
# Review requirements
/review-requirements docs/ai/requirements/feature-status-marriage-redesign.md

# Review design
/review-design docs/ai/design/feature-status-marriage-redesign.md
```

### Step 4: Execute Implementation 🚀
Once approved, run:
```bash
/execute-plan docs/ai/planning/feature-status-marriage-redesign.md
```

This will guide you through implementing each task in the plan.

---

## 📞 Support & Questions

If you have questions or need clarification on any aspect of this feature:

1. **Requirements questions:** Review `docs/ai/requirements/feature-status-marriage-redesign.md`
2. **Technical questions:** Review `docs/ai/design/feature-status-marriage-redesign.md`
3. **Implementation questions:** Review `docs/ai/implementation/feature-status-marriage-redesign.md`
4. **Testing questions:** Review `docs/ai/testing/feature-status-marriage-redesign.md`

---

## 📅 Timeline

**Documentation Phase:** ✅ Complete  
**Review Phase:** ⏳ Pending  
**Implementation Phase:** ⏳ Not Started  
**Testing Phase:** ⏳ Not Started  
**Deployment Phase:** ⏳ Not Started  

**Estimated Total Time:** 34-46 hours (4-6 working days)

---

**Last Updated:** 2026-01-10  
**Status:** 📝 Documentation Complete - Awaiting Review & Approval

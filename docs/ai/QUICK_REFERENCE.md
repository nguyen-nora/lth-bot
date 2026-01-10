# Quick Reference: Status & Marriage Certificate Redesign

## 📁 Documentation Files

| File | Purpose | Status |
|------|---------|--------|
| `requirements/feature-status-marriage-redesign.md` | Problem, goals, user stories | ✅ Complete |
| `requirements/feature-status-marriage-redesign-questions.md` | Open questions needing decisions | ⏳ Needs Review |
| `design/feature-status-marriage-redesign.md` | Architecture, data models, APIs | ✅ Complete |
| `planning/feature-status-marriage-redesign.md` | Task breakdown, timeline, risks | ✅ Complete |
| `implementation/feature-status-marriage-redesign.md` | Code patterns, setup, security | ✅ Complete |
| `testing/feature-status-marriage-redesign.md` | Test strategy, cases, coverage | ✅ Complete |
| `FEATURE_STATUS_MARRIAGE_REDESIGN_SUMMARY.md` | Executive summary | ✅ Complete |
| `FEATURE_CHECKLIST.md` | Progress tracking | ✅ Complete |

---

## 🎯 What's Being Built

### `/status` Command Redesign
- **Before:** Shows marriage status (tied to actual marriage)
- **After:** Shows customizable relationship status + custom image
- **Key Change:** Status is independent of actual marriages

### `/giaykh` Command (NEW)
- **Purpose:** Display beautiful marriage certificate
- **Shows:** Marriage date, duration, personal messages, custom image
- **Who:** Both partners can update messages and image

---

## 📊 Database Changes

### New Tables
1. **user_profiles** - Stores relationship status and status image
2. **marriage_certificates** - Stores certificate messages and image

### Modified Tables
1. **marriages** - Adds one-to-one relation to certificates

---

## 🚀 Commands to Run

### Review Documentation
```bash
# Review requirements for completeness
/review-requirements docs/ai/requirements/feature-status-marriage-redesign.md

# Review design for technical soundness
/review-design docs/ai/design/feature-status-marriage-redesign.md
```

### Start Implementation
```bash
# Execute the plan interactively
/execute-plan docs/ai/planning/feature-status-marriage-redesign.md
```

### Generate Tests
```bash
# Generate unit tests for services
/writing-test src/services/profileService.ts

# Generate integration tests
/writing-test src/commands/statusSet.ts
```

### Code Review
```bash
# Review changes before committing
/code-review --files "src/services/profileService.ts,src/commands/statusSet.ts"
```

---

## ⚠️ Open Questions (NEEDS DECISIONS)

### Must Decide Before Implementation
1. **Image Storage:** Discord CDN or external service?
2. **Command Structure:** `/status set` or `/status-set`?
3. **Certificate Viewing:** Public or private?

**See full list:** `docs/ai/requirements/feature-status-marriage-redesign-questions.md`

---

## 📈 Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Documentation | - | ✅ Done |
| Foundation | 4-6 hours | ⏳ Not Started |
| Services | 8-10 hours | ⏳ Not Started |
| Commands | 6-8 hours | ⏳ Not Started |
| UI Polish | 2-3 hours | ⏳ Not Started |
| Testing | 6-8 hours | ⏳ Not Started |
| Deployment | 2-3 hours | ⏳ Not Started |
| **Total** | **34-46 hours** | **16.7% Complete** |

---

## 🔑 Key User Stories

| ID | Story | Priority |
|----|-------|----------|
| US-1 | View profile with stats | High |
| US-2 | Set custom relationship status | High |
| US-3 | Upload custom status image | High |
| US-4 | View others' profiles | Medium |
| US-5 | View marriage certificate | High |
| US-6 | Add personal message to certificate | High |
| US-7 | See marriage duration | Medium |
| US-8 | Customize certificate image | Medium |

---

## 🛠️ New Dependencies

```bash
npm install sharp
npm install -D @types/sharp
```

---

## 📝 Next Steps

1. ✅ **Documentation Complete** - All docs written
2. ⏳ **Review Questions** - Make decisions on open questions
3. ⏳ **Review Docs** - Run `/review-requirements` and `/review-design`
4. ⏳ **Get Approval** - Stakeholder sign-off
5. ⏳ **Start Implementation** - Run `/execute-plan`

---

## 🎨 Visual Reference

### Status Embed (After)
```
┌─────────────────────────────────────┐
│ Thông tin của tôi                   │
│ [Avatar]                            │
│ 📅 Gia nhập LHT: 01/01/2024         │
│ ✅ Điểm danh: 30 ngày               │
│ 💕 Trạng thái: Đang hẹn hò         │
│ [Custom Image]                      │
│ Soo cute<333                        │
└─────────────────────────────────────┘
```

### Certificate Embed (New)
```
┌─────────────────────────────────────┐
│ 💒 Giấy Kết Hôn 💒                  │
│ Ngày: 01/01/2024 | Thời gian: 10 ngày │
│ 💌 User A: "Forever together"      │
│ 💌 User B: "Love you always"       │
│ [Custom Certificate Image]          │
│ User A ❤️ User B                    │
└─────────────────────────────────────┘
```

---

## 🔗 Related Files

### Source Code (To Be Created)
- `src/services/profileService.ts`
- `src/services/imageService.ts`
- `src/commands/statusSet.ts`
- `src/commands/statusImage.ts`
- `src/commands/giaykh.ts`
- `src/commands/giaykhMessage.ts`
- `src/commands/giaykhImage.ts`

### Tests (To Be Created)
- `src/services/profileService.test.ts`
- `src/services/imageService.test.ts`
- Integration test suite

### Migrations (To Be Created)
- `prisma/migrations/YYYYMMDD_add_user_profiles/`
- `prisma/migrations/YYYYMMDD_add_marriage_certificates/`

---

**Quick Start:** Read `FEATURE_STATUS_MARRIAGE_REDESIGN_SUMMARY.md` for full overview.

**Last Updated:** 2026-01-10

# Open Questions for Status & Marriage Certificate Redesign

This document tracks the open questions identified in the requirements phase that need clarification before implementation.

## Priority: HIGH (Blocking Implementation)

### 1. Image Storage Strategy
**Question:** Where should we store uploaded images?

**Options:**
- **A) Discord CDN (Recommended)** - Upload to temporary channel, get CDN URL
  - ✅ Free, reliable, global CDN
  - ✅ No external dependencies
  - ❌ Need to research URL persistence
  - ❌ Need a dedicated upload channel
  
- **B) External Service** (Imgur, Cloudinary)
  - ✅ Purpose-built for image hosting
  - ❌ External dependency, rate limits
  - ❌ May require API keys/costs
  
- **C) Self-hosted**
  - ❌ Infrastructure complexity
  - ❌ Storage costs
  - ❌ Maintenance overhead

**Recommendation:** Option A (Discord CDN)
**Action Required:** User decision needed

---

### 2. Command Structure for Status Updates
**Question:** What should the command structure be for setting status?

**Options:**
- **A) `/status set status:married`** - Subcommand with option
- **B) `/status-set married`** - Separate command
- **C) `/profile status married`** - New profile command group

**Recommendation:** Option A (consistent with Discord patterns)
**Action Required:** User decision needed

---

### 3. Command Structure for Image Upload
**Question:** What should the command structure be for uploading images?

**Options:**
- **A) `/status image [attachment]`** - Subcommand
- **B) `/status-image [attachment]`** - Separate command
- **C) Combined with status set**

**Recommendation:** Option A (consistent with status set)
**Action Required:** User decision needed

---

### 4. Certificate Message Command Structure
**Question:** What should the command structure be for setting certificate messages?

**Options:**
- **A) `/giaykh message "text"`** - Subcommand
- **B) `/giaykh-message "text"`** - Separate command
- **C) `/certificate message "text"`** - English command

**Recommendation:** Option A (keeps certificate commands grouped)
**Action Required:** User decision needed

---

## Priority: MEDIUM (Can Use Defaults)

### 5. Certificate vs Status Images
**Question:** Should certificate image be separate from status image, or shared?

**Options:**
- **A) Separate images** - Status has one image, certificate has another
  - ✅ More flexibility
  - ❌ More complexity
  
- **B) Shared image** - One image used for both
  - ✅ Simpler for users
  - ❌ Less customization

**Recommendation:** Option A (separate) - More flexibility for users
**Action Required:** User decision or use recommendation

---

### 6. Default Images
**Question:** What should be shown if user hasn't uploaded an image?

**Options:**
- **A) Discord avatar** - Use user's Discord profile picture
- **B) Placeholder image** - Generic placeholder
- **C) No image** - Empty space

**Recommendation:** Option A (Discord avatar) - Most personalized default
**Action Required:** User decision or use recommendation

---

### 7. Image File Size Limit
**Question:** What should the maximum file size be?

**Options:**
- **A) 8MB** - Discord's default limit for non-Nitro
- **B) 5MB** - Smaller for faster processing
- **C) 10MB** - Allow larger files

**Recommendation:** Option A (8MB) - Matches Discord's limits
**Action Required:** User decision or use recommendation

---

### 8. Certificate Viewing Permissions
**Question:** Can users view other people's marriage certificates?

**Options:**
- **A) Yes** - `/giaykh @user` shows their certificate
  - ✅ Public celebration of marriages
  - ❌ Privacy concerns for messages
  
- **B) No** - Only own certificate visible
  - ✅ Privacy
  - ❌ Less social

**Recommendation:** Option A (public) - Marriages are public celebrations
**Action Required:** User decision or use recommendation

---

## Priority: LOW (Nice to Have)

### 9. Status Translation
**Question:** Should status options be displayed in Vietnamese?

**Options:**
- **A) Vietnamese** - "độc thân", "đã kết hôn", "đang hẹn hò", "phức tạp"
- **B) English** - "single", "married", "dating", "complicated"
- **C) Both** - Show both languages

**Recommendation:** Option A (Vietnamese) - Matches bot's language
**Action Required:** User decision or use recommendation

---

### 10. Existing User Migration
**Question:** How should we handle existing users when adding profiles?

**Options:**
- **A) Auto-set married status** - If user has marriage, set status to "married"
- **B) All default to single** - Let users set their own status
- **C) Prompt users** - Send DM asking them to set status

**Recommendation:** Option B (all single) - Status is independent of marriage
**Action Required:** User decision or use recommendation

---

## Proposed Defaults (If No User Input)

Based on the recommendations above, here are the proposed defaults:

```typescript
const DEFAULTS = {
  imageStorage: 'discord-cdn',
  statusSetCommand: '/status set',
  statusImageCommand: '/status image',
  certificateMessageCommand: '/giaykh message',
  certificateImageCommand: '/giaykh image',
  separateImages: true,
  defaultImage: 'discord-avatar',
  maxImageSize: 8 * 1024 * 1024, // 8MB
  certificateViewable: true,
  statusLanguage: 'vietnamese',
  existingUserStatus: 'single'
};
```

## Status Translation Map (If Vietnamese Selected)

```typescript
const STATUS_TRANSLATIONS = {
  single: 'Độc thân',
  complicated: 'Phức tạp',
  married: 'Đã kết hôn',
  dating: 'Đang hẹn hò'
};
```

## Next Steps

1. **Review this document** with stakeholders
2. **Make decisions** on high-priority questions
3. **Update requirements doc** with final decisions
4. **Proceed to implementation** using `/execute-plan`

---

**Document Status:** ✅ Complete - Awaiting User Decisions
**Last Updated:** 2026-01-10

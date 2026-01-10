# Final Decisions - Status & Marriage Certificate Redesign

## ✅ All Questions Resolved

All open questions have been answered. The feature is now ready for implementation.

---

## 📋 Final Decisions Summary

| # | Question | Decision | Impact |
|---|----------|----------|--------|
| 1 | Image Storage | **Self-hosted** | Store in `./data/images/` |
| 2 | Status Command | **`/status set`** | Subcommand pattern |
| 3 | Image Upload | **`/status image`** | Subcommand pattern |
| 4 | Certificate Message | **`/giaykh message`** | Subcommand pattern |
| 5 | Image Separation | **Separate** | Status & certificate have different images |
| 6 | Default Image | **Discord avatar** | Use user's profile picture |
| 7 | File Size Limit | **8MB** | Discord's standard limit |
| 8 | Certificate Viewing | **Public** | Anyone can view with `/giaykh @user` |
| 9 | Status Language | **Vietnamese** | Custom: "mập mờ" for complicated |
| 10 | User Migration | **Default to single** | All existing users start as "single" |

---

## 🎨 Status Translations (Vietnamese)

```typescript
const STATUS_TRANSLATIONS = {
  single: 'Độc thân',
  married: 'Đã kết hôn',
  dating: 'Đang hẹn hò',
  complicated: 'Mập mờ'  // Custom: not "phức tạp"
};
```

---

## 🗂️ Self-Hosted Storage Implementation

### Directory Structure
```
data/
├── database.sqlite
└── images/
    ├── status/
    │   ├── {timestamp}-{random}.jpg
    │   └── ...
    └── certificates/
        ├── {timestamp}-{random}.jpg
        └── ...
```

### Configuration
```env
IMAGE_STORAGE_PATH=./data/images
MAX_IMAGE_SIZE_MB=8
IMAGE_TARGET_SIZE=480
```

### Storage Management
- Images saved as JPEG (quality: 90%)
- Filename format: `{timestamp}-{random}.jpg`
- Automatic directory creation
- File permissions: 644 (readable)
- Cleanup on profile/marriage deletion

### Serving Images
Images will be served through Discord attachments when displaying embeds:
```typescript
// Load image from storage
const buffer = await imageService.loadFromStorage(filepath);

// Attach to Discord message
const attachment = new AttachmentBuilder(buffer, { name: 'image.jpg' });

// Include in embed
embed.setImage('attachment://image.jpg');
```

---

## 🔧 Command Structure (Final)

### Status Commands
```
/status [user]
  └─ View user's profile status

/status set <status>
  └─ Set relationship status
  └─ Options: single, married, dating, complicated

/status image <attachment>
  └─ Upload custom status image (480x480)
```

### Certificate Commands
```
/giaykh [user]
  └─ View marriage certificate
  └─ Public: can view others' certificates

/giaykh message <text>
  └─ Set your personal message (max 500 chars)

/giaykh image <attachment>
  └─ Upload custom certificate image (480x480)
```

---

## 📊 Updated Database Schema

### UserProfile Table
```sql
CREATE TABLE user_profiles (
  id INTEGER PRIMARY KEY,
  user_id TEXT NOT NULL,
  guild_id TEXT NOT NULL,
  relationship_status TEXT DEFAULT 'single',  -- 'single'|'married'|'dating'|'complicated'
  status_image_path TEXT,  -- File path, not URL
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, guild_id)
);
```

### MarriageCertificate Table
```sql
CREATE TABLE marriage_certificates (
  id INTEGER PRIMARY KEY,
  marriage_id INTEGER UNIQUE NOT NULL,
  user1_message TEXT,
  user2_message TEXT,
  certificate_image_path TEXT,  -- File path, not URL
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (marriage_id) REFERENCES marriages(id) ON DELETE CASCADE
);
```

---

## 🔒 Security Considerations (Updated)

### File Storage Security
- ✅ Validate file types before saving
- ✅ Generate random filenames (prevent path traversal)
- ✅ Store outside web-accessible directory
- ✅ Set proper file permissions (644)
- ✅ Limit total storage per user (future)
- ✅ Scan for malicious content (future enhancement)

### Cleanup Strategy
- Delete image file when profile is deleted
- Delete image file when certificate is deleted
- Periodic cleanup of orphaned files
- Monitor disk usage and alert when > 80% full

---

## 📈 Updated Risks

### New Risk: Disk Space Management
**Risk:** Self-hosted storage can fill up disk space  
**Impact:** Medium - Bot may fail to save new images  
**Mitigation:**
- Monitor disk usage regularly
- Set up alerts at 80% capacity
- Implement cleanup for deleted profiles
- Plan storage scaling strategy
- Consider image compression

---

## ✅ Implementation Checklist Updates

### Additional Tasks for Self-Hosted Storage

#### Phase 1: Foundation
- [ ] Create `./data/images/` directory structure
- [ ] Set up file permissions
- [ ] Add storage path to `.gitignore`
- [ ] Document backup strategy for images

#### Phase 2: Services
- [ ] Implement `saveToStorage()` in ImageService
- [ ] Implement `loadFromStorage()` in ImageService
- [ ] Implement `deleteFromStorage()` for cleanup
- [ ] Add disk space monitoring utility
- [ ] Add orphaned file cleanup utility

#### Phase 3: Commands
- [ ] Update commands to use file attachments for display
- [ ] Test image serving through Discord attachments
- [ ] Verify images display correctly in embeds

#### Phase 6: Deployment
- [ ] Ensure storage directory exists on production
- [ ] Set up disk monitoring on production server
- [ ] Configure backup for images directory
- [ ] Document storage maintenance procedures

---

## 🚀 Ready for Implementation

All decisions have been made and documented. The feature is now **fully specified** and ready for implementation.

### Next Steps:
1. ✅ All questions answered
2. ✅ Documentation updated with decisions
3. ⏳ Run `/review-requirements` to validate
4. ⏳ Run `/review-design` to validate
5. ⏳ Run `/execute-plan` to start implementation

---

## 📝 Changes from Original Plan

| Aspect | Original | Final Decision | Reason |
|--------|----------|----------------|--------|
| Image Storage | Discord CDN | Self-hosted | User preference for control |
| Status Translation | "phức tạp" | "mập mờ" | User preference for wording |
| Migration Strategy | Auto-set married | All default single | Maintain independence |

---

## 📞 Implementation Notes

### For Developers:
- Use `fs/promises` for async file operations
- Generate unique filenames with timestamp + random string
- Always use `path.join()` for cross-platform compatibility
- Implement proper error handling for file I/O
- Test with various image formats and sizes
- Consider implementing image cleanup cron job

### For Deployment:
- Ensure `./data/images/` directory exists
- Set proper permissions (755 for directories, 644 for files)
- Configure backup strategy for images
- Monitor disk usage regularly
- Plan for storage scaling

---

**Status:** ✅ All Decisions Finalized  
**Last Updated:** 2026-01-10  
**Ready for:** Implementation Phase

---
phase: requirements
title: Requirements & Problem Understanding
description: Clarify the problem space, gather requirements, and define success criteria
---

# Requirements & Problem Understanding

## Problem Statement
**What problem are we solving?**

- **Current Issue:** The `/status` command currently ties relationship status directly to actual marriages in the system. Users cannot express their relationship status independently.
- **Who is affected:** All Discord server members who want to display their relationship status or view their profile information.
- **Current situation:** 
  - Status shows "married" only if user has an actual marriage via `/kethon`
  - No way to customize profile appearance with images
  - No dedicated marriage certificate view to celebrate marriages
  - Marriage information is mixed with general status information

## Goals & Objectives
**What do we want to achieve?**

### Primary goals
1. **Decouple relationship status from actual marriages** - Users can set their status independently
2. **Add customizable profile images** - Users can personalize their status display
3. **Create dedicated marriage certificate command** - Provide a special view for married couples
4. **Enable personal messages on certificates** - Allow couples to add meaningful messages

### Secondary goals
1. Maintain backward compatibility with existing marriages
2. Provide intuitive UI/UX for status customization
3. Prepare infrastructure for future features (points, streaks)

### Non-goals (what's explicitly out of scope)
1. Implementing points system (deferred to future)
2. Implementing day streak tracking (deferred to future)
3. Changing existing marriage proposal/acceptance flow
4. Modifying divorce functionality

## User Stories & Use Cases
**How will users interact with the solution?**

### Status Command (`/status`)
- **US-1:** As a user, I want to view my profile with avatar, username, join date, and check-in stats so that I can see my server activity
- **US-2:** As a user, I want to set my relationship status (single/complicated/married/dating) independently of actual marriages so that I can express my real-world relationship
- **US-3:** As a user, I want to upload a custom image for my status display so that I can personalize my profile
- **US-4:** As a user, I want to view another user's status by mentioning them so that I can see their profile

### Marriage Certificate Command (`/giaykh`)
- **US-5:** As a married user, I want to view a beautiful marriage certificate showing our marriage details so that I can celebrate our union
- **US-6:** As a married user, I want to add/update my personal message on the certificate so that I can express my feelings
- **US-7:** As a married user, I want to see marriage duration calculated from our marriage date so that I can track our time together
- **US-8:** As a married user, I want to customize the certificate image so that we can personalize our certificate

### Key workflows and scenarios
1. **New user sets status:** User joins server → checks status (default: single) → updates to "dating" → uploads custom image
2. **User gets married:** User proposes via `/kethon` → partner accepts → marriage created → users can now view certificate via `/giaykh`
3. **Married user updates certificate:** User runs `/giaykh message "My love message"` → message saved → certificate displays updated message
4. **Status independence:** User is married in system but sets status to "single" (or vice versa) - both are independent

### Edge cases to consider
1. User sets status to "married" but has no actual marriage in system
2. User has actual marriage but sets status to "single"
3. User uploads invalid image format
4. User uploads extremely large image
5. One partner updates certificate message, other hasn't set theirs yet
6. User tries to view certificate when not married
7. User tries to view another user's certificate

## Success Criteria
**How will we know when we're done?**

### Measurable outcomes
1. ✅ Users can set 4 different relationship statuses independently
2. ✅ Users can upload and display custom 480x480px images on status
3. ✅ Marriage certificate command displays all required information
4. ✅ Both partners can update certificate messages anytime
5. ✅ Marriage duration is calculated correctly from marriage date
6. ✅ All existing marriages continue to work without data loss

### Acceptance criteria
1. `/status` command shows: avatar, username, join date, check-in count, customizable status, custom image
2. `/status @user` works for viewing other users' profiles
3. `/giaykh` command shows: certificate title, marriage date, number of days married, messages from both partners, custom image
4. Status field has exactly 4 options: single, complicated, married, dating
5. Default status for new users is "single"
6. Images are automatically cropped/resized to 480x480px
7. Marriage duration updates dynamically based on current date
8. All stored images are converted to JPEG format (quality: 90%)
9. Image filenames follow format: {timestamp}-{random}.jpg

### Performance benchmarks
1. Status command responds within 2 seconds
2. Image upload and processing completes within 5 seconds
3. Certificate generation responds within 2 seconds

## Constraints & Assumptions
**What limitations do we need to work within?**

### Technical constraints
1. SQLite database (existing)
2. Discord.js framework (existing)
3. Discord embed size limits (6000 characters, 25 fields)
4. Discord image hosting limitations
5. TypeScript/Node.js environment

### Business constraints
1. Must maintain existing marriage functionality
2. Cannot break existing commands
3. Must preserve all existing marriage data

### Time/budget constraints
1. Target completion: 4-6 working days (34-46 hours)
2. No external service costs (self-hosted storage)
3. No additional infrastructure required

### Assumptions
1. Users have DMs enabled for receiving notifications
2. Users provide valid image URLs or upload supported formats (jpg, png, gif, webp)
3. Server has custom emojis available for status display
4. Points and streak systems will be added in future iterations
5. Image hosting will be handled by self-hosted storage (./data/images/)
6. Images will be served through Discord attachments when displaying embeds
7. Bot has file system read/write permissions for ./data/images/
8. Server has sufficient disk space for image storage
9. Storage monitoring and cleanup will be implemented

## Questions & Open Items
**What do we still need to clarify?**

### Resolved ✅
- ✅ Can users set "married" status without actual marriage? **Yes**
- ✅ How do users upload images? **Direct upload, auto-cropped to 480x480**
- ✅ When can users set certificate messages? **Anytime, both partners independently**
- ✅ What are points? **Deferred to future**
- ✅ What is day streak? **Deferred to future**
- ✅ What is "number of days"? **Total days married since marriage date**

### Resolved ✅
1. **Image Storage:** ✅ **Self-hosted storage** - Store images on the bot's server/storage
2. **Status Update Command:** ✅ **`/status set status:married`** - Subcommand with option
3. **Image Upload Command:** ✅ **`/status image [attachment]`** - Subcommand
4. **Certificate Message Command:** ✅ **`/giaykh message "My message"`** - Subcommand
5. **Certificate Image:** ✅ **Separate images** - Status has one image, certificate has another
6. **Default Images:** ✅ **Use Discord avatar** - Most personalized default
7. **Image File Size Limit:** ✅ **8MB** - Discord's default limit for non-Nitro users
8. **Certificate Viewing Permissions:** ✅ **Public** - `/giaykh @user` shows their certificate
9. **Status Translation:** ✅ **Vietnamese** with custom translation:
   - "single" → "độc thân"
   - "married" → "đã kết hôn"
   - "dating" → "đang hẹn hò"
   - "complicated" → "mập mờ" (custom: not "phức tạp")
10. **Existing User Migration:** ✅ **Leave all as default "single"** - Users set their own status

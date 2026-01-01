# How to Add Custom Discord Emojis to Your Bot

## Quick Steps

### 1. Get Emoji ID from Discord

**Method 1: Using Developer Mode (Recommended)**
1. Open Discord Settings → Advanced → Enable **Developer Mode**
2. Go to your Discord server (ID: 1449180531777339563)
3. Type `:emoji_48:` in chat
4. Right-click on the emoji that appears
5. Click **"Copy ID"**
6. You'll get a number like: `1234567890123456789`

**Method 2: Using Backslash**
1. Type `\:emoji_48:` in Discord (with backslash)
2. You'll see: `<:emoji_48:1234567890123456789>`
3. Copy the ID part: `1234567890123456789`

### 2. Add Emoji ID to Code

Open `src/utils/emojis.ts` and add your emoji ID:

```typescript
export const EMOJI_IDS = {
  emoji_48: '1234567890123456789', // Replace with your actual ID
  // Add more emojis here
} as const;
```

### 3. Use Emoji in Status Service

Open `src/services/statusService.ts` and find the section where you want to add emojis.

**Example: Add emoji before "Bang chiến"**

```typescript
// Find this line (around line 245):
description += `• Bang chiến: ${daysText}\n`;

// Change it to:
const battleEmoji = getEmoji('emoji_48', '1234567890123456789');
description += `${battleEmoji} • Bang chiến: ${daysText}\n`;
```

**Or if you added it to EMOJI_IDS:**
```typescript
const battleEmoji = getEmoji('emoji_48'); // Uses EMOJI_IDS automatically
description += `${battleEmoji} • Bang chiến: ${daysText}\n`;
```

### 4. Available Helper Functions

**formatEmoji(emojiName, emojiId?)**
- Uses EMOJI_IDS if emojiId not provided
- Returns: `<:emoji_48:1234567890123456789>`

**formatEmojiFromClient(client, emojiId)**
- Gets emoji from Discord client cache (if bot is in server)
- Returns formatted emoji string

**getEmoji(emojiName, emojiId?)**
- Helper function in statusService
- Tries client cache first, falls back to formatEmoji

## Example: Complete Implementation

```typescript
// In statusService.ts, around line 245:

// Option 1: Direct ID
const battleEmoji = getEmoji('emoji_48', '1234567890123456789');
description += `${battleEmoji} • Bang chiến: ${daysText}\n`;

// Option 2: Using EMOJI_IDS constant
const battleEmoji = getEmoji('emoji_48'); // Must be in EMOJI_IDS
description += `${battleEmoji} • Bang chiến: ${daysText}\n`;
```

## Notes

- The bot must be in the server to use emojis
- Emoji IDs are unique per server
- If emoji is not found, it will show `:emoji_name:` as fallback
- You can use emojis from any server the bot is in


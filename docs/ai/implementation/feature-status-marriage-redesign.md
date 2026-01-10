---
phase: implementation
title: Implementation Guide
description: Technical implementation notes, patterns, and code guidelines
---

# Implementation Guide

## Development Setup
**How do we get started?**

### Prerequisites and dependencies
```bash
# Existing dependencies (already installed)
- Node.js >= 18.x
- npm >= 9.x
- TypeScript >= 5.x
- Discord.js >= 14.x
- Prisma >= 5.x

# New dependencies to install
npm install sharp
npm install -D @types/sharp
```

### Environment setup steps
1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up database:**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev
   ```

3. **Configure Discord bot:**
   - Ensure `.env` file has `DISCORD_TOKEN` and `DATABASE_URL`
   - Bot needs `GUILD_MEMBERS` intent for user lookups
   - Bot needs `MESSAGE_CONTENT` intent for attachment processing

4. **Create image upload channel (optional):**
   - Create a private channel for temporary image uploads
   - Store channel ID in environment variable `IMAGE_UPLOAD_CHANNEL_ID`

### Configuration needed
```env
# .env file
DISCORD_TOKEN=your_bot_token_here
DATABASE_URL=file:./data/database.sqlite
IMAGE_STORAGE_PATH=./data/images  # Path to store uploaded images
MAX_IMAGE_SIZE_MB=8  # Optional: default 8MB
IMAGE_TARGET_SIZE=480  # Optional: default 480x480
```

## Code Structure
**How is the code organized?**

### Directory structure
```
src/
├── commands/
│   ├── status.ts              # Modified: View user status
│   ├── statusSet.ts           # NEW: Set relationship status
│   ├── statusImage.ts         # NEW: Upload status image
│   ├── giaykh.ts              # NEW: View marriage certificate
│   ├── giaykhMessage.ts       # NEW: Set certificate message
│   └── giaykhImage.ts         # NEW: Set certificate image
├── services/
│   ├── statusService.ts       # Modified: Extended with profile data
│   ├── marriageService.ts     # Modified: Extended with certificate
│   ├── profileService.ts      # NEW: User profile management
│   └── imageService.ts        # NEW: Image processing
├── database/
│   └── prisma.ts              # Existing: Database client
└── utils/
    ├── translations.ts        # Modified: Add new translation keys
    ├── emojis.ts              # Modified: Add status emojis
    └── validators.ts          # NEW: Input validation helpers

prisma/
├── schema.prisma              # Modified: Add new models
└── migrations/
    ├── YYYYMMDDHHMMSS_add_user_profiles/
    └── YYYYMMDDHHMMSS_add_marriage_certificates/
```

### Module organization
- **Commands** - Discord slash command handlers
- **Services** - Business logic and data operations
- **Database** - Prisma client and models
- **Utils** - Shared utilities and helpers

### Naming conventions
- **Files:** camelCase (e.g., `profileService.ts`)
- **Classes:** PascalCase (e.g., `ProfileService`)
- **Functions:** camelCase (e.g., `getUserProfile()`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_IMAGE_SIZE`)
- **Interfaces:** PascalCase (e.g., `UserProfile`)
- **Types:** PascalCase (e.g., `RelationshipStatus`)

## Implementation Notes
**Key technical details to remember:**

### Core Features

#### Feature 1: User Profile Management
**Implementation approach:**
- Create `UserProfile` model with relationship status and image URL
- Use `getOrCreate` pattern - create profile on first access
- Default status is "single"
- Status is enum: `"single" | "complicated" | "married" | "dating"`
- Image URL stores Discord CDN link

**Key code pattern:**
```typescript
// Get or create profile
async getProfile(userId: string, guildId: string): Promise<UserProfile> {
  let profile = await prisma.userProfile.findUnique({
    where: { userId_guildId: { userId, guildId } }
  });
  
  if (!profile) {
    profile = await prisma.userProfile.create({
      data: { userId, guildId, relationshipStatus: 'single' }
    });
  }
  
  return profile;
}
```

#### Feature 2: Image Processing
**Implementation approach:**
- Use Sharp library for image manipulation
- Validate image format (jpg, png, gif, webp)
- Validate file size (max 8MB)
- Crop to square (480x480) using Sharp
- Save to local storage (./data/images/)
- Store file path in database

**Key code pattern:**
```typescript
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

async processImage(attachment: Attachment): Promise<string> {
  // Download image
  const response = await fetch(attachment.url);
  const buffer = Buffer.from(await response.arrayBuffer());
  
  // Process with Sharp
  const processed = await sharp(buffer)
    .resize(480, 480, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 90 })
    .toBuffer();
  
  // Generate unique filename
  const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
  const storagePath = process.env.IMAGE_STORAGE_PATH || './data/images';
  const filepath = path.join(storagePath, filename);
  
  // Ensure directory exists
  await fs.mkdir(storagePath, { recursive: true });
  
  // Save to local storage
  await fs.writeFile(filepath, processed);
  
  return filepath;
}
```

#### Feature 3: Marriage Certificate
**Implementation approach:**
- Create `MarriageCertificate` model with one-to-one relation to Marriage
- Auto-create certificate when marriage is created
- Store individual messages for each partner (user1Message, user2Message)
- Calculate marriage duration dynamically from `marriedAt` date
- Format as beautiful embed with custom image

**Key code pattern:**
```typescript
calculateMarriageDuration(marriedAt: Date): { days: number; formatted: string } {
  const now = new Date();
  const diffMs = now.getTime() - marriedAt.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  return {
    days,
    formatted: `${days} ngày`
  };
}
```

#### Feature 4: Status Display
**Implementation approach:**
- Extend StatusService to fetch profile data
- Join profile + marriage + attendance in single query
- Display custom status with emoji
- Display custom image in embed
- Maintain existing layout and styling

**Key code pattern:**
```typescript
async getFullProfile(userId: string, guildId: string) {
  const profile = await this.getProfile(userId, guildId);
  const marriage = await marriageService.getMarriage(userId, guildId);
  const attendance = await attendanceService.getUserAttendanceStats(userId, guildId);
  
  return { profile, marriage, attendance };
}
```

### Patterns & Best Practices

#### 1. Service Layer Pattern
- All business logic in services
- Commands are thin wrappers that call services
- Services handle validation, database operations, and formatting

#### 2. Error Handling Pattern
```typescript
try {
  // Defer reply for long operations
  await interaction.deferReply({ ephemeral: true });
  
  // Perform operation
  const result = await service.doSomething();
  
  // Edit reply with success
  await interaction.editReply({ content: 'Success!' });
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  
  if (interaction.deferred) {
    await interaction.editReply({ content: message });
  } else {
    await interaction.reply({ content: message, ephemeral: true });
  }
}
```

#### 3. Validation Pattern
```typescript
// Validate enum values
const VALID_STATUSES = ['single', 'complicated', 'married', 'dating'] as const;
type RelationshipStatus = typeof VALID_STATUSES[number];

function validateStatus(status: string): status is RelationshipStatus {
  return VALID_STATUSES.includes(status as RelationshipStatus);
}
```

#### 4. Translation Pattern
```typescript
// Always use translation service for user-facing messages
import { translationService } from '../services/translationService.js';

const message = translationService.t('status.updated', { status: newStatus });
```

#### 5. Rate Limiting Pattern
```typescript
// Use existing rate limiter service
const canUpdate = await rateLimiter.checkRateLimit(userId, guildId, 'status_update');
if (!canUpdate) {
  throw new Error(translationService.t('errors.rateLimited'));
}
```

### Common utilities/helpers

#### Image Validation Helper
```typescript
// src/utils/validators.ts
export function validateImageAttachment(attachment: Attachment): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 8 * 1024 * 1024; // 8MB
  
  if (!validTypes.includes(attachment.contentType || '')) {
    throw new Error('Invalid image format. Use JPG, PNG, GIF, or WebP.');
  }
  
  if (attachment.size > maxSize) {
    throw new Error('Image too large. Maximum size is 8MB.');
  }
  
  return true;
}
```

#### Marriage User Helper
```typescript
// Determine which user in marriage (user1 or user2)
export function getMarriageUserPosition(
  marriage: Marriage,
  userId: string
): 'user1' | 'user2' | null {
  if (marriage.user1_id === userId) return 'user1';
  if (marriage.user2_id === userId) return 'user2';
  return null;
}
```

## Integration Points
**How do pieces connect?**

### Database Integration
```typescript
// Prisma client is singleton
import prisma from '../database/prisma.js';

// Use in services
const profile = await prisma.userProfile.findUnique({
  where: { userId_guildId: { userId, guildId } }
});
```

### Discord API Integration
```typescript
// Commands receive interaction
async execute(interaction: ChatInputCommandInteraction) {
  const user = interaction.user;
  const guild = interaction.guild;
  
  // Access Discord client for emoji/user lookups
  const emoji = formatEmojiFromGuildByName(
    interaction.client,
    SERVER_ID,
    'emoji_name'
  );
}
```

### Service Integration
```typescript
// Services import each other
import { marriageService } from './marriageService.js';
import { profileService } from './profileService.js';
import { imageService } from './imageService.js';

// Call from one service to another
const profile = await profileService.getProfile(userId, guildId);
const marriage = await marriageService.getMarriage(userId, guildId);
```

### Sharp Integration
```typescript
import sharp from 'sharp';

// Process image buffer
const processed = await sharp(buffer)
  .resize(480, 480, {
    fit: 'cover',        // Crop to fill
    position: 'center'   // Center crop
  })
  .jpeg({ quality: 90 }) // Optimize as JPEG
  .toBuffer();
```

## Error Handling
**How do we handle failures?**

### Error Handling Strategy

#### 1. Service-Level Errors
Services throw descriptive errors:
```typescript
if (!marriage) {
  throw new Error(translationService.t('errors.notMarried'));
}
```

#### 2. Command-Level Handling
Commands catch and format errors:
```typescript
try {
  await service.doSomething();
} catch (error) {
  const message = error instanceof Error 
    ? error.message 
    : translationService.t('common.unknownError');
  
  await interaction.reply({ content: message, ephemeral: true });
}
```

#### 3. Validation Errors
Validate early and throw clear errors:
```typescript
if (!validateStatus(status)) {
  throw new Error(translationService.t('errors.invalidStatus'));
}
```

#### 4. Database Errors
Wrap database operations:
```typescript
try {
  await prisma.userProfile.create({ data });
} catch (error) {
  if (error.code === 'P2002') {
    throw new Error('Profile already exists');
  }
  throw error;
}
```

### Logging Approach
```typescript
// Info logging
console.log(`✅ Profile created for user ${userId}`);

// Warning logging
console.warn(`⚠️  Image processing slow: ${duration}ms`);

// Error logging
console.error('❌ Failed to process image:', error);

// Validation logging (not errors)
console.log(`ℹ️  Validation: ${message}`);
```

### Retry/Fallback Mechanisms

#### Image Upload Retry
```typescript
async uploadToDiscord(buffer: Buffer, retries = 3): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      return await this.doUpload(buffer);
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(1000 * (i + 1)); // Exponential backoff
    }
  }
}
```

#### Fallback for Missing Data
```typescript
// Use default if profile doesn't exist
const status = profile?.relationshipStatus || 'single';
const imageUrl = profile?.statusImageUrl || user.displayAvatarURL();
```

## Performance Considerations
**How do we keep it fast?**

### Optimization Strategies

#### 1. Database Indexes
```prisma
model UserProfile {
  // ...
  @@unique([userId, guildId])  // Fast lookups
  @@index([userId, guildId])   // Redundant but explicit
}
```

#### 2. Efficient Queries
```typescript
// Use select to fetch only needed fields
const profile = await prisma.userProfile.findUnique({
  where: { userId_guildId: { userId, guildId } },
  select: { relationshipStatus: true, statusImageUrl: true }
});
```

#### 3. Batch Operations
```typescript
// Fetch multiple profiles at once
const profiles = await prisma.userProfile.findMany({
  where: { userId: { in: userIds }, guildId }
});
```

#### 4. Defer Long Operations
```typescript
// Defer reply immediately for image processing
await interaction.deferReply({ ephemeral: true });

// Process image (may take 3-5 seconds)
const url = await imageService.processImage(attachment);

// Edit reply when done
await interaction.editReply({ content: 'Image uploaded!' });
```

### Caching Approach

#### Profile Caching (Future Enhancement)
```typescript
// Consider adding in-memory cache for frequently accessed profiles
const cache = new Map<string, { profile: UserProfile; expires: number }>();

async getProfile(userId: string, guildId: string) {
  const key = `${userId}:${guildId}`;
  const cached = cache.get(key);
  
  if (cached && cached.expires > Date.now()) {
    return cached.profile;
  }
  
  const profile = await prisma.userProfile.findUnique(...);
  cache.set(key, { profile, expires: Date.now() + 60000 }); // 1 min cache
  
  return profile;
}
```

### Query Optimization

#### Use Joins Instead of Multiple Queries
```typescript
// BAD: Multiple queries
const profile = await prisma.userProfile.findUnique(...);
const marriage = await prisma.marriage.findFirst(...);
const attendance = await prisma.attendance.findMany(...);

// GOOD: Single query with includes
const data = await prisma.userProfile.findUnique({
  where: { userId_guildId: { userId, guildId } },
  include: {
    // Note: This requires setting up relations in schema
  }
});
```

### Resource Management

#### Image Buffer Cleanup
```typescript
// Sharp automatically cleans up buffers
// But explicitly null large objects when done
let buffer: Buffer | null = await downloadImage();
const processed = await sharp(buffer).resize(...).toBuffer();
buffer = null; // Allow GC to collect
```

#### Connection Pooling
```typescript
// Prisma handles connection pooling automatically
// But ensure proper cleanup in tests
afterAll(async () => {
  await prisma.$disconnect();
});
```

## Security Notes
**What security measures are in place?**

### Authentication/Authorization

#### User Verification
```typescript
// Verify user is part of marriage before allowing updates
const marriage = await marriageService.getMarriage(userId, guildId);
if (!marriage) {
  throw new Error('You are not married');
}

const position = getMarriageUserPosition(marriage, userId);
if (!position) {
  throw new Error('Unauthorized');
}
```

#### Guild Verification
```typescript
// Always verify guild context
if (!interaction.guild) {
  throw new Error('This command can only be used in a server');
}
```

### Input Validation

#### Status Validation
```typescript
const VALID_STATUSES = ['single', 'complicated', 'married', 'dating'] as const;

if (!VALID_STATUSES.includes(status)) {
  throw new Error('Invalid status');
}
```

#### Message Length Validation
```typescript
const MAX_MESSAGE_LENGTH = 500;

if (message.length > MAX_MESSAGE_LENGTH) {
  throw new Error(`Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters.`);
}
```

#### Image Validation
```typescript
// Validate file type
const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
if (!validTypes.includes(attachment.contentType || '')) {
  throw new Error('Invalid image format');
}

// Validate file size
const maxSize = 8 * 1024 * 1024; // 8MB
if (attachment.size > maxSize) {
  throw new Error('Image too large');
}
```

### Data Sanitization

#### SQL Injection Prevention
```typescript
// Prisma automatically prevents SQL injection via parameterized queries
// SAFE:
await prisma.userProfile.findUnique({
  where: { userId_guildId: { userId, guildId } }
});

// Never use raw SQL unless absolutely necessary
```

#### XSS Prevention
```typescript
// Discord automatically escapes embed content
// But sanitize user input before storing
function sanitizeMessage(message: string): string {
  // Remove potential markdown injection
  return message
    .replace(/```/g, '\'\'\'')  // Prevent code blocks
    .replace(/`/g, '\'')        // Prevent inline code
    .trim();
}
```

### Secrets Management

#### Environment Variables
```typescript
// Never hardcode tokens or secrets
const token = process.env.DISCORD_TOKEN;
if (!token) {
  throw new Error('DISCORD_TOKEN not set');
}

// Use .env file (gitignored)
// Use environment variables in production
```

#### Database URL
```typescript
// Store database URL in environment
const databaseUrl = process.env.DATABASE_URL;

// Never commit database files to git
// Add to .gitignore: data/*.sqlite
```

### Rate Limiting

#### Command Rate Limiting
```typescript
// Implement rate limiting for update commands
const RATE_LIMIT_MS = 60000; // 1 minute

async checkRateLimit(userId: string, action: string): Promise<boolean> {
  const key = `${userId}:${action}`;
  const lastUpdate = rateLimitCache.get(key);
  
  if (lastUpdate && Date.now() - lastUpdate < RATE_LIMIT_MS) {
    return false;
  }
  
  rateLimitCache.set(key, Date.now());
  return true;
}
```

### Image Security

#### Content Type Verification
```typescript
// Verify actual file type, not just extension
import { fileTypeFromBuffer } from 'file-type';

const type = await fileTypeFromBuffer(buffer);
if (!type || !['image/jpeg', 'image/png'].includes(type.mime)) {
  throw new Error('Invalid image file');
}
```

#### Size Limits
```typescript
// Enforce strict size limits to prevent DoS
const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8MB

if (attachment.size > MAX_IMAGE_SIZE) {
  throw new Error('Image too large');
}
```

## Testing Guidelines

### Unit Test Structure
```typescript
describe('ProfileService', () => {
  describe('getProfile', () => {
    it('should create profile if not exists', async () => {
      const profile = await profileService.getProfile('user1', 'guild1');
      expect(profile.relationshipStatus).toBe('single');
    });
    
    it('should return existing profile', async () => {
      await profileService.getProfile('user1', 'guild1');
      const profile = await profileService.getProfile('user1', 'guild1');
      expect(profile).toBeDefined();
    });
  });
});
```

### Mock Patterns
```typescript
// Mock Prisma client
vi.mock('../database/prisma.js', () => ({
  default: {
    userProfile: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    }
  }
}));
```

### Integration Test Pattern
```typescript
// Test full command flow
describe('Status Command Integration', () => {
  it('should update and display status', async () => {
    // Set status
    await statusSetCommand.execute(mockInteraction);
    
    // View status
    const embed = await statusCommand.execute(mockInteraction);
    
    // Verify status is displayed
    expect(embed.description).toContain('married');
  });
});
```

---
phase: implementation
title: Implementation Guide
description: Technical implementation notes, patterns, and code guidelines
---

# Implementation Guide

## Development Setup
**How do we get started?**

### Prerequisites and Dependencies
- Node.js v18+ with TypeScript
- Discord.js v14
- Supabase client library
- node-cron (for scheduled jobs)
- Jest (for testing)
- Existing LHT-Bot codebase with marriage system

### Environment Setup Steps
1. **Clone and Install**
   ```bash
   git clone <repository>
   cd LHT-Bot
   npm install
   ```

2. **Install Additional Dependencies** (if needed)
   ```bash
   npm install node-cron
   npm install --save-dev @types/node-cron
   ```

3. **Database Setup**
   ```bash
   # Run migration to create love_streaks table
   npm run migrate:up
   ```

4. **Verify Emoji IDs**
   - Server ID: `1449180531777339563`
   - Required emojis: emoji_43~1, emoji_48, emoji_57
   - ✅ Confirmed to exist in server

5. **Environment Variables**
   ```env
   # Existing variables should already be set
   SUPABASE_URL=<your-supabase-url>
   SUPABASE_KEY=<your-supabase-key>
   DISCORD_TOKEN=<your-bot-token>
   GUILD_ID=<your-test-guild-id>
   ```

### Configuration Needed
- **Timezone**: All times use UTC+7 (Vietnam timezone)
- **Cron Schedule**: 
  - Daily at 00:00 UTC+7 (17:00 UTC previous day)
  - Monthly on 1st at 00:00 UTC+7 (17:00 UTC on last day of previous month)
- **Recovery Limit**: 3 per month (configurable constant)
- **Server ID**: `1449180531777339563` (for emoji lookup)

## Code Structure
**How is the code organized?**

### Directory Structure
```
src/
├── commands/
│   └── love.ts                    # New: /love command handler
├── services/
│   ├── loveStreakService.ts       # New: Core streak business logic
│   ├── streakResetService.ts      # New: Daily reset cron job
│   ├── recoveryResetService.ts    # New: Monthly recovery reset
│   ├── marriageService.ts         # Modified: Add streak to certificate
│   └── statusService.ts           # Modified: Add streak to status
├── utils/
│   ├── emojis.ts                  # Existing: Emoji utilities (no changes)
│   └── translations.ts            # Modified: Add love streak translations
├── database/
│   ├── migrations/
│   │   └── YYYYMMDD_create_love_streaks.sql  # New: Database migration
│   └── supabase.ts                # Existing: Database client
└── index.ts                       # Modified: Register command and cron jobs
```

### Module Organization
- **Commands**: User-facing slash commands
- **Services**: Business logic and data operations
- **Utils**: Shared utilities (emojis, translations)
- **Database**: Schema and migrations

### Naming Conventions
- **Files**: camelCase (e.g., `loveStreakService.ts`)
- **Classes**: PascalCase (e.g., `LoveStreakService`)
- **Methods**: camelCase (e.g., `processLoveStreak`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RECOVERIES_PER_MONTH`)
- **Interfaces**: PascalCase with descriptive names (e.g., `LoveStreakResult`)

## Implementation Notes
**Key technical details to remember:**

### Core Features

#### Feature 1: Daily Streak Completion
**Implementation Approach**:
```typescript
// Pseudo-code for processLoveStreak()
async processLoveStreak(userId: string, guildId: string) {
  // 1. Get marriage for user
  const marriage = await marriageService.getMarriage(userId, guildId);
  if (!marriage) throw new Error('Not married');
  
  // 2. Get or create streak record
  let streak = await this.getStreak(marriage.id);
  if (!streak) {
    streak = await this.createStreak(marriage.id);
  }
  
  // 3. Check if already completed today
  const isUser1 = marriage.user1_id === userId;
  if (isUser1 && streak.user1_completed_today) {
    return { status: 'already_completed', streak, marriage };
  }
  if (!isUser1 && streak.user2_completed_today) {
    return { status: 'already_completed', streak, marriage };
  }
  
  // 4. Check for missed day (recovery logic)
  const today = new Date();
  const lastCompleted = streak.last_completed_date;
  if (lastCompleted) {
    const daysSinceLastComplete = daysBetween(lastCompleted, today);
    if (daysSinceLastComplete > 1) {
      // Missed day(s) - apply recovery or reset
      return await this.handleMissedDay(streak, marriage, userId);
    }
  }
  
  // 5. Mark user as completed
  const updates = isUser1 
    ? { user1_completed_today: true }
    : { user2_completed_today: true };
  
  // 6. Check if partner also completed
  const partnerCompleted = isUser1 
    ? streak.user2_completed_today 
    : streak.user1_completed_today;
  
  if (partnerCompleted) {
    // Both completed - increment streak
    updates.current_streak = streak.current_streak + 1;
    updates.best_streak = Math.max(streak.best_streak, updates.current_streak);
    updates.total_days = streak.total_days + 1;
    updates.last_completed_date = today;
    
    await this.updateStreak(streak.id, updates);
    return { status: 'both_completed', streak: { ...streak, ...updates }, marriage };
  } else {
    // First to complete - wait for partner
    await this.updateStreak(streak.id, updates);
    return { status: 'first_completed', streak: { ...streak, ...updates }, marriage };
  }
}
```

**Key Points**:
- Use database transactions for atomic updates
- Handle both user1 and user2 perspectives
- Check for missed days before marking complete
- Only increment streak when both complete

#### Feature 2: Recovery System
**Implementation Approach**:
```typescript
async handleMissedDay(streak: LoveStreak, marriage: Marriage, userId: string) {
  const recoveriesUsed = streak.recoveries_used_this_month;
  
  if (recoveriesUsed < MAX_RECOVERIES_PER_MONTH) {
    // Recovery available
    const updates = {
      recoveries_used_this_month: recoveriesUsed + 1,
      // Mark user as completed but don't increment streak yet
      [isUser1 ? 'user1_completed_today' : 'user2_completed_today']: true,
    };
    
    await this.updateStreak(streak.id, updates);
    
    const recoveriesRemaining = MAX_RECOVERIES_PER_MONTH - updates.recoveries_used_this_month;
    return {
      status: 'streak_recovered',
      streak: { ...streak, ...updates },
      marriage,
      recoveriesRemaining,
    };
  } else {
    // No recoveries left - reset streak
    const updates = {
      current_streak: 0,
      [isUser1 ? 'user1_completed_today' : 'user2_completed_today']: true,
      last_completed_date: null,
    };
    
    await this.updateStreak(streak.id, updates);
    
    return {
      status: 'streak_lost',
      streak: { ...streak, ...updates },
      marriage,
    };
  }
}
```

**Key Points**:
- Check recovery count before applying
- Maintain streak on recovery
- Reset streak to 0 when recoveries exhausted
- Allow user to start new streak immediately after loss

#### Feature 3: Streak Box Display
**Implementation Approach**:
```typescript
async formatStreakBoxEmbed(
  streak: LoveStreak,
  marriage: Marriage,
  client: Client
) {
  const guildId = marriage.guild_id;
  
  // Get emojis
  const pendingEmoji = formatEmojiFromGuildByName(client, guildId, 'emoji_43~1');
  const completedEmoji = formatEmojiFromGuildByName(client, guildId, 'emoji_48');
  
  // Get user display names
  const user1 = await client.users.fetch(marriage.user1_id);
  const user2 = await client.users.fetch(marriage.user2_id);
  
  // Format status
  const user1Status = streak.user1_completed_today ? completedEmoji : pendingEmoji;
  const user2Status = streak.user2_completed_today ? completedEmoji : pendingEmoji;
  
  const embed = new EmbedBuilder()
    .setTitle('💕 Streak Box')
    .setDescription(
      `${user1.displayName}: ${user1Status}\n` +
      `${user2.displayName}: ${user2Status}`
    )
    .setFooter({ text: `Streak hiện tại: ${streak.current_streak} ngày` })
    .setColor(streak.user1_completed_today && streak.user2_completed_today ? 0x00FF00 : 0xFFFF00);
  
  return embed;
}
```

**Key Points**:
- Use existing emoji utilities
- Fetch user objects for display names
- Color code: green when both complete, yellow when waiting
- Show current streak in footer

### Patterns & Best Practices

#### Pattern 1: Service Layer Separation
- Keep command handlers thin (validation, formatting only)
- Put all business logic in services
- Services should be testable without Discord interaction

#### Pattern 2: Database Transactions
```typescript
// Use Supabase transactions for atomic updates
const { data, error } = await supabase.rpc('update_streak_atomic', {
  streak_id: streakId,
  updates: updates,
});
```

#### Pattern 3: Error Handling
```typescript
try {
  const result = await loveStreakService.processLoveStreak(userId, guildId);
  // Handle result
} catch (error) {
  console.error('Error in love command:', error);
  await interaction.reply({
    content: translationService.t('errors.commandExecutionError'),
    ephemeral: true,
  });
}
```

#### Pattern 4: Translation Keys
```typescript
// Always use translation service for user-facing messages
const message = translationService.t('love.bothCompleted', {
  streak: result.streak.current_streak,
});
```

#### Pattern 5: Emoji Fallback
```typescript
// Always provide fallback for missing emojis
const emoji = formatEmojiFromGuildByName(client, guildId, 'emoji_48') || '✅';
```

### Common Utilities/Helpers

#### Utility 1: Date Comparison (UTC+7 Timezone)
```typescript
// All date operations use UTC+7 (Vietnam timezone)
const UTC_OFFSET = 7; // UTC+7

function getCurrentDateUTC7(): Date {
  const now = new Date();
  // Convert to UTC+7
  const utc7Time = new Date(now.getTime() + (UTC_OFFSET * 60 * 60 * 1000));
  return utc7Time;
}

function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
  const diffMs = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffMs / oneDay);
}

function isToday(date: Date): boolean {
  const today = getCurrentDateUTC7();
  return date.toDateString() === today.toDateString();
}

function isYesterday(date: Date): boolean {
  const yesterday = getCurrentDateUTC7();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
}
```

#### Utility 2: User Identification
```typescript
function isUser1(userId: string, marriage: Marriage): boolean {
  return marriage.user1_id === userId;
}

function getPartnerCompletionStatus(userId: string, streak: LoveStreak, marriage: Marriage): boolean {
  return isUser1(userId, marriage) 
    ? streak.user2_completed_today 
    : streak.user1_completed_today;
}
```

## Integration Points
**How do pieces connect?**

### API Integration Details
No external APIs required. All integration is internal.

### Database Connections
```typescript
// Use existing Supabase client from src/database/supabase.ts
import { supabase } from '../database/supabase.js';

// Query example
const { data, error } = await supabase
  .from('love_streaks')
  .select('*')
  .eq('marriage_id', marriageId)
  .single();
```

### Third-Party Service Setup
None required.

### Internal Service Integration

**Integration 1: Marriage Service**
```typescript
// In marriageService.ts - formatCertificateEmbed()
import { loveStreakService } from './loveStreakService.js';

async formatCertificateEmbed(marriage, certificate, user1Name, user2Name) {
  // ... existing code ...
  
  // Add streak to footer
  const streak = await loveStreakService.getStreak(marriage.id);
  const streakText = streak 
    ? `💕 Streak: ${streak.current_streak} ngày`
    : `💕 Chưa có streak`;
  
  embed.setFooter({ text: streakText });
  
  return { embed, attachment };
}
```

**Integration 2: Status Service**
```typescript
// In statusService.ts - formatStatusEmbed()
import { loveStreakService } from './loveStreakService.js';

async formatStatusEmbed(userId, guildId, client) {
  // ... existing code ...
  
  // Add streak field if married
  if (marriage) {
    const streak = await loveStreakService.getStreakByUserId(userId, guildId);
    if (streak) {
      embed.addFields({
        name: '💕 Love Streak',
        value: `${streak.current_streak} ngày (${streak.total_days} tổng)`,
        inline: true,
      });
    }
  }
  
  return embed;
}
```

## Error Handling
**How do we handle failures?**

### Error Handling Strategy
1. **Validation Errors**: Return user-friendly messages (ephemeral)
2. **Database Errors**: Log and return generic error message
3. **Discord API Errors**: Retry once, then log and fail gracefully
4. **Cron Job Errors**: Log, alert, and continue (don't crash)

### Logging Approach
```typescript
// Use console.error for errors (consider winston or pino for production)
console.error('[LoveStreakService] Error processing streak:', {
  userId,
  guildId,
  error: error.message,
  stack: error.stack,
});
```

### Retry/Fallback Mechanisms
- **Database Transactions**: Automatic retry on conflict (Supabase handles this)
- **Discord API**: Retry once with exponential backoff
- **Cron Jobs**: Log failure but continue (don't block other operations)

## Performance Considerations
**How do we keep it fast?**

### Optimization Strategies
1. **Database Indexes**: On `marriage_id` and `last_completed_date`
2. **Batch Operations**: Update multiple streaks in cron jobs efficiently
3. **Caching**: Consider caching streak data (if needed in future)
4. **Lazy Loading**: Only fetch streak when needed (not on every command)

### Caching Approach
Not required for v1. Consider for future if performance issues arise.

### Query Optimization
```sql
-- Use indexes for fast lookups
CREATE INDEX idx_love_streaks_marriage_id ON love_streaks(marriage_id);
CREATE INDEX idx_love_streaks_last_completed ON love_streaks(last_completed_date);

-- Use efficient queries
SELECT * FROM love_streaks WHERE marriage_id = $1; -- Fast with index
```

### Resource Management
- **Database Connections**: Use connection pooling (Supabase handles this)
- **Memory**: Clean up large objects after use
- **Cron Jobs**: Batch process, don't load all records at once

## Security Notes
**What security measures are in place?**

### Authentication/Authorization
- **Command Access**: Only married users can use `/love`
- **Data Access**: Users can only update their own streak
- **Admin Commands**: None required for this feature

### Input Validation
- **User ID**: Validate format and existence
- **Guild ID**: Validate format and bot membership
- **Date Values**: Validate and sanitize before database operations

### Data Encryption
- **At Rest**: Supabase handles encryption
- **In Transit**: HTTPS for all API calls
- **Sensitive Data**: No PII beyond Discord user IDs

### Secrets Management
- **Environment Variables**: Store in `.env` file (not committed)
- **API Keys**: Use Supabase environment variables
- **Discord Token**: Use environment variable

### SQL Injection Prevention
```typescript
// Always use parameterized queries
const { data } = await supabase
  .from('love_streaks')
  .select('*')
  .eq('marriage_id', marriageId); // Supabase handles parameterization

// NEVER do this:
// const query = `SELECT * FROM love_streaks WHERE marriage_id = '${marriageId}'`;
```

## Implementation Checklist
**Before considering implementation complete:**

- [ ] All database migrations run successfully
- [ ] All service methods implemented and documented
- [ ] All command handlers implemented
- [ ] All translations added
- [ ] All integrations complete (giaykh, status)
- [ ] All cron jobs configured and tested
- [ ] All unit tests written and passing (100% coverage)
- [ ] All integration tests written and passing
- [ ] All edge cases tested
- [ ] Manual testing complete in test server
- [ ] Error handling comprehensive
- [ ] Logging in place
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Ready for deployment

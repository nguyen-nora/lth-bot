# Love Streak Feature - Configuration Reference

## ✅ Confirmed Configuration

### Discord Server
- **Server ID**: `1449180531777339563`
- **Required Emojis**:
  - `emoji_43~1` - Pending/Not completed (⏳)
  - `emoji_48` - Completed (✅)
  - `emoji_57` - Failed streak (💔)

### Timezone Settings
- **Timezone**: UTC+7 (Vietnam/Bangkok timezone)
- **Daily Reset**: 12:00 AM UTC+7 (midnight Vietnam time)
- **Cron Expression**: `0 17 * * *` (17:00 UTC = 00:00 UTC+7 next day)
- **Monthly Reset**: 1st of month at 12:00 AM UTC+7
- **Cron Expression**: `0 17 1 * *` (17:00 UTC on last day of prev month)

### Recovery System
- **Max Recoveries**: 3 per month
- **Recovery Reset**: 1st of each month at 12:00 AM UTC+7
- **Behavior**: 
  - Recoveries 1-3: Streak maintained, recovery count incremented
  - After 3 recoveries: Streak resets to 0 on next missed day

### Streak Mechanics
- **Increment**: Only when BOTH partners complete daily
- **Reset Time**: 12:00 AM UTC+7 daily
- **Completion Window**: From previous reset to next reset (24 hours)
- **First Use**: Can start immediately after marriage

## Implementation Constants

```typescript
// src/config/loveStreak.ts (to be created)
export const LOVE_STREAK_CONFIG = {
  // Timezone
  UTC_OFFSET: 7, // UTC+7 for Vietnam
  
  // Discord Server
  GUILD_ID: '1449180531777339563',
  
  // Emojis
  EMOJI_PENDING: 'emoji_43~1',
  EMOJI_COMPLETED: 'emoji_48',
  EMOJI_FAILED: 'emoji_57',
  
  // Recovery
  MAX_RECOVERIES_PER_MONTH: 3,
  
  // Cron Schedules (in UTC)
  DAILY_RESET_CRON: '0 17 * * *',      // 17:00 UTC = 00:00 UTC+7
  MONTHLY_RESET_CRON: '0 17 1 * *',    // 17:00 UTC on 1st = 00:00 UTC+7 on 1st
  
  // Messages (use translation service)
  TRANSLATION_PREFIX: 'love',
} as const;
```

## Cron Schedule Explanation

### Daily Reset: `0 17 * * *`
- Runs at: **17:00 UTC** (5:00 PM UTC)
- Which is: **00:00 UTC+7** (midnight Vietnam time)
- Frequency: Every day
- Purpose: Reset daily completion flags, apply recovery/loss logic

### Monthly Reset: `0 17 1 * *`
- Runs at: **17:00 UTC on the 1st of each month**
- Which is: **00:00 UTC+7 on the 1st** (midnight Vietnam time on 1st)
- Frequency: First day of each month
- Purpose: Reset recovery counter to 0

## Timezone Conversion Reference

| Vietnam Time (UTC+7) | UTC Time | Description |
|---------------------|----------|-------------|
| 00:00 (midnight)    | 17:00 (previous day) | Daily reset |
| 06:00 (morning)     | 23:00 (previous day) | - |
| 12:00 (noon)        | 05:00 (same day) | - |
| 18:00 (evening)     | 11:00 (same day) | - |
| 23:59 (end of day)  | 16:59 (same day) | Last chance to complete |

## Database Configuration

### Table: `love_streaks`
- **Primary Key**: `id` (UUID)
- **Foreign Key**: `marriage_id` → `marriages(id)` ON DELETE CASCADE
- **Indexes**:
  - `idx_love_streaks_marriage_id` on `marriage_id`
  - `idx_love_streaks_last_completed` on `last_completed_date`
- **Constraints**:
  - `unique_marriage_streak` on `marriage_id`
  - `valid_streak_values`: streak counts >= 0
  - `valid_recoveries`: 0 <= recoveries <= 3

## Testing Configuration

### Test Server
- Use same server ID: `1449180531777339563`
- Verify emojis exist before testing
- Test with real married users

### Test Timezone Scenarios
- Test at 23:59 UTC+7 (completion before reset)
- Test at 00:01 UTC+7 (completion after reset)
- Test at 16:59 UTC (last minute before reset in UTC)
- Test at 17:01 UTC (just after reset in UTC)

### Mock Data
```typescript
// For unit tests - use fixed dates in UTC+7
const mockDate = new Date('2024-01-15T00:00:00+07:00'); // Midnight UTC+7
const mockYesterday = new Date('2024-01-14T00:00:00+07:00');
```

## Deployment Checklist

- [ ] Verify server ID `1449180531777339563` is correct
- [ ] Confirm emojis exist: emoji_43~1, emoji_48, emoji_57
- [ ] Set timezone to UTC+7 in all date operations
- [ ] Configure cron jobs: `0 17 * * *` and `0 17 1 * *`
- [ ] Test cron jobs trigger at correct Vietnam time
- [ ] Verify database migrations applied
- [ ] Test with real users in production server
- [ ] Monitor first daily reset at midnight UTC+7
- [ ] Monitor first monthly reset on 1st at midnight UTC+7

## Monitoring & Alerts

### Key Metrics
- Daily active streak users
- Average streak length
- Recovery usage rate (should be < 33% of users per month)
- Streak loss rate
- Cron job success rate (should be 100%)

### Alert Conditions
- Cron job fails to execute
- Cron job takes > 5 minutes
- Database errors during reset
- More than 5% of users losing streaks in one day (investigate)

## Future Enhancements (Out of Scope for v1)

- User-specific timezone support
- Reminder notifications (e.g., 6 PM if not completed)
- Milestone celebrations (7, 30, 100 days)
- Streak leaderboards
- Rewards/currency for maintaining streaks
- Streak history and analytics

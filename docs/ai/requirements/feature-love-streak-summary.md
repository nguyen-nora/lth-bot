# Love Streak Feature - Documentation Summary

## Feature Overview
A daily engagement system for married couples in the Discord bot, inspired by TikTok-style streaks. Couples maintain their streak by both partners using `/love` daily before 12 AM UTC reset.

## Key Features
1. **Daily Streak System**: Both partners must complete `/love` daily to maintain streak
2. **Visual Streak Box**: Shows completion status with emojis for each partner
3. **Recovery System**: 3 recoveries per month for missed days
4. **Automatic Resets**: Daily at 12 AM UTC, monthly recovery reset on 1st
5. **Integration**: Streak count displayed in `/giaykh` certificate and `/status`

## Documentation Files Created
- ✅ `docs/ai/requirements/feature-love-streak.md` - Complete requirements (ALL QUESTIONS RESOLVED)
- ✅ `docs/ai/design/feature-love-streak.md` - System architecture and technical design
- ✅ `docs/ai/planning/feature-love-streak.md` - Task breakdown and project plan
- ✅ `docs/ai/implementation/feature-love-streak.md` - Implementation guide and patterns
- ✅ `docs/ai/testing/feature-love-streak.md` - Comprehensive testing strategy
- ✅ `docs/ai/LOVE_STREAK_CONFIG.md` - Configuration reference
- ✅ `docs/ai/LOVE_STREAK_QUICKSTART.md` - Quick start guide

## Quick Reference

### Emojis Required
- `emoji_43~1` - Pending/not completed (⏳)
- `emoji_48` - Completed (✅)
- `emoji_57` - Failed streak (💔)

### Database
- New table: `love_streaks`
- Foreign key to `marriages` table
- Tracks: current_streak, best_streak, total_days, daily completion, recoveries

### New Files to Create
- `src/commands/love.ts` - Command handler
- `src/services/loveStreakService.ts` - Core business logic
- `src/services/streakResetService.ts` - Daily reset cron
- `src/services/recoveryResetService.ts` - Monthly recovery reset

### Modified Files
- `src/services/marriageService.ts` - Add streak to certificate
- `src/services/statusService.ts` - Add streak to status
- `src/utils/translations.ts` - Add love streak translations
- `src/index.ts` - Register command and cron jobs

## Estimated Timeline
- **Total Effort**: 59 hours (+ 6 hours buffer = 65 hours)
- **Timeline**: ~18 working days (3.5 weeks at 4 hours/day)
- **Milestones**: 5 major checkpoints

## Next Steps
1. ✅ **COMPLETE**: Requirements validated and all questions resolved
2. **NEXT**: Run `/review-design` to validate design doc
3. **THEN**: Run `/execute-plan` when ready to implement
4. **FOLLOW**: Task breakdown in planning doc

## Key Decisions
- **Timezone**: UTC+7 (Vietnam timezone) for all resets
- **Server ID**: `1449180531777339563` (confirmed emoji availability)
- **Recovery Limit**: 3 per month (resets on 1st at midnight UTC+7)
- **Streak Increment**: Only when both partners complete
- **Database**: Separate `love_streaks` table for clean separation
- **Cron Jobs**: node-cron for scheduled resets (17:00 UTC = 00:00 UTC+7)

## Success Criteria
- Both partners must complete daily to maintain streak
- Recovery system allows 3 missed days per month
- Visual feedback (Streak Box) shows clear status
- Integration with existing marriage features
- 100% test coverage for new code

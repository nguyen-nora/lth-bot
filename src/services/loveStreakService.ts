import prisma from '../database/prisma.js';
import { marriageService, Marriage } from './marriageService.js';
import { translationService } from './translationService.js';
import { formatEmojiFromGuildByName } from '../utils/emojis.js';
import { Client, EmbedBuilder } from 'discord.js';

// ==========================================
// Constants
// ==========================================

/**
 * UTC offset for Vietnam timezone (UTC+7)
 * All streak operations use this timezone
 */
const UTC_OFFSET_HOURS = 7;

/**
 * Maximum recovery attempts per month
 */
const MAX_RECOVERIES_PER_MONTH = 3;

/**
 * Guild ID for emoji lookup
 */
const GUILD_ID = '1449180531777339563';

/**
 * Emoji names for streak status
 */
const EMOJI_PENDING = 'emoji_43~1';
const EMOJI_COMPLETED = 'emoji_48';
/** Emoji for failed streak - exported for use in command handler */
export const EMOJI_FAILED = 'emoji_57';

// ==========================================
// Interfaces
// ==========================================

/**
 * Love streak data from database
 */
export interface LoveStreak {
  id: number;
  marriageId: number;
  currentStreak: number;
  bestStreak: number;
  totalDays: number;
  user1CompletedToday: boolean;
  user2CompletedToday: boolean;
  lastCompletedDate: string | null;
  recoveriesUsedThisMonth: number;
  lastRecoveryResetDate: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Result status for streak processing
 */
export type LoveStreakStatus =
  | 'first_completed'      // First partner completed, waiting for second
  | 'both_completed'       // Both partners completed, streak incremented
  | 'already_completed'    // User already completed today
  | 'streak_recovered'     // Missed day, but streak recovered (used recovery)
  | 'streak_lost';         // Missed day, no recoveries left, streak reset

/**
 * Result of processing a love streak completion
 */
export interface LoveStreakResult {
  /** Status of the operation */
  status: LoveStreakStatus;
  /** Updated streak data */
  streak: LoveStreak;
  /** Marriage data */
  marriage: Marriage;
  /** Human-readable message */
  message: string;
  /** Remaining recoveries this month (only for streak_recovered status) */
  recoveriesRemaining?: number;
  /** True if this is the last recovery (3rd use) - triggers warning */
  isLastRecovery?: boolean;
}

// ==========================================
// Service Class
// ==========================================

/**
 * Love Streak Service
 * 
 * Manages daily engagement streaks for married couples.
 * Features:
 * - Daily completion tracking for both partners
 * - Streak increments when both complete
 * - Recovery system (3 per month) for missed days
 * - Automatic resets at 12 AM UTC+7
 * 
 * @example
 * ```typescript
 * // Process a user's daily completion
 * const result = await loveStreakService.processLoveStreak(userId, guildId);
 * 
 * // Get streak for display
 * const streak = await loveStreakService.getStreakByUserId(userId, guildId);
 * ```
 */
class LoveStreakService {
  private _client: Client | null = null;

  /**
   * Set the Discord client (required for emoji lookup and user fetching)
   * @param client Discord client instance
   */
  public setClient(client: Client): void {
    this._client = client;
  }

  /**
   * Get the Discord client
   * @returns Discord client or null
   */
  public getClient(): Client | null {
    return this._client;
  }

  // ==========================================
  // Date Utilities (UTC+7)
  // ==========================================

  /**
   * Get current date in UTC+7 timezone
   * @returns Date string in YYYY-MM-DD format (UTC+7)
   */
  private getCurrentDateUTC7(): string {
    const now = new Date();
    const utc7Time = new Date(now.getTime() + UTC_OFFSET_HOURS * 60 * 60 * 1000);
    return utc7Time.toISOString().split('T')[0];
  }

  /**
   * Get yesterday's date in UTC+7 timezone
   * @returns Date string in YYYY-MM-DD format (UTC+7)
   */
  private getYesterdayDateUTC7(): string {
    const now = new Date();
    const utc7Time = new Date(now.getTime() + UTC_OFFSET_HOURS * 60 * 60 * 1000);
    utc7Time.setDate(utc7Time.getDate() - 1);
    return utc7Time.toISOString().split('T')[0];
  }

  /**
   * Get current month in UTC+7 timezone
   * @returns Month string in YYYY-MM format (UTC+7)
   */
  private getCurrentMonthUTC7(): string {
    const now = new Date();
    const utc7Time = new Date(now.getTime() + UTC_OFFSET_HOURS * 60 * 60 * 1000);
    return utc7Time.toISOString().slice(0, 7);
  }

  // ==========================================
  // Database Operations
  // ==========================================

  /**
   * Get streak by marriage ID
   * @param marriageId Marriage ID
   * @returns Love streak or null if not found
   */
  public async getStreak(marriageId: number): Promise<LoveStreak | null> {
    try {
      const streak = await prisma.loveStreak.findUnique({
        where: { marriageId },
      });
      return streak ? this.mapStreakToInterface(streak) : null;
    } catch (error) {
      console.error('[LoveStreakService] Error getting streak:', error);
      return null;
    }
  }

  /**
   * Get streak by user ID (looks up marriage first)
   * @param userId Discord user ID
   * @param guildId Discord guild ID
   * @returns Love streak or null if not found/not married
   */
  public async getStreakByUserId(
    userId: string,
    guildId: string
  ): Promise<LoveStreak | null> {
    try {
      const marriage = await marriageService.getMarriage(userId, guildId);
      if (!marriage) {
        return null;
      }
      return await this.getStreak(marriage.id);
    } catch (error) {
      console.error('[LoveStreakService] Error getting streak by user:', error);
      return null;
    }
  }

  /**
   * Create a new streak for a marriage
   * @param marriageId Marriage ID
   * @returns Created love streak
   */
  public async createStreak(marriageId: number): Promise<LoveStreak> {
    const today = this.getCurrentDateUTC7();
    
    const streak = await prisma.loveStreak.create({
      data: {
        marriageId,
        currentStreak: 0,
        bestStreak: 0,
        totalDays: 0,
        user1CompletedToday: false,
        user2CompletedToday: false,
        lastCompletedDate: null,
        recoveriesUsedThisMonth: 0,
        lastRecoveryResetDate: today,
      },
    });

    return this.mapStreakToInterface(streak);
  }

  /**
   * Update streak data
   * @param streakId Streak ID
   * @param updates Partial streak data to update
   * @returns Updated love streak
   */
  public async updateStreak(
    streakId: number,
    updates: Partial<{
      currentStreak: number;
      bestStreak: number;
      totalDays: number;
      user1CompletedToday: boolean;
      user2CompletedToday: boolean;
      lastCompletedDate: string | null;
      recoveriesUsedThisMonth: number;
      lastRecoveryResetDate: string;
    }>
  ): Promise<LoveStreak> {
    const streak = await prisma.loveStreak.update({
      where: { id: streakId },
      data: updates,
    });

    return this.mapStreakToInterface(streak);
  }

  // ==========================================
  // Core Business Logic
  // ==========================================

  /**
   * Process a user's daily love streak completion
   * 
   * This is the main method called when a user uses the /love command.
   * It handles all scenarios:
   * - First partner completing
   * - Second partner completing (increments streak)
   * - User already completed today
   * - Missed day with recovery available
   * - Missed day with no recovery (streak lost)
   * 
   * @param userId Discord user ID
   * @param guildId Discord guild ID
   * @returns Result with status, updated streak, and message
   * @throws Error if user is not married
   */
  public async processLoveStreak(
    userId: string,
    guildId: string
  ): Promise<LoveStreakResult> {
    // 1. Get marriage
    const marriage = await marriageService.getMarriage(userId, guildId);
    if (!marriage) {
      throw new Error(translationService.t('errors.notMarried'));
    }

    // 2. Get or create streak
    let streak = await this.getStreak(marriage.id);
    if (!streak) {
      streak = await this.createStreak(marriage.id);
    }

    // 3. Check if monthly recovery reset is needed
    streak = await this.checkAndResetMonthlyRecoveries(streak);

    // 4. Determine if user is user1 or user2
    const isUser1 = marriage.user1_id === userId;
    const userCompletedField = isUser1 ? 'user1CompletedToday' : 'user2CompletedToday';
    const partnerCompletedField = isUser1 ? 'user2CompletedToday' : 'user1CompletedToday';

    // 5. Check if user already completed today
    if (streak[userCompletedField]) {
      return {
        status: 'already_completed',
        streak,
        marriage,
        message: translationService.t('love.alreadyCompleted'),
      };
    }

    // 6. Check for missed day (recovery logic)
    const today = this.getCurrentDateUTC7();
    const yesterday = this.getYesterdayDateUTC7();

    if (streak.lastCompletedDate && streak.lastCompletedDate !== yesterday && streak.lastCompletedDate !== today) {
      // Missed day(s) - apply recovery or reset
      return await this.handleMissedDay(streak, marriage, userId, isUser1);
    }

    // 7. Mark user as completed
    const updates: Record<string, boolean | string | number> = {
      [userCompletedField]: true,
    };

    // 8. Check if partner already completed
    const partnerCompleted = streak[partnerCompletedField];

    if (partnerCompleted) {
      // Both completed - increment streak!
      const newStreak = streak.currentStreak + 1;
      const newBestStreak = Math.max(streak.bestStreak, newStreak);
      const newTotalDays = streak.totalDays + 1;

      updates.currentStreak = newStreak;
      updates.bestStreak = newBestStreak;
      updates.totalDays = newTotalDays;
      updates.lastCompletedDate = today;

      const updatedStreak = await this.updateStreak(streak.id, updates);

      return {
        status: 'both_completed',
        streak: updatedStreak,
        marriage,
        message: translationService.t('love.bothCompleted', {
          streak: newStreak,
        }),
      };
    } else {
      // First to complete - wait for partner
      const updatedStreak = await this.updateStreak(streak.id, updates);

      return {
        status: 'first_completed',
        streak: updatedStreak,
        marriage,
        message: translationService.t('love.firstCompleted'),
      };
    }
  }

  /**
   * Handle missed day scenario (recovery or loss)
   * @param streak Current streak data
   * @param marriage Marriage data
   * @param userId User ID
   * @param isUser1 Whether user is user1 in marriage
   * @returns Result with recovery or loss status
   */
  private async handleMissedDay(
    streak: LoveStreak,
    marriage: Marriage,
    _userId: string, // Prefixed with _ to indicate intentionally unused
    isUser1: boolean
  ): Promise<LoveStreakResult> {
    // Note: userId could be used for logging or notifications in future
    const userCompletedField = isUser1 ? 'user1CompletedToday' : 'user2CompletedToday';

    if (streak.recoveriesUsedThisMonth < MAX_RECOVERIES_PER_MONTH) {
      // Recovery available
      const newRecoveries = streak.recoveriesUsedThisMonth + 1;
      const recoveriesRemaining = MAX_RECOVERIES_PER_MONTH - newRecoveries;
      const isLastRecovery = recoveriesRemaining === 0;

      const updates = {
        recoveriesUsedThisMonth: newRecoveries,
        [userCompletedField]: true,
        // Reset both completion flags since we're starting fresh for this day
        user1CompletedToday: isUser1,
        user2CompletedToday: !isUser1,
        lastCompletedDate: null, // Will be set when both complete
      };

      const updatedStreak = await this.updateStreak(streak.id, updates);

      return {
        status: 'streak_recovered',
        streak: updatedStreak,
        marriage,
        message: translationService.t('love.streakRecovered', {
          remaining: recoveriesRemaining,
        }),
        recoveriesRemaining,
        isLastRecovery,
      };
    } else {
      // No recoveries left - streak lost
      const updates = {
        currentStreak: 0,
        [userCompletedField]: true,
        user1CompletedToday: isUser1,
        user2CompletedToday: !isUser1,
        lastCompletedDate: null,
      };

      const updatedStreak = await this.updateStreak(streak.id, updates);

      return {
        status: 'streak_lost',
        streak: updatedStreak,
        marriage,
        message: translationService.t('love.streakLost'),
      };
    }
  }

  /**
   * Check if monthly recovery reset is needed and apply it
   * @param streak Current streak
   * @returns Updated streak (or same if no reset needed)
   */
  private async checkAndResetMonthlyRecoveries(
    streak: LoveStreak
  ): Promise<LoveStreak> {
    const currentMonth = this.getCurrentMonthUTC7();
    const lastResetMonth = streak.lastRecoveryResetDate.slice(0, 7);

    if (currentMonth !== lastResetMonth) {
      // New month - reset recoveries
      const today = this.getCurrentDateUTC7();
      return await this.updateStreak(streak.id, {
        recoveriesUsedThisMonth: 0,
        lastRecoveryResetDate: today,
      });
    }

    return streak;
  }

  // ==========================================
  // Embed Formatting
  // ==========================================

  /**
   * Format streak box embed showing both partners' completion status
   * 
   * @param streak Streak data
   * @param marriage Marriage data
   * @param client Discord client for emoji and user lookup
   * @returns Formatted embed builder
   */
  public async formatStreakBoxEmbed(
    streak: LoveStreak,
    marriage: Marriage,
    client: Client
  ): Promise<EmbedBuilder> {
    // Get emojis
    const pendingEmoji = formatEmojiFromGuildByName(client, GUILD_ID, EMOJI_PENDING) || '⏳';
    const completedEmoji = formatEmojiFromGuildByName(client, GUILD_ID, EMOJI_COMPLETED) || '✅';

    // Get user display names
    let user1Name = 'User 1';
    let user2Name = 'User 2';

    try {
      const user1 = await client.users.fetch(marriage.user1_id);
      const user2 = await client.users.fetch(marriage.user2_id);
      user1Name = user1.displayName || user1.username;
      user2Name = user2.displayName || user2.username;
    } catch (error) {
      console.error('[LoveStreakService] Error fetching users:', error);
    }

    // Format status
    const user1Status = streak.user1CompletedToday ? completedEmoji : pendingEmoji;
    const user2Status = streak.user2CompletedToday ? completedEmoji : pendingEmoji;

    // Determine color
    const bothCompleted = streak.user1CompletedToday && streak.user2CompletedToday;
    const color = bothCompleted ? 0x00ff00 : 0xffff00; // Green if both, yellow if waiting

    const embed = new EmbedBuilder()
      .setTitle('💕 Streak Box')
      .setDescription(
        `${user1Name}: ${user1Status}\n` +
        `${user2Name}: ${user2Status}`
      )
      .setFooter({ text: `Streak hiện tại: ${streak.currentStreak} ngày` })
      .setColor(color);

    return embed;
  }

  // ==========================================
  // Cron Job Methods
  // ==========================================

  /**
   * Reset daily completion flags for all streaks
   * Called by daily cron job at 12 AM UTC+7
   * 
   * @returns Number of records processed
   */
  public async resetDailyCompletions(): Promise<number> {
    try {
      const result = await prisma.loveStreak.updateMany({
        data: {
          user1CompletedToday: false,
          user2CompletedToday: false,
        },
      });

      console.log(`[LoveStreakService] Daily reset: ${result.count} streaks reset`);
      return result.count;
    } catch (error) {
      console.error('[LoveStreakService] Error in daily reset:', error);
      throw error;
    }
  }

  /**
   * Reset monthly recovery counts for all streaks
   * Called by monthly cron job on 1st at 12 AM UTC+7
   * 
   * @returns Number of records processed
   */
  public async resetMonthlyRecoveries(): Promise<number> {
    try {
      const today = this.getCurrentDateUTC7();
      
      const result = await prisma.loveStreak.updateMany({
        data: {
          recoveriesUsedThisMonth: 0,
          lastRecoveryResetDate: today,
        },
      });

      console.log(`[LoveStreakService] Monthly reset: ${result.count} streaks reset`);
      return result.count;
    } catch (error) {
      console.error('[LoveStreakService] Error in monthly reset:', error);
      throw error;
    }
  }

  // ==========================================
  // Mapping
  // ==========================================

  /**
   * Map Prisma LoveStreak to interface
   */
  private mapStreakToInterface(streak: {
    id: number;
    marriageId: number;
    currentStreak: number;
    bestStreak: number;
    totalDays: number;
    user1CompletedToday: boolean;
    user2CompletedToday: boolean;
    lastCompletedDate: string | null;
    recoveriesUsedThisMonth: number;
    lastRecoveryResetDate: string;
    createdAt: Date;
    updatedAt: Date;
  }): LoveStreak {
    return {
      id: streak.id,
      marriageId: streak.marriageId,
      currentStreak: streak.currentStreak,
      bestStreak: streak.bestStreak,
      totalDays: streak.totalDays,
      user1CompletedToday: streak.user1CompletedToday,
      user2CompletedToday: streak.user2CompletedToday,
      lastCompletedDate: streak.lastCompletedDate,
      recoveriesUsedThisMonth: streak.recoveriesUsedThisMonth,
      lastRecoveryResetDate: streak.lastRecoveryResetDate,
      createdAt: streak.createdAt,
      updatedAt: streak.updatedAt,
    };
  }
}

// Export singleton instance
export const loveStreakService = new LoveStreakService();

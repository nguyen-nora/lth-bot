import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loveStreakService, LoveStreak, EMOJI_FAILED } from './loveStreakService.js';
import prisma from '../database/prisma.js';
import { marriageService } from './marriageService.js';
import { translationService } from './translationService.js';
import { Client, EmbedBuilder } from 'discord.js';

// ==========================================
// Mocks
// ==========================================

vi.mock('../database/prisma.js', () => ({
  default: {
    loveStreak: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

vi.mock('./marriageService.js', () => ({
  marriageService: {
    getMarriage: vi.fn(),
  },
}));

vi.mock('./translationService.js', () => ({
  translationService: {
    t: vi.fn((key: string, params?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        'errors.notMarried': 'You are not married',
        'love.alreadyCompleted': 'You already completed today',
        'love.firstCompleted': 'You completed first! Waiting for partner...',
        'love.bothCompleted': `Streak maintained! Your streak is ${params?.streak || 0} days`,
        'love.streakRecovered': `Streak recovered! ${params?.remaining || 0} recoveries remaining`,
        'love.streakRecoveredLastChance': 'Last chance! No more recoveries this month',
        'love.streakLost': 'Your streak was lost',
      };
      return translations[key] || key;
    }),
  },
}));

vi.mock('../utils/emojis.js', () => ({
  formatEmojiFromGuildByName: vi.fn(() => '✅'),
}));

// ==========================================
// Test Fixtures
// ==========================================

const mockMarriage = {
  id: 1,
  user1_id: 'user1-discord-id',
  user2_id: 'user2-discord-id',
  guild_id: 'guild-discord-id',
  marriedAt: new Date('2024-01-01'),
};

const createMockStreak = (overrides: Partial<LoveStreak> = {}): LoveStreak => ({
  id: 1,
  marriageId: 1,
  currentStreak: 0,
  bestStreak: 0,
  totalDays: 0,
  user1CompletedToday: false,
  user2CompletedToday: false,
  lastCompletedDate: null,
  recoveriesUsedThisMonth: 0,
  lastRecoveryResetDate: '2024-01-01',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const mockClient = {
  users: {
    fetch: vi.fn().mockResolvedValue({
      id: 'user1-discord-id',
      displayName: 'TestUser',
      username: 'testuser',
    }),
  },
} as unknown as Client;

// ==========================================
// Helper Functions
// ==========================================

/**
 * Get today's date in UTC+7 format (YYYY-MM-DD)
 */
function getTodayUTC7(): string {
  const now = new Date();
  const utc7Time = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return utc7Time.toISOString().split('T')[0];
}

/**
 * Get yesterday's date in UTC+7 format (YYYY-MM-DD)
 */
function getYesterdayUTC7(): string {
  const now = new Date();
  const utc7Time = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  utc7Time.setDate(utc7Time.getDate() - 1);
  return utc7Time.toISOString().split('T')[0];
}

/**
 * Get current month in UTC+7 format (YYYY-MM)
 */
function getCurrentMonthUTC7(): string {
  const now = new Date();
  const utc7Time = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return utc7Time.toISOString().slice(0, 7);
}

// ==========================================
// Tests
// ==========================================

describe('LoveStreakService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loveStreakService.setClient(mockClient);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================
  // Client Management
  // ==========================================

  describe('setClient / getClient', () => {
    it('should set and get the Discord client', () => {
      const newClient = {} as Client;
      loveStreakService.setClient(newClient);
      expect(loveStreakService.getClient()).toBe(newClient);
    });

    it('should return null if client not set', () => {
      // Create new instance to test initial state
      // Since we're using singleton, we need to test with existing
      loveStreakService.setClient(null as unknown as Client);
      expect(loveStreakService.getClient()).toBeNull();
      // Restore for other tests
      loveStreakService.setClient(mockClient);
    });
  });

  // Note: Date calculation is tested indirectly through processLoveStreak
  // The recovery logic tests cover date-related functionality;

  // ==========================================
  // Database Operations
  // ==========================================

  describe('getStreak', () => {
    it('should return streak when it exists', async () => {
      const mockStreak = createMockStreak({ currentStreak: 5 });
      vi.mocked(prisma.loveStreak.findUnique).mockResolvedValueOnce(mockStreak);

      const result = await loveStreakService.getStreak(1);

      expect(result).toEqual(mockStreak);
      expect(prisma.loveStreak.findUnique).toHaveBeenCalledWith({
        where: { marriageId: 1 },
      });
    });

    it('should return null when streak does not exist', async () => {
      vi.mocked(prisma.loveStreak.findUnique).mockResolvedValueOnce(null);

      const result = await loveStreakService.getStreak(999);

      expect(result).toBeNull();
    });

    it('should return null on database error', async () => {
      vi.mocked(prisma.loveStreak.findUnique).mockRejectedValueOnce(
        new Error('Database error')
      );

      const result = await loveStreakService.getStreak(1);

      expect(result).toBeNull();
    });
  });

  describe('getStreakByUserId', () => {
    it('should return streak for user1 in marriage', async () => {
      const mockStreak = createMockStreak({ currentStreak: 3 });
      vi.mocked(marriageService.getMarriage).mockResolvedValueOnce(mockMarriage);
      vi.mocked(prisma.loveStreak.findUnique).mockResolvedValueOnce(mockStreak);

      const result = await loveStreakService.getStreakByUserId(
        'user1-discord-id',
        'guild-discord-id'
      );

      expect(result).toEqual(mockStreak);
      expect(marriageService.getMarriage).toHaveBeenCalledWith(
        'user1-discord-id',
        'guild-discord-id'
      );
    });

    it('should return streak for user2 in marriage', async () => {
      const mockStreak = createMockStreak({ currentStreak: 7 });
      vi.mocked(marriageService.getMarriage).mockResolvedValueOnce(mockMarriage);
      vi.mocked(prisma.loveStreak.findUnique).mockResolvedValueOnce(mockStreak);

      const result = await loveStreakService.getStreakByUserId(
        'user2-discord-id',
        'guild-discord-id'
      );

      expect(result).toEqual(mockStreak);
    });

    it('should return null when user is not married', async () => {
      vi.mocked(marriageService.getMarriage).mockResolvedValueOnce(null);

      const result = await loveStreakService.getStreakByUserId(
        'unmarried-user',
        'guild-discord-id'
      );

      expect(result).toBeNull();
      expect(prisma.loveStreak.findUnique).not.toHaveBeenCalled();
    });

    it('should return null on error', async () => {
      vi.mocked(marriageService.getMarriage).mockRejectedValueOnce(
        new Error('Database error')
      );

      const result = await loveStreakService.getStreakByUserId(
        'user1-discord-id',
        'guild-discord-id'
      );

      expect(result).toBeNull();
    });
  });

  describe('createStreak', () => {
    it('should create new streak with default values', async () => {
      const today = getTodayUTC7();
      const expectedStreak = createMockStreak({
        marriageId: 1,
        lastRecoveryResetDate: today,
      });
      vi.mocked(prisma.loveStreak.create).mockResolvedValueOnce(expectedStreak);

      const result = await loveStreakService.createStreak(1);

      expect(result.marriageId).toBe(1);
      expect(result.currentStreak).toBe(0);
      expect(result.bestStreak).toBe(0);
      expect(result.totalDays).toBe(0);
      expect(result.user1CompletedToday).toBe(false);
      expect(result.user2CompletedToday).toBe(false);
      expect(result.recoveriesUsedThisMonth).toBe(0);
      expect(prisma.loveStreak.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          marriageId: 1,
          currentStreak: 0,
          bestStreak: 0,
          totalDays: 0,
        }),
      });
    });
  });

  describe('updateStreak', () => {
    it('should update streak fields correctly', async () => {
      const updatedStreak = createMockStreak({
        currentStreak: 10,
        bestStreak: 10,
      });
      vi.mocked(prisma.loveStreak.update).mockResolvedValueOnce(updatedStreak);

      const result = await loveStreakService.updateStreak(1, {
        currentStreak: 10,
        bestStreak: 10,
      });

      expect(result.currentStreak).toBe(10);
      expect(result.bestStreak).toBe(10);
      expect(prisma.loveStreak.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { currentStreak: 10, bestStreak: 10 },
      });
    });

    it('should update completion flags', async () => {
      const updatedStreak = createMockStreak({
        user1CompletedToday: true,
      });
      vi.mocked(prisma.loveStreak.update).mockResolvedValueOnce(updatedStreak);

      const result = await loveStreakService.updateStreak(1, {
        user1CompletedToday: true,
      });

      expect(result.user1CompletedToday).toBe(true);
    });
  });

  // ==========================================
  // Core Business Logic - processLoveStreak
  // ==========================================

  describe('processLoveStreak', () => {
    describe('Not married scenario', () => {
      it('should throw error when user is not married', async () => {
        vi.mocked(marriageService.getMarriage).mockResolvedValueOnce(null);

        await expect(
          loveStreakService.processLoveStreak('user1-discord-id', 'guild-discord-id')
        ).rejects.toThrow('You are not married');
      });
    });

    describe('First completion scenario', () => {
      it('should mark user1 as completed when they complete first', async () => {
        const yesterday = getYesterdayUTC7();
        const mockStreak = createMockStreak({
          lastCompletedDate: yesterday,
          lastRecoveryResetDate: getCurrentMonthUTC7() + '-01',
        });

        vi.mocked(marriageService.getMarriage).mockResolvedValueOnce(mockMarriage);
        vi.mocked(prisma.loveStreak.findUnique).mockResolvedValueOnce(mockStreak);
        vi.mocked(prisma.loveStreak.update).mockResolvedValueOnce({
          ...mockStreak,
          user1CompletedToday: true,
        });

        const result = await loveStreakService.processLoveStreak(
          'user1-discord-id',
          'guild-discord-id'
        );

        expect(result.status).toBe('first_completed');
        expect(result.streak.user1CompletedToday).toBe(true);
        expect(result.message).toContain('Waiting for partner');
      });

      it('should mark user2 as completed when they complete first', async () => {
        const yesterday = getYesterdayUTC7();
        const mockStreak = createMockStreak({
          lastCompletedDate: yesterday,
          lastRecoveryResetDate: getCurrentMonthUTC7() + '-01',
        });

        vi.mocked(marriageService.getMarriage).mockResolvedValueOnce(mockMarriage);
        vi.mocked(prisma.loveStreak.findUnique).mockResolvedValueOnce(mockStreak);
        vi.mocked(prisma.loveStreak.update).mockResolvedValueOnce({
          ...mockStreak,
          user2CompletedToday: true,
        });

        const result = await loveStreakService.processLoveStreak(
          'user2-discord-id',
          'guild-discord-id'
        );

        expect(result.status).toBe('first_completed');
        expect(result.streak.user2CompletedToday).toBe(true);
      });

      it('should NOT increment streak when only first partner completes', async () => {
        const yesterday = getYesterdayUTC7();
        const mockStreak = createMockStreak({
          currentStreak: 5,
          lastCompletedDate: yesterday,
          lastRecoveryResetDate: getCurrentMonthUTC7() + '-01',
        });

        vi.mocked(marriageService.getMarriage).mockResolvedValueOnce(mockMarriage);
        vi.mocked(prisma.loveStreak.findUnique).mockResolvedValueOnce(mockStreak);
        vi.mocked(prisma.loveStreak.update).mockResolvedValueOnce({
          ...mockStreak,
          user1CompletedToday: true,
        });

        const result = await loveStreakService.processLoveStreak(
          'user1-discord-id',
          'guild-discord-id'
        );

        expect(result.streak.currentStreak).toBe(5); // Unchanged
      });
    });

    describe('Both completion scenario', () => {
      it('should return both_completed status when second partner completes', async () => {
        const yesterday = getYesterdayUTC7();
        const mockStreak = createMockStreak({
          currentStreak: 5,
          bestStreak: 10,
          totalDays: 15,
          user1CompletedToday: true, // Partner already completed
          lastCompletedDate: yesterday,
          lastRecoveryResetDate: getCurrentMonthUTC7() + '-01',
        });

        vi.mocked(marriageService.getMarriage).mockResolvedValueOnce(mockMarriage);
        vi.mocked(prisma.loveStreak.findUnique).mockResolvedValueOnce(mockStreak);
        vi.mocked(prisma.loveStreak.update).mockResolvedValueOnce({
          ...mockStreak,
          currentStreak: 6,
          totalDays: 16,
          user2CompletedToday: true,
          lastCompletedDate: getTodayUTC7(),
        });

        const result = await loveStreakService.processLoveStreak(
          'user2-discord-id',
          'guild-discord-id'
        );

        expect(result.status).toBe('both_completed');
        expect(result.streak.currentStreak).toBe(6);
        expect(result.streak.totalDays).toBe(16);
      });

      it('should increment current_streak when both complete', async () => {
        const yesterday = getYesterdayUTC7();
        const mockStreak = createMockStreak({
          currentStreak: 3,
          user2CompletedToday: true,
          lastCompletedDate: yesterday,
          lastRecoveryResetDate: getCurrentMonthUTC7() + '-01',
        });

        vi.mocked(marriageService.getMarriage).mockResolvedValueOnce(mockMarriage);
        vi.mocked(prisma.loveStreak.findUnique).mockResolvedValueOnce(mockStreak);
        vi.mocked(prisma.loveStreak.update).mockResolvedValueOnce({
          ...mockStreak,
          currentStreak: 4,
          user1CompletedToday: true,
        });

        const result = await loveStreakService.processLoveStreak(
          'user1-discord-id',
          'guild-discord-id'
        );

        expect(result.streak.currentStreak).toBe(4);
      });

      it('should update best_streak if current exceeds it', async () => {
        const yesterday = getYesterdayUTC7();
        const mockStreak = createMockStreak({
          currentStreak: 10,
          bestStreak: 10,
          user1CompletedToday: true,
          lastCompletedDate: yesterday,
          lastRecoveryResetDate: getCurrentMonthUTC7() + '-01',
        });

        vi.mocked(marriageService.getMarriage).mockResolvedValueOnce(mockMarriage);
        vi.mocked(prisma.loveStreak.findUnique).mockResolvedValueOnce(mockStreak);
        vi.mocked(prisma.loveStreak.update).mockResolvedValueOnce({
          ...mockStreak,
          currentStreak: 11,
          bestStreak: 11,
          user2CompletedToday: true,
        });

        const result = await loveStreakService.processLoveStreak(
          'user2-discord-id',
          'guild-discord-id'
        );

        expect(result.streak.bestStreak).toBe(11);
      });

      it('should NOT update best_streak if current does not exceed it', async () => {
        const yesterday = getYesterdayUTC7();
        const mockStreak = createMockStreak({
          currentStreak: 5,
          bestStreak: 20,
          user1CompletedToday: true,
          lastCompletedDate: yesterday,
          lastRecoveryResetDate: getCurrentMonthUTC7() + '-01',
        });

        vi.mocked(marriageService.getMarriage).mockResolvedValueOnce(mockMarriage);
        vi.mocked(prisma.loveStreak.findUnique).mockResolvedValueOnce(mockStreak);
        vi.mocked(prisma.loveStreak.update).mockResolvedValueOnce({
          ...mockStreak,
          currentStreak: 6,
          bestStreak: 20, // Unchanged
          user2CompletedToday: true,
        });

        const result = await loveStreakService.processLoveStreak(
          'user2-discord-id',
          'guild-discord-id'
        );

        expect(result.streak.bestStreak).toBe(20);
      });

      it('should increment total_days when both complete', async () => {
        const yesterday = getYesterdayUTC7();
        const mockStreak = createMockStreak({
          totalDays: 100,
          user1CompletedToday: true,
          lastCompletedDate: yesterday,
          lastRecoveryResetDate: getCurrentMonthUTC7() + '-01',
        });

        vi.mocked(marriageService.getMarriage).mockResolvedValueOnce(mockMarriage);
        vi.mocked(prisma.loveStreak.findUnique).mockResolvedValueOnce(mockStreak);
        vi.mocked(prisma.loveStreak.update).mockResolvedValueOnce({
          ...mockStreak,
          totalDays: 101,
          user2CompletedToday: true,
        });

        const result = await loveStreakService.processLoveStreak(
          'user2-discord-id',
          'guild-discord-id'
        );

        expect(result.streak.totalDays).toBe(101);
      });

      it('should update last_completed_date to today when both complete', async () => {
        const yesterday = getYesterdayUTC7();
        const today = getTodayUTC7();
        const mockStreak = createMockStreak({
          user1CompletedToday: true,
          lastCompletedDate: yesterday,
          lastRecoveryResetDate: getCurrentMonthUTC7() + '-01',
        });

        vi.mocked(marriageService.getMarriage).mockResolvedValueOnce(mockMarriage);
        vi.mocked(prisma.loveStreak.findUnique).mockResolvedValueOnce(mockStreak);
        vi.mocked(prisma.loveStreak.update).mockResolvedValueOnce({
          ...mockStreak,
          user2CompletedToday: true,
          lastCompletedDate: today,
        });

        const result = await loveStreakService.processLoveStreak(
          'user2-discord-id',
          'guild-discord-id'
        );

        expect(result.streak.lastCompletedDate).toBe(today);
      });
    });

    describe('Already completed scenario', () => {
      it('should return already_completed when user1 tries to complete again', async () => {
        const yesterday = getYesterdayUTC7();
        const mockStreak = createMockStreak({
          user1CompletedToday: true,
          lastCompletedDate: yesterday,
          lastRecoveryResetDate: getCurrentMonthUTC7() + '-01',
        });

        vi.mocked(marriageService.getMarriage).mockResolvedValueOnce(mockMarriage);
        vi.mocked(prisma.loveStreak.findUnique).mockResolvedValueOnce(mockStreak);

        const result = await loveStreakService.processLoveStreak(
          'user1-discord-id',
          'guild-discord-id'
        );

        expect(result.status).toBe('already_completed');
        expect(result.message).toContain('already completed');
      });

      it('should return already_completed when user2 tries to complete again', async () => {
        const yesterday = getYesterdayUTC7();
        const mockStreak = createMockStreak({
          user2CompletedToday: true,
          lastCompletedDate: yesterday,
          lastRecoveryResetDate: getCurrentMonthUTC7() + '-01',
        });

        vi.mocked(marriageService.getMarriage).mockResolvedValueOnce(mockMarriage);
        vi.mocked(prisma.loveStreak.findUnique).mockResolvedValueOnce(mockStreak);

        const result = await loveStreakService.processLoveStreak(
          'user2-discord-id',
          'guild-discord-id'
        );

        expect(result.status).toBe('already_completed');
      });

      it('should NOT modify streak when already completed', async () => {
        const mockStreak = createMockStreak({
          currentStreak: 5,
          user1CompletedToday: true,
          lastRecoveryResetDate: getCurrentMonthUTC7() + '-01',
        });

        vi.mocked(marriageService.getMarriage).mockResolvedValueOnce(mockMarriage);
        vi.mocked(prisma.loveStreak.findUnique).mockResolvedValueOnce(mockStreak);

        const result = await loveStreakService.processLoveStreak(
          'user1-discord-id',
          'guild-discord-id'
        );

        expect(result.streak.currentStreak).toBe(5);
        expect(prisma.loveStreak.update).not.toHaveBeenCalled();
      });
    });

    describe('Recovery scenario', () => {
      it('should apply recovery when missed day with 0 recoveries used', async () => {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];

        const mockStreak = createMockStreak({
          currentStreak: 5,
          recoveriesUsedThisMonth: 0,
          lastCompletedDate: twoDaysAgoStr,
          lastRecoveryResetDate: getCurrentMonthUTC7() + '-01',
        });

        vi.mocked(marriageService.getMarriage).mockResolvedValueOnce(mockMarriage);
        vi.mocked(prisma.loveStreak.findUnique).mockResolvedValueOnce(mockStreak);
        vi.mocked(prisma.loveStreak.update).mockResolvedValueOnce({
          ...mockStreak,
          recoveriesUsedThisMonth: 1,
          user1CompletedToday: true,
        });

        const result = await loveStreakService.processLoveStreak(
          'user1-discord-id',
          'guild-discord-id'
        );

        expect(result.status).toBe('streak_recovered');
        expect(result.recoveriesRemaining).toBe(2);
      });

      it('should apply recovery when missed day with 1 recovery used', async () => {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];

        const mockStreak = createMockStreak({
          currentStreak: 5,
          recoveriesUsedThisMonth: 1,
          lastCompletedDate: twoDaysAgoStr,
          lastRecoveryResetDate: getCurrentMonthUTC7() + '-01',
        });

        vi.mocked(marriageService.getMarriage).mockResolvedValueOnce(mockMarriage);
        vi.mocked(prisma.loveStreak.findUnique).mockResolvedValueOnce(mockStreak);
        vi.mocked(prisma.loveStreak.update).mockResolvedValueOnce({
          ...mockStreak,
          recoveriesUsedThisMonth: 2,
          user1CompletedToday: true,
        });

        const result = await loveStreakService.processLoveStreak(
          'user1-discord-id',
          'guild-discord-id'
        );

        expect(result.status).toBe('streak_recovered');
        expect(result.recoveriesRemaining).toBe(1);
      });

      it('should apply recovery when missed day with 2 recoveries used', async () => {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];

        const mockStreak = createMockStreak({
          currentStreak: 5,
          recoveriesUsedThisMonth: 2,
          lastCompletedDate: twoDaysAgoStr,
          lastRecoveryResetDate: getCurrentMonthUTC7() + '-01',
        });

        vi.mocked(marriageService.getMarriage).mockResolvedValueOnce(mockMarriage);
        vi.mocked(prisma.loveStreak.findUnique).mockResolvedValueOnce(mockStreak);
        vi.mocked(prisma.loveStreak.update).mockResolvedValueOnce({
          ...mockStreak,
          recoveriesUsedThisMonth: 3,
          user1CompletedToday: true,
        });

        const result = await loveStreakService.processLoveStreak(
          'user1-discord-id',
          'guild-discord-id'
        );

        expect(result.status).toBe('streak_recovered');
        expect(result.recoveriesRemaining).toBe(0);
        expect(result.isLastRecovery).toBe(true);
      });

      it('should increment recoveries_used_this_month when recovery applied', async () => {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];

        const mockStreak = createMockStreak({
          recoveriesUsedThisMonth: 1,
          lastCompletedDate: twoDaysAgoStr,
          lastRecoveryResetDate: getCurrentMonthUTC7() + '-01',
        });

        vi.mocked(marriageService.getMarriage).mockResolvedValueOnce(mockMarriage);
        vi.mocked(prisma.loveStreak.findUnique).mockResolvedValueOnce(mockStreak);
        vi.mocked(prisma.loveStreak.update).mockResolvedValueOnce({
          ...mockStreak,
          recoveriesUsedThisMonth: 2,
        });

        await loveStreakService.processLoveStreak(
          'user1-discord-id',
          'guild-discord-id'
        );

        expect(prisma.loveStreak.update).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              recoveriesUsedThisMonth: 2,
            }),
          })
        );
      });

      it('should maintain current_streak value when recovery applied', async () => {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];

        const mockStreak = createMockStreak({
          currentStreak: 10,
          recoveriesUsedThisMonth: 0,
          lastCompletedDate: twoDaysAgoStr,
          lastRecoveryResetDate: getCurrentMonthUTC7() + '-01',
        });

        vi.mocked(marriageService.getMarriage).mockResolvedValueOnce(mockMarriage);
        vi.mocked(prisma.loveStreak.findUnique).mockResolvedValueOnce(mockStreak);
        vi.mocked(prisma.loveStreak.update).mockResolvedValueOnce({
          ...mockStreak,
          recoveriesUsedThisMonth: 1,
          user1CompletedToday: true,
        });

        const result = await loveStreakService.processLoveStreak(
          'user1-discord-id',
          'guild-discord-id'
        );

        expect(result.streak.currentStreak).toBe(10); // Unchanged
      });

      it('should return correct recoveriesRemaining count', async () => {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];

        const mockStreak = createMockStreak({
          recoveriesUsedThisMonth: 1,
          lastCompletedDate: twoDaysAgoStr,
          lastRecoveryResetDate: getCurrentMonthUTC7() + '-01',
        });

        vi.mocked(marriageService.getMarriage).mockResolvedValueOnce(mockMarriage);
        vi.mocked(prisma.loveStreak.findUnique).mockResolvedValueOnce(mockStreak);
        vi.mocked(prisma.loveStreak.update).mockResolvedValueOnce({
          ...mockStreak,
          recoveriesUsedThisMonth: 2,
        });

        const result = await loveStreakService.processLoveStreak(
          'user1-discord-id',
          'guild-discord-id'
        );

        expect(result.recoveriesRemaining).toBe(1); // 3 - 2 = 1
      });

      it('should apply recovery for user2 when they trigger it', async () => {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];

        const mockStreak = createMockStreak({
          currentStreak: 5,
          recoveriesUsedThisMonth: 0,
          lastCompletedDate: twoDaysAgoStr,
          lastRecoveryResetDate: getCurrentMonthUTC7() + '-01',
        });

        vi.mocked(marriageService.getMarriage).mockResolvedValueOnce(mockMarriage);
        vi.mocked(prisma.loveStreak.findUnique).mockResolvedValueOnce(mockStreak);
        vi.mocked(prisma.loveStreak.update).mockResolvedValueOnce({
          ...mockStreak,
          recoveriesUsedThisMonth: 1,
          user2CompletedToday: true,
          user1CompletedToday: false,
        });

        const result = await loveStreakService.processLoveStreak(
          'user2-discord-id', // user2 triggers recovery
          'guild-discord-id'
        );

        expect(result.status).toBe('streak_recovered');
        expect(result.streak.user2CompletedToday).toBe(true);
        expect(result.streak.user1CompletedToday).toBe(false);
      });
    });

    describe('Streak loss scenario', () => {
      it('should reset streak to 0 when missed day with 3 recoveries used', async () => {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];

        const mockStreak = createMockStreak({
          currentStreak: 15,
          bestStreak: 20,
          recoveriesUsedThisMonth: 3,
          lastCompletedDate: twoDaysAgoStr,
          lastRecoveryResetDate: getCurrentMonthUTC7() + '-01',
        });

        vi.mocked(marriageService.getMarriage).mockResolvedValueOnce(mockMarriage);
        vi.mocked(prisma.loveStreak.findUnique).mockResolvedValueOnce(mockStreak);
        vi.mocked(prisma.loveStreak.update).mockResolvedValueOnce({
          ...mockStreak,
          currentStreak: 0,
          user1CompletedToday: true,
        });

        const result = await loveStreakService.processLoveStreak(
          'user1-discord-id',
          'guild-discord-id'
        );

        expect(result.status).toBe('streak_lost');
        expect(result.streak.currentStreak).toBe(0);
      });

      it('should NOT reset best_streak when streak is lost', async () => {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];

        const mockStreak = createMockStreak({
          currentStreak: 15,
          bestStreak: 25,
          recoveriesUsedThisMonth: 3,
          lastCompletedDate: twoDaysAgoStr,
          lastRecoveryResetDate: getCurrentMonthUTC7() + '-01',
        });

        vi.mocked(marriageService.getMarriage).mockResolvedValueOnce(mockMarriage);
        vi.mocked(prisma.loveStreak.findUnique).mockResolvedValueOnce(mockStreak);
        vi.mocked(prisma.loveStreak.update).mockResolvedValueOnce({
          ...mockStreak,
          currentStreak: 0,
          bestStreak: 25, // Unchanged
        });

        const result = await loveStreakService.processLoveStreak(
          'user1-discord-id',
          'guild-discord-id'
        );

        expect(result.streak.bestStreak).toBe(25);
      });

      it('should return streak_lost status', async () => {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];

        const mockStreak = createMockStreak({
          recoveriesUsedThisMonth: 3,
          lastCompletedDate: twoDaysAgoStr,
          lastRecoveryResetDate: getCurrentMonthUTC7() + '-01',
        });

        vi.mocked(marriageService.getMarriage).mockResolvedValueOnce(mockMarriage);
        vi.mocked(prisma.loveStreak.findUnique).mockResolvedValueOnce(mockStreak);
        vi.mocked(prisma.loveStreak.update).mockResolvedValueOnce({
          ...mockStreak,
          currentStreak: 0,
        });

        const result = await loveStreakService.processLoveStreak(
          'user1-discord-id',
          'guild-discord-id'
        );

        expect(result.status).toBe('streak_lost');
        expect(result.message).toContain('lost');
      });
    });

    describe('New streak creation', () => {
      it('should create new streak if none exists', async () => {
        const today = getTodayUTC7();
        const newStreak = createMockStreak({
          lastRecoveryResetDate: today,
        });

        vi.mocked(marriageService.getMarriage).mockResolvedValueOnce(mockMarriage);
        vi.mocked(prisma.loveStreak.findUnique).mockResolvedValueOnce(null);
        vi.mocked(prisma.loveStreak.create).mockResolvedValueOnce(newStreak);
        vi.mocked(prisma.loveStreak.update).mockResolvedValueOnce({
          ...newStreak,
          user1CompletedToday: true,
        });

        const result = await loveStreakService.processLoveStreak(
          'user1-discord-id',
          'guild-discord-id'
        );

        expect(prisma.loveStreak.create).toHaveBeenCalled();
        expect(result.status).toBe('first_completed');
      });
    });

    describe('Monthly recovery reset', () => {
      it('should reset recoveries when new month starts', async () => {
        const yesterday = getYesterdayUTC7();
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const lastMonthStr = lastMonth.toISOString().slice(0, 7) + '-15';

        const mockStreak = createMockStreak({
          recoveriesUsedThisMonth: 3,
          lastRecoveryResetDate: lastMonthStr,
          lastCompletedDate: yesterday,
        });

        const today = getTodayUTC7();
        vi.mocked(marriageService.getMarriage).mockResolvedValueOnce(mockMarriage);
        vi.mocked(prisma.loveStreak.findUnique).mockResolvedValueOnce(mockStreak);
        // First update: monthly reset
        vi.mocked(prisma.loveStreak.update).mockResolvedValueOnce({
          ...mockStreak,
          recoveriesUsedThisMonth: 0,
          lastRecoveryResetDate: today,
        });
        // Second update: mark completion
        vi.mocked(prisma.loveStreak.update).mockResolvedValueOnce({
          ...mockStreak,
          recoveriesUsedThisMonth: 0,
          lastRecoveryResetDate: today,
          user1CompletedToday: true,
        });

        await loveStreakService.processLoveStreak(
          'user1-discord-id',
          'guild-discord-id'
        );

        // Verify monthly reset was called
        expect(prisma.loveStreak.update).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              recoveriesUsedThisMonth: 0,
            }),
          })
        );
      });
    });
  });

  // ==========================================
  // Embed Formatting
  // ==========================================

  describe('formatStreakBoxEmbed', () => {
    it('should return an EmbedBuilder', async () => {
      const mockStreak = createMockStreak();

      const result = await loveStreakService.formatStreakBoxEmbed(
        mockStreak,
        mockMarriage,
        mockClient
      );

      expect(result).toBeInstanceOf(EmbedBuilder);
    });

    it('should show both users in description', async () => {
      const mockStreak = createMockStreak();

      const result = await loveStreakService.formatStreakBoxEmbed(
        mockStreak,
        mockMarriage,
        mockClient
      );

      const embed = result.toJSON();
      expect(embed.description).toContain('TestUser');
    });

    it('should show completed emoji for completed user', async () => {
      const mockStreak = createMockStreak({
        user1CompletedToday: true,
      });

      const result = await loveStreakService.formatStreakBoxEmbed(
        mockStreak,
        mockMarriage,
        mockClient
      );

      const embed = result.toJSON();
      expect(embed.description).toContain('✅');
    });

    it('should show footer with current streak count', async () => {
      const mockStreak = createMockStreak({
        currentStreak: 7,
      });

      const result = await loveStreakService.formatStreakBoxEmbed(
        mockStreak,
        mockMarriage,
        mockClient
      );

      const embed = result.toJSON();
      expect(embed.footer?.text).toContain('7');
    });

    it('should use green color when both completed', async () => {
      const mockStreak = createMockStreak({
        user1CompletedToday: true,
        user2CompletedToday: true,
      });

      const result = await loveStreakService.formatStreakBoxEmbed(
        mockStreak,
        mockMarriage,
        mockClient
      );

      const embed = result.toJSON();
      expect(embed.color).toBe(0x00ff00); // Green
    });

    it('should use yellow color when waiting for partner', async () => {
      const mockStreak = createMockStreak({
        user1CompletedToday: true,
        user2CompletedToday: false,
      });

      const result = await loveStreakService.formatStreakBoxEmbed(
        mockStreak,
        mockMarriage,
        mockClient
      );

      const embed = result.toJSON();
      expect(embed.color).toBe(0xffff00); // Yellow
    });

    it('should handle user fetch errors gracefully', async () => {
      const mockStreak = createMockStreak();
      const errorClient = {
        users: {
          fetch: vi.fn().mockRejectedValue(new Error('User not found')),
        },
      } as unknown as Client;

      const result = await loveStreakService.formatStreakBoxEmbed(
        mockStreak,
        mockMarriage,
        errorClient
      );

      const embed = result.toJSON();
      // Should use fallback names
      expect(embed.description).toContain('User 1');
      expect(embed.description).toContain('User 2');
    });

    it('should set title to Streak Box', async () => {
      const mockStreak = createMockStreak();

      const result = await loveStreakService.formatStreakBoxEmbed(
        mockStreak,
        mockMarriage,
        mockClient
      );

      const embed = result.toJSON();
      expect(embed.title).toBe('💕 Streak Box');
    });

    it('should use fallback emojis when formatEmojiFromGuildByName returns null', async () => {
      const mockStreak = createMockStreak({
        user1CompletedToday: false,
        user2CompletedToday: true,
      });

      // Mock emoji function to return null
      const { formatEmojiFromGuildByName } = await import('../utils/emojis.js');
      vi.mocked(formatEmojiFromGuildByName).mockReturnValue(null);

      const result = await loveStreakService.formatStreakBoxEmbed(
        mockStreak,
        mockMarriage,
        mockClient
      );

      const embed = result.toJSON();
      // Should use fallback emojis
      expect(embed.description).toContain('⏳'); // Pending fallback
      expect(embed.description).toContain('✅'); // Completed fallback
    });

    it('should use username when displayName is not available', async () => {
      const mockStreak = createMockStreak();
      const clientWithoutDisplayName = {
        users: {
          fetch: vi.fn().mockResolvedValue({
            id: 'user1-discord-id',
            displayName: '', // Empty displayName
            username: 'fallback_username',
          }),
        },
      } as unknown as Client;

      const result = await loveStreakService.formatStreakBoxEmbed(
        mockStreak,
        mockMarriage,
        clientWithoutDisplayName
      );

      const embed = result.toJSON();
      expect(embed.description).toContain('fallback_username');
    });
  });

  // ==========================================
  // Cron Job Methods
  // ==========================================

  describe('resetDailyCompletions', () => {
    it('should reset completion flags for all streaks', async () => {
      vi.mocked(prisma.loveStreak.updateMany).mockResolvedValueOnce({
        count: 10,
      });

      const result = await loveStreakService.resetDailyCompletions();

      expect(result).toBe(10);
      expect(prisma.loveStreak.updateMany).toHaveBeenCalledWith({
        data: {
          user1CompletedToday: false,
          user2CompletedToday: false,
        },
      });
    });

    it('should return 0 when no streaks exist', async () => {
      vi.mocked(prisma.loveStreak.updateMany).mockResolvedValueOnce({
        count: 0,
      });

      const result = await loveStreakService.resetDailyCompletions();

      expect(result).toBe(0);
    });

    it('should throw error on database failure', async () => {
      vi.mocked(prisma.loveStreak.updateMany).mockRejectedValueOnce(
        new Error('Database error')
      );

      await expect(loveStreakService.resetDailyCompletions()).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('resetMonthlyRecoveries', () => {
    it('should reset recovery counts for all streaks', async () => {
      vi.mocked(prisma.loveStreak.updateMany).mockResolvedValueOnce({
        count: 5,
      });

      const result = await loveStreakService.resetMonthlyRecoveries();

      expect(result).toBe(5);
      expect(prisma.loveStreak.updateMany).toHaveBeenCalledWith({
        data: expect.objectContaining({
          recoveriesUsedThisMonth: 0,
        }),
      });
    });

    it('should update last_recovery_reset_date to current date', async () => {
      vi.mocked(prisma.loveStreak.updateMany).mockResolvedValueOnce({
        count: 1,
      });

      await loveStreakService.resetMonthlyRecoveries();

      expect(prisma.loveStreak.updateMany).toHaveBeenCalledWith({
        data: expect.objectContaining({
          lastRecoveryResetDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        }),
      });
    });

    it('should return 0 when no streaks exist', async () => {
      vi.mocked(prisma.loveStreak.updateMany).mockResolvedValueOnce({
        count: 0,
      });

      const result = await loveStreakService.resetMonthlyRecoveries();

      expect(result).toBe(0);
    });

    it('should throw error on database failure', async () => {
      vi.mocked(prisma.loveStreak.updateMany).mockRejectedValueOnce(
        new Error('Database connection failed')
      );

      await expect(loveStreakService.resetMonthlyRecoveries()).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  // ==========================================
  // Exported Constants
  // ==========================================

  describe('Exported Constants', () => {
    it('should export EMOJI_FAILED constant', () => {
      expect(EMOJI_FAILED).toBe('emoji_57');
    });
  });
});

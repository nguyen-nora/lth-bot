import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChatInputCommandInteraction, Client, Guild, User } from 'discord.js';
import loveCommand from './love.js';
import { loveStreakService, LoveStreak, LoveStreakResult } from '../services/loveStreakService.js';
import { translationService } from '../services/translationService.js';
import { Marriage } from '../services/marriageService.js';

// ==========================================
// Mocks
// ==========================================

vi.mock('../services/loveStreakService.js', () => ({
  loveStreakService: {
    processLoveStreak: vi.fn(),
    formatStreakBoxEmbed: vi.fn(),
  },
  EMOJI_FAILED: 'emoji_57',
}));

vi.mock('../services/translationService.js', () => ({
  translationService: {
    t: vi.fn((key: string) => {
      const translations: Record<string, string> = {
        'common.serverOnly': 'This command can only be used in a server',
        'common.unknownError': 'An unknown error occurred',
        'errors.notMarried': 'You are not married',
        'love.streakRecoveredLastChance': 'This is your last recovery! Be careful!',
        'love.notMarriedHint': '❌ Bạn chưa kết hôn. Sử dụng `/kethon @user` để cầu hôn!',
      };
      return translations[key] || key;
    }),
  },
}));

vi.mock('../utils/emojis.js', () => ({
  formatEmojiFromGuildByName: vi.fn(() => '💔'),
}));

// ==========================================
// Test Fixtures
// ==========================================

const mockMarriage: Marriage = {
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

const createMockEmbed = () => ({
  toJSON: () => ({
    title: '💕 Streak Box',
    description: 'TestUser: ✅\nPartner: ⏳',
    color: 0xffff00,
  }),
});

const createMockInteraction = (overrides: Partial<ChatInputCommandInteraction> = {}) => {
  const interaction = {
    user: {
      id: 'user1-discord-id',
      displayName: 'TestUser',
    } as User,
    guild: {
      id: 'guild-discord-id',
      name: 'Test Guild',
    } as Guild,
    client: {} as Client,
    reply: vi.fn().mockResolvedValue(undefined),
    deferReply: vi.fn().mockResolvedValue(undefined),
    editReply: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as ChatInputCommandInteraction;
  
  return interaction;
};

// ==========================================
// Tests
// ==========================================

describe('Love Command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // Command Metadata
  // ==========================================

  describe('Command Metadata', () => {
    it('should have correct name', () => {
      expect(loveCommand.data.name).toBe('love');
    });

    it('should have description in Vietnamese', () => {
      expect(loveCommand.data.description).toContain('streak');
    });
  });

  // ==========================================
  // Guild Validation
  // ==========================================

  describe('Guild Validation', () => {
    it('should return error when used outside a guild', async () => {
      const interaction = createMockInteraction({ guild: null });

      await loveCommand.execute(interaction);

      // Guild check happens before deferReply, so uses reply directly
      expect(interaction.reply).toHaveBeenCalledWith({
        content: 'This command can only be used in a server',
        ephemeral: true,
      });
    });

    it('should proceed when guild exists', async () => {
      const interaction = createMockInteraction();
      const mockResult: LoveStreakResult = {
        status: 'first_completed',
        streak: createMockStreak(),
        marriage: mockMarriage,
        message: 'You completed first!',
      };

      vi.mocked(loveStreakService.processLoveStreak).mockResolvedValueOnce(mockResult);
      vi.mocked(loveStreakService.formatStreakBoxEmbed).mockResolvedValueOnce(createMockEmbed() as any);

      await loveCommand.execute(interaction);

      expect(loveStreakService.processLoveStreak).toHaveBeenCalledWith(
        'user1-discord-id',
        'guild-discord-id'
      );
    });
  });

  // ==========================================
  // Status: first_completed
  // ==========================================

  describe('Status: first_completed', () => {
    it('should show Streak Box and waiting message', async () => {
      const interaction = createMockInteraction();
      const mockResult: LoveStreakResult = {
        status: 'first_completed',
        streak: createMockStreak({ user1CompletedToday: true }),
        marriage: mockMarriage,
        message: 'You completed first! Waiting for partner...',
      };

      vi.mocked(loveStreakService.processLoveStreak).mockResolvedValueOnce(mockResult);
      vi.mocked(loveStreakService.formatStreakBoxEmbed).mockResolvedValueOnce(createMockEmbed() as any);

      await loveCommand.execute(interaction);

      expect(interaction.editReply).toHaveBeenCalledWith({
        content: 'You completed first! Waiting for partner...',
        embeds: [expect.anything()],
      });
    });

    it('should call deferReply first', async () => {
      const interaction = createMockInteraction();
      const mockResult: LoveStreakResult = {
        status: 'first_completed',
        streak: createMockStreak(),
        marriage: mockMarriage,
        message: 'First completed!',
      };

      vi.mocked(loveStreakService.processLoveStreak).mockResolvedValueOnce(mockResult);
      vi.mocked(loveStreakService.formatStreakBoxEmbed).mockResolvedValueOnce(createMockEmbed() as any);

      await loveCommand.execute(interaction);

      expect(interaction.deferReply).toHaveBeenCalled();
    });
  });

  // ==========================================
  // Status: both_completed
  // ==========================================

  describe('Status: both_completed', () => {
    it('should show success message and Streak Box', async () => {
      const interaction = createMockInteraction();
      const mockResult: LoveStreakResult = {
        status: 'both_completed',
        streak: createMockStreak({
          currentStreak: 5,
          user1CompletedToday: true,
          user2CompletedToday: true,
        }),
        marriage: mockMarriage,
        message: 'Streak maintained! Your streak is 5 days!',
      };

      vi.mocked(loveStreakService.processLoveStreak).mockResolvedValueOnce(mockResult);
      vi.mocked(loveStreakService.formatStreakBoxEmbed).mockResolvedValueOnce(createMockEmbed() as any);

      await loveCommand.execute(interaction);

      expect(interaction.editReply).toHaveBeenCalledWith({
        content: 'Streak maintained! Your streak is 5 days!',
        embeds: [expect.anything()],
      });
    });
  });

  // ==========================================
  // Status: already_completed
  // ==========================================

  describe('Status: already_completed', () => {
    it('should show current status', async () => {
      const interaction = createMockInteraction();
      const mockResult: LoveStreakResult = {
        status: 'already_completed',
        streak: createMockStreak({ user1CompletedToday: true }),
        marriage: mockMarriage,
        message: 'You already completed today!',
      };

      vi.mocked(loveStreakService.processLoveStreak).mockResolvedValueOnce(mockResult);
      vi.mocked(loveStreakService.formatStreakBoxEmbed).mockResolvedValueOnce(createMockEmbed() as any);

      await loveCommand.execute(interaction);

      expect(interaction.editReply).toHaveBeenCalledWith({
        content: 'You already completed today!',
        embeds: [expect.anything()],
      });
    });
  });

  // ==========================================
  // Status: streak_recovered
  // ==========================================

  describe('Status: streak_recovered', () => {
    it('should show recovery message with Streak Box', async () => {
      const interaction = createMockInteraction();
      const mockResult: LoveStreakResult = {
        status: 'streak_recovered',
        streak: createMockStreak({ recoveriesUsedThisMonth: 1 }),
        marriage: mockMarriage,
        message: 'Streak recovered! 2 recoveries remaining',
        recoveriesRemaining: 2,
        isLastRecovery: false,
      };

      vi.mocked(loveStreakService.processLoveStreak).mockResolvedValueOnce(mockResult);
      vi.mocked(loveStreakService.formatStreakBoxEmbed).mockResolvedValueOnce(createMockEmbed() as any);

      await loveCommand.execute(interaction);

      expect(interaction.editReply).toHaveBeenCalledWith({
        content: 'Streak recovered! 2 recoveries remaining',
        embeds: [expect.anything()],
      });
    });

    it('should show last chance warning when isLastRecovery is true', async () => {
      const interaction = createMockInteraction();
      const mockResult: LoveStreakResult = {
        status: 'streak_recovered',
        streak: createMockStreak({ recoveriesUsedThisMonth: 3 }),
        marriage: mockMarriage,
        message: 'Streak recovered! 0 recoveries remaining',
        recoveriesRemaining: 0,
        isLastRecovery: true,
      };

      vi.mocked(loveStreakService.processLoveStreak).mockResolvedValueOnce(mockResult);
      vi.mocked(loveStreakService.formatStreakBoxEmbed).mockResolvedValueOnce(createMockEmbed() as any);

      await loveCommand.execute(interaction);

      expect(interaction.editReply).toHaveBeenCalledWith({
        content: 'This is your last recovery! Be careful!',
        embeds: [expect.anything()],
      });
    });
  });

  // ==========================================
  // Status: streak_lost
  // ==========================================

  describe('Status: streak_lost', () => {
    it('should show failure message with broken heart emoji', async () => {
      const interaction = createMockInteraction();
      const mockResult: LoveStreakResult = {
        status: 'streak_lost',
        streak: createMockStreak({ currentStreak: 0 }),
        marriage: mockMarriage,
        message: 'Your streak was lost!',
      };

      vi.mocked(loveStreakService.processLoveStreak).mockResolvedValueOnce(mockResult);
      vi.mocked(loveStreakService.formatStreakBoxEmbed).mockResolvedValueOnce(createMockEmbed() as any);

      await loveCommand.execute(interaction);

      expect(interaction.editReply).toHaveBeenCalledWith({
        content: expect.stringContaining('Your streak was lost!'),
        embeds: [expect.anything()],
      });
    });

    it('should include emoji in failure message', async () => {
      const interaction = createMockInteraction();
      const mockResult: LoveStreakResult = {
        status: 'streak_lost',
        streak: createMockStreak(),
        marriage: mockMarriage,
        message: 'Streak lost!',
      };

      vi.mocked(loveStreakService.processLoveStreak).mockResolvedValueOnce(mockResult);
      vi.mocked(loveStreakService.formatStreakBoxEmbed).mockResolvedValueOnce(createMockEmbed() as any);

      await loveCommand.execute(interaction);

      expect(interaction.editReply).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.stringContaining('💔'),
        })
      );
    });

    it('should use fallback emoji when formatEmojiFromGuildByName returns null', async () => {
      const interaction = createMockInteraction();
      const mockResult: LoveStreakResult = {
        status: 'streak_lost',
        streak: createMockStreak(),
        marriage: mockMarriage,
        message: 'Streak lost!',
      };

      // Mock emoji function to return null
      const { formatEmojiFromGuildByName } = await import('../utils/emojis.js');
      vi.mocked(formatEmojiFromGuildByName).mockReturnValueOnce(null);

      vi.mocked(loveStreakService.processLoveStreak).mockResolvedValueOnce(mockResult);
      vi.mocked(loveStreakService.formatStreakBoxEmbed).mockResolvedValueOnce(createMockEmbed() as any);

      await loveCommand.execute(interaction);

      // Should use fallback emoji 💔
      expect(interaction.editReply).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.stringContaining('💔'),
        })
      );
    });
  });

  // ==========================================
  // Error Handling
  // ==========================================

  describe('Error Handling', () => {
    it('should handle not married error with specific message', async () => {
      const interaction = createMockInteraction();

      vi.mocked(loveStreakService.processLoveStreak).mockRejectedValueOnce(
        new Error('You are not married')
      );

      await loveCommand.execute(interaction);

      expect(interaction.editReply).toHaveBeenCalledWith({
        content: '❌ Bạn chưa kết hôn. Sử dụng `/kethon @user` để cầu hôn!',
      });
    });

    it('should handle generic errors with error message', async () => {
      const interaction = createMockInteraction();

      vi.mocked(loveStreakService.processLoveStreak).mockRejectedValueOnce(
        new Error('Database connection failed')
      );

      await loveCommand.execute(interaction);

      expect(interaction.editReply).toHaveBeenCalledWith({
        content: '❌ Database connection failed',
      });
    });

    it('should handle non-Error exceptions with unknown error message', async () => {
      const interaction = createMockInteraction();

      vi.mocked(loveStreakService.processLoveStreak).mockRejectedValueOnce('Some string error');

      await loveCommand.execute(interaction);

      expect(interaction.editReply).toHaveBeenCalledWith({
        content: '❌ An unknown error occurred',
      });
    });

    it('should call deferReply before processing', async () => {
      const interaction = createMockInteraction();

      vi.mocked(loveStreakService.processLoveStreak).mockRejectedValueOnce(
        new Error('Some error')
      );

      await loveCommand.execute(interaction);

      expect(interaction.deferReply).toHaveBeenCalled();
    });
  });

  // ==========================================
  // Default Status Handler
  // ==========================================

  describe('Default Status Handler', () => {
    it('should handle unknown status gracefully', async () => {
      const interaction = createMockInteraction();
      const mockResult = {
        status: 'unknown_status' as any,
        streak: createMockStreak(),
        marriage: mockMarriage,
        message: 'Unknown status message',
      };

      vi.mocked(loveStreakService.processLoveStreak).mockResolvedValueOnce(mockResult);
      vi.mocked(loveStreakService.formatStreakBoxEmbed).mockResolvedValueOnce(createMockEmbed() as any);

      await loveCommand.execute(interaction);

      expect(interaction.editReply).toHaveBeenCalledWith({
        content: 'Unknown status message',
        embeds: [expect.anything()],
      });
    });
  });
});

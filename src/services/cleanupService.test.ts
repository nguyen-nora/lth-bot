import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cleanupService } from './cleanupService.js';
import prisma from '../database/prisma.js';

// Mock Prisma client
vi.mock('../database/prisma.js', () => ({
  default: {
    proposal: {
      deleteMany: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

describe('CleanupService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('cleanupExpiredProposals', () => {
    it('should delete declined proposals older than 7 days', async () => {
      const mockDeclinedResult = { count: 5 };
      const mockExpiredResult = { count: 0 };

      vi.mocked(prisma.proposal.deleteMany).mockResolvedValueOnce(
        mockDeclinedResult
      );
      vi.mocked(prisma.proposal.deleteMany).mockResolvedValueOnce(
        mockExpiredResult
      );

      const result = await cleanupService.cleanupExpiredProposals();

      expect(result).toBe(5);
      expect(prisma.proposal.deleteMany).toHaveBeenCalledTimes(2);
      
      // Verify first call (declined proposals)
      const firstCall = vi.mocked(prisma.proposal.deleteMany).mock.calls[0]?.[0];
      expect(firstCall).toBeDefined();
      if (firstCall && 'where' in firstCall) {
        expect(firstCall.where.status).toBe('declined');
        if ('createdAt' in firstCall.where && firstCall.where.createdAt && typeof firstCall.where.createdAt === 'object' && 'lt' in firstCall.where.createdAt) {
          expect(firstCall.where.createdAt.lt).toBeInstanceOf(Date);
        }
      }
      
      // Verify second call (expired proposals)
      const secondCall = vi.mocked(prisma.proposal.deleteMany).mock.calls[1]?.[0];
      expect(secondCall).toBeDefined();
      if (secondCall && 'where' in secondCall) {
        expect(secondCall.where.status).toBe('expired');
        if ('createdAt' in secondCall.where && secondCall.where.createdAt && typeof secondCall.where.createdAt === 'object' && 'lt' in secondCall.where.createdAt) {
          expect(secondCall.where.createdAt.lt).toBeInstanceOf(Date);
        }
      }
    });

    it('should delete expired proposals older than 7 days', async () => {
      const mockDeclinedResult = { count: 0 };
      const mockExpiredResult = { count: 3 };

      vi.mocked(prisma.proposal.deleteMany).mockResolvedValueOnce(
        mockDeclinedResult
      );
      vi.mocked(prisma.proposal.deleteMany).mockResolvedValueOnce(
        mockExpiredResult
      );

      const result = await cleanupService.cleanupExpiredProposals();

      expect(result).toBe(3);
    });

    it('should return total count of both declined and expired proposals', async () => {
      const mockDeclinedResult = { count: 2 };
      const mockExpiredResult = { count: 4 };

      vi.mocked(prisma.proposal.deleteMany).mockResolvedValueOnce(
        mockDeclinedResult
      );
      vi.mocked(prisma.proposal.deleteMany).mockResolvedValueOnce(
        mockExpiredResult
      );

      const result = await cleanupService.cleanupExpiredProposals();

      expect(result).toBe(6);
    });

    it('should return 0 when no proposals to clean up', async () => {
      const mockResult = { count: 0 };

      vi.mocked(prisma.proposal.deleteMany).mockResolvedValueOnce(mockResult);
      vi.mocked(prisma.proposal.deleteMany).mockResolvedValueOnce(mockResult);

      const result = await cleanupService.cleanupExpiredProposals();

      expect(result).toBe(0);
    });

    it('should use correct date calculation (7 days ago)', async () => {
      const mockResult = { count: 0 };

      vi.mocked(prisma.proposal.deleteMany).mockResolvedValue(mockResult);

      await cleanupService.cleanupExpiredProposals();

      const firstCall = vi.mocked(prisma.proposal.deleteMany).mock.calls[0]?.[0];
      expect(firstCall).toBeDefined();
      
      if (firstCall && 'where' in firstCall && 'createdAt' in firstCall.where) {
        const createdAtFilter = firstCall.where.createdAt;
        if (createdAtFilter && typeof createdAtFilter === 'object' && 'lt' in createdAtFilter && createdAtFilter.lt instanceof Date) {
          const sevenDaysAgo = createdAtFilter.lt;
          const expectedDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          
          // Allow 1 second tolerance for test execution time
          const timeDiff = Math.abs(sevenDaysAgo.getTime() - expectedDate.getTime());
          expect(timeDiff).toBeLessThan(1000);
          
          // Verify it's approximately 7 days ago
          const daysDiff = (Date.now() - sevenDaysAgo.getTime()) / (24 * 60 * 60 * 1000);
          expect(daysDiff).toBeGreaterThan(6.9);
          expect(daysDiff).toBeLessThan(7.1);
        }
      }
    });

    it('should handle database errors and throw with descriptive message', async () => {
      const dbError = new Error('Database connection failed');
      vi.mocked(prisma.proposal.deleteMany).mockRejectedValueOnce(dbError);

      await expect(cleanupService.cleanupExpiredProposals()).rejects.toThrow(
        'Failed to cleanup expired proposals: Database connection failed'
      );
    });

    it('should handle unknown errors gracefully', async () => {
      vi.mocked(prisma.proposal.deleteMany).mockRejectedValueOnce('Unknown error');

      await expect(cleanupService.cleanupExpiredProposals()).rejects.toThrow(
        'Failed to cleanup expired proposals: Unknown error'
      );
    });
  });

  describe('markExpiredProposals', () => {
    it('should mark pending proposals with expired buttons as expired', async () => {
      const mockResult = { count: 2 };

      vi.mocked(prisma.proposal.updateMany).mockResolvedValueOnce(mockResult);

      const result = await cleanupService.markExpiredProposals();

      expect(result).toBe(2);
      expect(prisma.proposal.updateMany).toHaveBeenCalledTimes(1);
      
      const call = vi.mocked(prisma.proposal.updateMany).mock.calls[0]?.[0];
      expect(call).toBeDefined();
      if (call && 'where' in call && 'data' in call) {
        expect(call.where.status).toBe('pending');
        if ('buttonExpiresAt' in call.where && call.where.buttonExpiresAt && typeof call.where.buttonExpiresAt === 'object' && 'lt' in call.where.buttonExpiresAt) {
          expect(call.where.buttonExpiresAt.lt).toBeInstanceOf(Date);
        }
        expect(call.data.status).toBe('expired');
      }
    });

    it('should return 0 when no proposals to mark as expired', async () => {
      const mockResult = { count: 0 };

      vi.mocked(prisma.proposal.updateMany).mockResolvedValueOnce(mockResult);

      const result = await cleanupService.markExpiredProposals();

      expect(result).toBe(0);
    });

    it('should use correct date calculation (15 minutes ago)', async () => {
      const mockResult = { count: 1 };

      vi.mocked(prisma.proposal.updateMany).mockResolvedValueOnce(mockResult);

      await cleanupService.markExpiredProposals();

      const call = vi.mocked(prisma.proposal.updateMany).mock.calls[0]?.[0];
      expect(call).toBeDefined();
      
      if (call && 'where' in call && 'buttonExpiresAt' in call.where) {
        const buttonExpiresAtFilter = call.where.buttonExpiresAt;
        if (buttonExpiresAtFilter && typeof buttonExpiresAtFilter === 'object' && 'lt' in buttonExpiresAtFilter && buttonExpiresAtFilter.lt instanceof Date) {
          const fifteenMinutesAgo = buttonExpiresAtFilter.lt;
          const expectedDate = new Date(Date.now() - 15 * 60 * 1000);
          
          // Allow 1 second tolerance for test execution time
          const timeDiff = Math.abs(fifteenMinutesAgo.getTime() - expectedDate.getTime());
          expect(timeDiff).toBeLessThan(1000);
          
          // Verify it's approximately 15 minutes ago
          const minutesDiff = (Date.now() - fifteenMinutesAgo.getTime()) / (60 * 1000);
          expect(minutesDiff).toBeGreaterThan(14.9);
          expect(minutesDiff).toBeLessThan(15.1);
        }
      }
    });

    it('should handle database errors and throw with descriptive message', async () => {
      const dbError = new Error('Database query failed');
      vi.mocked(prisma.proposal.updateMany).mockRejectedValueOnce(dbError);

      await expect(cleanupService.markExpiredProposals()).rejects.toThrow(
        'Failed to mark expired proposals: Database query failed'
      );
    });

    it('should handle unknown errors gracefully', async () => {
      vi.mocked(prisma.proposal.updateMany).mockRejectedValueOnce(null);

      await expect(cleanupService.markExpiredProposals()).rejects.toThrow(
        'Failed to mark expired proposals: Unknown error'
      );
    });

    it('should only update pending proposals', async () => {
      const mockResult = { count: 1 };

      vi.mocked(prisma.proposal.updateMany).mockResolvedValueOnce(mockResult);

      await cleanupService.markExpiredProposals();

      const call = vi.mocked(prisma.proposal.updateMany).mock.calls[0]?.[0];
      expect(call).toBeDefined();
      if (call && 'where' in call) {
        expect(call.where.status).toBe('pending');
        // Should not update declined or expired proposals
        expect(call.where.status).not.toBe('declined');
        expect(call.where.status).not.toBe('expired');
      }
    });
  });
});


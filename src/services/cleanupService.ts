import prisma from '../database/prisma.js';

/**
 * Cleanup Service
 * Removes expired and declined proposals after 7 days
 */
class CleanupService {
  /**
   * Clean up expired and declined proposals older than 7 days
   * @returns Number of proposals cleaned up
   * @throws Error if database operation fails
   */
  public async cleanupExpiredProposals(): Promise<number> {
    try {
      // Use millisecond-based calculation to handle month boundaries correctly
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // Delete declined proposals older than 7 days
      const declinedResult = await prisma.proposal.deleteMany({
        where: {
          status: 'declined',
          createdAt: {
            lt: sevenDaysAgo,
          },
        },
      });

      // Delete expired proposals (button expired) older than 7 days
      const expiredResult = await prisma.proposal.deleteMany({
        where: {
          status: 'expired',
          createdAt: {
            lt: sevenDaysAgo,
          },
        },
      });

      const totalCleaned = declinedResult.count + expiredResult.count;

      if (totalCleaned > 0) {
        console.log(
          `🧹 Cleaned up ${totalCleaned} expired/declined proposals`
        );
      }

      return totalCleaned;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Failed to cleanup expired proposals:', errorMessage);
      throw new Error(`Failed to cleanup expired proposals: ${errorMessage}`);
    }
  }

  /**
   * Mark proposals as expired if buttons have expired (15 minutes)
   * This should be called periodically to update proposal status
   * @returns Number of proposals marked as expired
   * @throws Error if database operation fails
   */
  public async markExpiredProposals(): Promise<number> {
    try {
      // Use millisecond-based calculation to handle edge cases correctly
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

      const result = await prisma.proposal.updateMany({
        where: {
          status: 'pending',
          buttonExpiresAt: {
            lt: fifteenMinutesAgo,
          },
        },
        data: {
          status: 'expired',
        },
      });

      if (result.count > 0) {
        console.log(
          `⏰ Marked ${result.count} proposals as expired`
        );
      }

      return result.count;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Failed to mark expired proposals:', errorMessage);
      throw new Error(`Failed to mark expired proposals: ${errorMessage}`);
    }
  }
}

// Export singleton instance
export const cleanupService = new CleanupService();


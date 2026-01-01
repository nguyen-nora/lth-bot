import prisma from '../database/prisma.js';
import { isRateLimitEnabled } from '../config/env.js';

/**
 * Rate Limiter Service
 * Tracks and enforces proposal rate limits (1 proposal per hour per user per guild)
 * Can be disabled via RATE_LIMIT environment variable
 */
class RateLimiterService {
  /**
   * Check if user can make a proposal (rate limit check)
   * @param userId User ID
   * @param guildId Guild ID
   * @returns true if user can propose, false if rate limited
   */
  public async checkRateLimit(
    userId: string,
    guildId: string
  ): Promise<boolean> {
    // Check if rate limiting is disabled via environment variable
    if (!isRateLimitEnabled()) {
      return true; // Rate limiting disabled, allow all proposals
    }

    const rateLimit = await prisma.proposalRateLimit.findUnique({
      where: {
        userId_guildId: {
          userId,
          guildId,
        },
      },
    });

    if (!rateLimit) {
      // No previous proposal, allow
      return true;
    }

    // Check if last proposal was more than 1 hour ago
    const lastProposalTime = rateLimit.lastProposalAt.getTime();
    const oneHourInMs = 60 * 60 * 1000; // 1 hour in milliseconds
    const oneHourAgoTimestamp = Date.now() - oneHourInMs;

    return lastProposalTime < oneHourAgoTimestamp;
  }

  /**
   * Update rate limit timestamp after successful proposal
   * @param userId User ID
   * @param guildId Guild ID
   */
  public async updateRateLimit(
    userId: string,
    guildId: string
  ): Promise<void> {
    // Skip updating rate limit if rate limiting is disabled
    if (!isRateLimitEnabled()) {
      return;
    }

    await prisma.proposalRateLimit.upsert({
      where: {
        userId_guildId: {
          userId,
          guildId,
        },
      },
      update: {
        lastProposalAt: new Date(),
      },
      create: {
        userId,
        guildId,
        lastProposalAt: new Date(),
      },
    });
  }

  /**
   * Get time until user can propose again (in minutes)
   * @param userId User ID
   * @param guildId Guild ID
   * @returns Minutes until next proposal allowed, or 0 if can propose now
   */
  public async getTimeUntilNextProposal(
    userId: string,
    guildId: string
  ): Promise<number> {
    // If rate limiting is disabled, always return 0 (can propose now)
    if (!isRateLimitEnabled()) {
      return 0;
    }

    const rateLimit = await prisma.proposalRateLimit.findUnique({
      where: {
        userId_guildId: {
          userId,
          guildId,
        },
      },
    });

    if (!rateLimit) {
      return 0;
    }

    const lastProposalTime = rateLimit.lastProposalAt.getTime();
    const oneHourInMs = 60 * 60 * 1000;
    const timeUntilAllowed = lastProposalTime + oneHourInMs - Date.now();

    if (timeUntilAllowed <= 0) {
      return 0;
    }

    return Math.ceil(timeUntilAllowed / (60 * 1000)); // Convert to minutes
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiterService();


import prisma from '../database/prisma.js';
import { User, EmbedBuilder } from 'discord.js';
import { attendanceService } from './attendanceService.js';
import { translationService } from './translationService.js';

/**
 * User Status Interface
 * Represents all status information for a user
 */
export interface UserStatus {
  userId: string;
  guildId: string;
  marriage: {
    isMarried: boolean;
    partnerId: string | null;
    partnerName: string | null;
    marriedAt: Date | null;
    channelId: string | null;
  } | null;
  proposals: {
    sent: {
      total: number;
      pending: number;
      accepted: number;
      declined: number;
    };
    received: {
      total: number;
      pending: number;
      accepted: number;
      declined: number;
    };
  };
  attendance: {
    totalDays: number;
    lastAttendanceDate: Date | null;
  } | null;
}

/**
 * Status Service
 * Aggregates user status information from database
 */
class StatusService {
  /**
   * Get user status information
   * @param userId User ID to get status for
   * @param guildId Guild ID
   * @returns UserStatus object with all status information
   * @throws Error if database query fails
   */
  public async getUserStatus(
    userId: string,
    guildId: string
  ): Promise<UserStatus> {
    try {
      // Query marriage data
      const marriage = await prisma.marriage.findFirst({
        where: {
          guildId,
          OR: [{ user1Id: userId }, { user2Id: userId }],
        },
      });

      // Query proposal statistics - sent proposals
      const sentTotal = await prisma.proposal.count({
        where: {
          proposerId: userId,
          guildId,
        },
      });

      const sentPending = await prisma.proposal.count({
        where: {
          proposerId: userId,
          guildId,
          status: 'pending',
        },
      });

      const sentAccepted = await prisma.proposal.count({
        where: {
          proposerId: userId,
          guildId,
          status: 'accepted',
        },
      });

      const sentDeclined = await prisma.proposal.count({
        where: {
          proposerId: userId,
          guildId,
          status: 'declined',
        },
      });

      // Query proposal statistics - received proposals
      const receivedTotal = await prisma.proposal.count({
        where: {
          proposedId: userId,
          guildId,
        },
      });

      const receivedPending = await prisma.proposal.count({
        where: {
          proposedId: userId,
          guildId,
          status: 'pending',
        },
      });

      const receivedAccepted = await prisma.proposal.count({
        where: {
          proposedId: userId,
          guildId,
          status: 'accepted',
        },
      });

      const receivedDeclined = await prisma.proposal.count({
        where: {
          proposedId: userId,
          guildId,
          status: 'declined',
        },
      });

      // Query attendance statistics
      let attendanceStats = null;
      try {
        attendanceStats = await attendanceService.getUserAttendanceStats(
          userId,
          guildId
        );
      } catch (error) {
        // If attendance query fails, continue without attendance data
        console.warn(`Failed to fetch attendance stats for user ${userId}:`, error);
      }

      // Build UserStatus object
      const status: UserStatus = {
        userId,
        guildId,
        marriage: marriage
          ? {
              isMarried: true,
              partnerId:
                marriage.user1Id === userId
                  ? marriage.user2Id
                  : marriage.user1Id,
              partnerName: null, // Will be resolved when formatting embed
              marriedAt: marriage.marriedAt,
              channelId: marriage.channelId,
            }
          : null,
        proposals: {
          sent: {
            total: sentTotal,
            pending: sentPending,
            accepted: sentAccepted,
            declined: sentDeclined,
          },
          received: {
            total: receivedTotal,
            pending: receivedPending,
            accepted: receivedAccepted,
            declined: receivedDeclined,
          },
        },
        attendance: attendanceStats,
      };

      return status;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : translationService.t('common.unknownError');
      throw new Error(
        translationService.t('errors.failedToFetchStatus', { error: errorMessage })
      );
    }
  }

  /**
   * Format status as Discord embed
   * @param status UserStatus object
   * @param user Discord User object (for display name/avatar)
   * @param guildName Guild name for footer
   * @returns EmbedBuilder ready to send
   * @throws Error if embed creation fails
   */
  public formatStatusEmbed(
    status: UserStatus,
    user: User,
    guildName: string
  ): EmbedBuilder {
    try {
      const embed = new EmbedBuilder()
        .setTitle(translationService.t('status.title', { name: user.displayName || user.username }))
        .setColor(0xff69b4) // Pink to match marriage theme
        .setThumbnail(user.displayAvatarURL())
        .setTimestamp()
        .setFooter({ text: guildName });

      // Marriage Status field
      if (status.marriage && status.marriage.isMarried) {
        embed.addFields({
          name: translationService.t('status.marriageStatus'),
          value: translationService.t('status.marriedTo', { partnerId: status.marriage.partnerId }),
          inline: true,
        });

        // Married Date field
        if (status.marriage.marriedAt) {
          const marriedDate = new Date(status.marriage.marriedAt);
          const formattedDate = this.formatDate(marriedDate);
          embed.addFields({
            name: translationService.t('status.marriedDate'),
            value: formattedDate,
            inline: true,
          });
        }
      } else {
        embed.addFields({
          name: translationService.t('status.marriageStatus'),
          value: translationService.t('status.notMarried'),
          inline: true,
        });
      }

      // Proposal statistics removed per user request

      // Attendance Statistics field
      if (status.attendance) {
        const daysText = status.attendance.totalDays === 1
          ? `${status.attendance.totalDays} ${translationService.t('status.day')}`
          : `${status.attendance.totalDays} ${translationService.t('status.days')}`;
        embed.addFields({
          name: translationService.t('status.totalDaysAttended'),
          value: daysText,
          inline: true,
        });

        if (status.attendance.lastAttendanceDate) {
          const lastDate = new Date(status.attendance.lastAttendanceDate);
          const formattedDate = this.formatDate(lastDate);
          embed.addFields({
            name: translationService.t('status.lastAttendance'),
            value: formattedDate,
            inline: true,
          });
        } else {
          embed.addFields({
            name: translationService.t('status.lastAttendance'),
            value: translationService.t('status.never'),
            inline: true,
          });
        }
      } else {
        embed.addFields({
          name: translationService.t('status.attendance'),
          value: translationService.t('status.noAttendanceRecords'),
          inline: true,
        });
      }

      return embed;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : translationService.t('common.unknownError');
      throw new Error(translationService.t('errors.failedToFormatEmbed', { error: errorMessage }));
    }
  }

  /**
   * Format date in user-friendly way
   * @param date Date to format
   * @returns Formatted date string
   */
  private formatDate(date: Date): string {
    try {
      // Use Vietnamese date formatting from translation service
      return translationService.formatDateVietnamese(date);
    } catch (error) {
      return 'N/A';
    }
  }
}

// Export singleton instance
export const statusService = new StatusService();


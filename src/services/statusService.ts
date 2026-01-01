import prisma from '../database/prisma.js';
import { User, EmbedBuilder, GuildMember, Client } from 'discord.js';
import { attendanceService } from './attendanceService.js';
import { translationService } from './translationService.js';
import { formatEmoji, formatEmojiFromClient, formatEmojiFromGuildByName } from '../utils/emojis.js';

// Server ID for emoji lookup
const SERVER_ID = '1449180531777339563';

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
   * @param member Optional GuildMember object (for join date)
   * @param client Optional Discord client (for emoji access)
   * @returns EmbedBuilder ready to send
   * @throws Error if embed creation fails
   */
  public formatStatusEmbed(
    status: UserStatus,
    user: User,
    guildName: string,
    member?: GuildMember | null,
    client?: Client | null
  ): EmbedBuilder {
    try {
      const embed = new EmbedBuilder()
        .setTitle('Thông tin của tôi')
        .setColor(0x5865f2)
        .setThumbnail(user.displayAvatarURL({ size: 256 }))
        .setTimestamp()
        .setFooter({ 
          text: guildName
        });

      let description = '';

      // Helper function to get emoji from server
      const getServerEmoji = (emojiName: string): string => {
        if (client) {
          const emoji = formatEmojiFromGuildByName(client, SERVER_ID, emojiName);
          // Check if it's a valid emoji (starts with < and ends with >)
          if (emoji && emoji.startsWith('<') && emoji.endsWith('>')) {
            return emoji; // Valid emoji found
          }
        }
        // Fallback to text representation
        return `:${emojiName}:`;
      };

      // Join Date Section (first) - with emoji_61
      const joinEmoji = getServerEmoji('emoji_61');
      description += `${joinEmoji}  **Gia nhập LHT:**\n`;
      if (member?.joinedAt) {
        const joinDate = this.formatDateShort(member.joinedAt);
        description += `${joinDate}\n`;
      } else {
        description += 'Không xác định\n';
      }

      // Attendance Section (second) - try -1 first (as shown in image), then ~1
      const attendanceEmoji = getServerEmoji('emoji_41-1') || getServerEmoji('emoji_41~1') || getServerEmoji('emoji_41');
      description += `\n${attendanceEmoji}  **Điểm danh:**\n`;
      if (status.attendance) {
        const daysText = status.attendance.totalDays === 1
          ? `${status.attendance.totalDays} ${translationService.t('status.day')}`
          : `${status.attendance.totalDays} ${translationService.t('status.days')}`;
        
        description += `• Bang chiến: ${daysText}\n`;
        
        if (status.attendance.lastAttendanceDate) {
          const lastDate = new Date(status.attendance.lastAttendanceDate);
          const formattedDate = this.formatDateShort(lastDate);
          description += `• Lần đây nhất: ${formattedDate}\n`;
        } else {
          description += `• Lần đây nhất: ${translationService.t('status.never')}\n`;
        }
      } else {
        description += `• Bang chiến: 0 ${translationService.t('status.days')}\n`;
        description += `• Lần đây nhất: ${translationService.t('status.never')}\n`;
      }

      // Marriage Section (last, before cute message) - try -1 first (as shown in image), then ~1
      if (status.marriage && status.marriage.isMarried) {
        const partnerMention = `<@${status.marriage.partnerId}>`;
        const marriageEmoji = getServerEmoji('emoji_48-1') || getServerEmoji('emoji_48~1') || getServerEmoji('emoji_48');
        if (status.marriage.marriedAt) {
          const marriedDate = new Date(status.marriage.marriedAt);
          const formattedDate = this.formatDateShort(marriedDate);
          description += `\n${marriageEmoji} Kết hôn cùng ${partnerMention} vào ngày ${formattedDate}`;
        } else {
          description += `\n${marriageEmoji} Kết hôn cùng ${partnerMention}`;
        }
      }

      // Cute message at the end
      description += '\n\nSoo cute<333';

      embed.setDescription(description);

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

  /**
   * Format date in DD/MM/YYYY format
   * @param date Date to format
   * @returns Formatted date string in DD/MM/YYYY
   */
  private formatDateShort(date: Date): string {
    try {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      return 'N/A';
    }
  }
}

// Export singleton instance
export const statusService = new StatusService();


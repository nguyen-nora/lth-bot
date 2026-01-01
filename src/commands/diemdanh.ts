import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from 'discord.js';
import { attendanceService } from '../services/attendanceService.js';
import { translationService } from '../services/translationService.js';

/**
 * DiemDanh command - Take attendance of all users in voice channels
 */
export default {
  data: new SlashCommandBuilder()
    .setName('diemdanh')
    .setDescription(translationService.t('commands.diemdanh.description')),

  async execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild;

    if (!guild) {
      await interaction.reply({
        content: translationService.t('common.serverOnly'),
        ephemeral: true,
      });
      return;
    }

    // Defer reply to avoid interaction timeout (3 seconds)
    // This gives us up to 15 minutes to respond
    await interaction.deferReply();

    try {
      // Get all voice states in the guild
      const voiceStates = guild.voiceStates.cache;

      // Filter for users actually in voice channels (not null channel) and exclude bots
      const usersInChannels = new Map<string, string>();
      const userIdsToFetch: string[] = [];
      
      // Collect all user IDs in voice channels
      for (const [userId, voiceState] of voiceStates) {
        if (voiceState.channelId) {
          userIdsToFetch.push(userId);
        }
      }

      // Fetch all members in parallel for better performance
      if (userIdsToFetch.length > 0) {
        const memberPromises = userIdsToFetch.map(async (userId) => {
          try {
            const member = await guild.members.fetch(userId);
            return { userId, member, isBot: member.user.bot };
          } catch (error) {
            // If we can't fetch member, skip (might have left server)
            console.warn(`Could not fetch member ${userId} for attendance:`, error);
            return null;
          }
        });

        const memberResults = await Promise.all(memberPromises);
        
        for (const result of memberResults) {
          if (result && !result.isBot) {
            const voiceState = voiceStates.get(result.userId);
            if (voiceState?.channelId) {
              usersInChannels.set(result.userId, voiceState.channelId);
            }
          }
        }
      }

      // Check if there are any users in voice channels
      if (usersInChannels.size === 0) {
        await interaction.editReply({
          content: translationService.t('commands.diemdanh.noUsersInVoice'),
        });
        return;
      }

      // Record attendance
      const count = await attendanceService.recordAttendance(
        guild.id,
        usersInChannels
      );

      // Send confirmation message
      await interaction.editReply({
        content: translationService.t('commands.diemdanh.attendanceRecorded', { count }),
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : translationService.t('common.unknownError');
      console.error('Error in diemdanh command:', error);

      // Determine specific error message
      // Error messages from services are already in Vietnamese, so check for Vietnamese patterns
      let userMessage = translationService.t('commands.diemdanh.recordError');
      
      if (errorMessage.includes('quyền') || errorMessage.includes('permission') || errorMessage.includes('access')) {
        userMessage = translationService.t('commands.diemdanh.permissionError');
      } else if (errorMessage.includes('Không thể ghi danh') || errorMessage.includes('Failed to record')) {
        userMessage = translationService.t('commands.diemdanh.recordError');
      }

      // Try to edit reply (since we deferred)
      if (interaction.deferred) {
        await interaction.editReply({
          content: userMessage,
        });
      } else if (interaction.replied) {
        await interaction.followUp({
          content: userMessage,
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: userMessage,
          ephemeral: true,
        });
      }
    }
  },
};


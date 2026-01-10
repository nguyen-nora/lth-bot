import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from 'discord.js';
import { loveStreakService, EMOJI_FAILED } from '../services/loveStreakService.js';
import { translationService } from '../services/translationService.js';
import { formatEmojiFromGuildByName } from '../utils/emojis.js';

/**
 * Guild ID for emoji lookup
 */
const GUILD_ID = '1449180531777339563';

/**
 * Love command - Daily streak interaction for married couples
 * 
 * Features:
 * - Both partners must use /love daily to maintain streak
 * - Shows Streak Box with completion status
 * - Handles recovery (3 per month) for missed days
 * - Resets at 12 AM UTC+7
 */
export default {
  data: new SlashCommandBuilder()
    .setName('love')
    .setDescription('Duy trì streak tình yêu hàng ngày với đối tác'),

  async execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild;

    if (!guild) {
      await interaction.reply({
        content: translationService.t('common.serverOnly'),
        ephemeral: true,
      });
      return;
    }

    // Defer reply to prevent 3-second timeout (database operations can be slow)
    await interaction.deferReply();

    try {
      // Process the love streak
      const result = await loveStreakService.processLoveStreak(
        interaction.user.id,
        guild.id
      );

      // Format Streak Box embed
      const streakBoxEmbed = await loveStreakService.formatStreakBoxEmbed(
        result.streak,
        result.marriage,
        interaction.client
      );

      // Handle different statuses
      switch (result.status) {
        case 'first_completed': {
          // First partner completed - show Streak Box and waiting message
          await interaction.editReply({
            content: result.message,
            embeds: [streakBoxEmbed],
          });
          break;
        }

        case 'both_completed': {
          // Both completed - show success message and Streak Box
          await interaction.editReply({
            content: result.message,
            embeds: [streakBoxEmbed],
          });
          break;
        }

        case 'already_completed': {
          // User already completed - show current status
          // Note: Can't make ephemeral after deferReply, but this is fine
          await interaction.editReply({
            content: result.message,
            embeds: [streakBoxEmbed],
          });
          break;
        }

        case 'streak_recovered': {
          // Streak recovered - show warning and Streak Box
          let recoveryMessage = result.message;
          
          // Add extra warning if this is the last recovery
          if (result.isLastRecovery) {
            recoveryMessage = translationService.t('love.streakRecoveredLastChance');
          }

          await interaction.editReply({
            content: recoveryMessage,
            embeds: [streakBoxEmbed],
          });
          break;
        }

        case 'streak_lost': {
          // Streak lost - show failure message with broken heart emoji
          const failedEmoji = formatEmojiFromGuildByName(
            interaction.client,
            GUILD_ID,
            EMOJI_FAILED
          ) || '💔';

          await interaction.editReply({
            content: `${failedEmoji} ${result.message}`,
            embeds: [streakBoxEmbed],
          });
          break;
        }

        default: {
          // Unknown status - show generic response
          await interaction.editReply({
            content: result.message,
            embeds: [streakBoxEmbed],
          });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : translationService.t('common.unknownError');
      
      console.error('Error in love command:', error);

      // Check if it's a "not married" error
      const notMarriedError = translationService.t('errors.notMarried');
      if (errorMessage === notMarriedError) {
        await interaction.editReply({
          content: translationService.t('love.notMarriedHint'),
        });
        return;
      }

      await interaction.editReply({
        content: `❌ ${errorMessage}`,
      });
    }
  },
};

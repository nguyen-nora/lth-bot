import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from 'discord.js';
import { marriageService } from '../services/marriageService.js';
import { translationService } from '../services/translationService.js';

/**
 * Lyhon command - Divorce (end marriage)
 */
export default {
  data: new SlashCommandBuilder()
    .setName('lyhon')
    .setDescription(translationService.t('commands.lyhon.description')),

  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.user;
    const guild = interaction.guild;

    if (!guild) {
      await interaction.reply({
        content: translationService.t('common.serverOnly'),
        ephemeral: true,
      });
      return;
    }

    try {
      // Execute divorce (unilateral by default)
      await marriageService.divorce(user.id, guild.id, false);

      await interaction.reply({
        content: translationService.t('commands.lyhon.marriageDissolved'),
        ephemeral: true,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : translationService.t('common.unknownError');
      
      // Check if this is a validation error (expected) or an actual error
      const isValidationError = 
        errorMessage.includes('not currently married') ||
        errorMessage.includes('not currently married') ||
        errorMessage.includes('không kết hôn');

      if (isValidationError) {
        // Validation errors are expected - log as info, not error
        console.log(`ℹ️  Validation in lyhon command: ${errorMessage}`);
      } else {
        // Actual errors - log as error
        console.error('❌ Error in lyhon command:', error);
      }

      // Error messages from services are already translated, so use as-is
      await interaction.reply({
        content: errorMessage,
        ephemeral: true,
      });
    }
  },
};


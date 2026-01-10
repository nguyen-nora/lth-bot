import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from 'discord.js';
import { helpService } from '../services/helpService.js';
import { translationService } from '../services/translationService.js';

/**
 * Help command - Display all available commands
 */
export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription(translationService.t('commands.help.description')),

  async execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild;
    const user = interaction.user;

    if (!guild) {
      await interaction.reply({
        content: translationService.t('common.serverOnly'),
        ephemeral: true,
      });
      return;
    }

    try {
      // Generate help embed
      const embed = await helpService.generateHelpEmbed(
        interaction.client,
        user.id,
        guild
      );

      // Send ephemeral response
      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    } catch (error) {
      console.error('Error in help command:', error);
      
      // Check if already replied before sending error
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: translationService.t('errors.commandExecutionError'),
          ephemeral: true,
        });
      }
    }
  },
};


import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from 'discord.js';
import { translationService } from '../services/translationService.js';

/**
 * Ping command - Simple command to test bot responsiveness
 * Responds with "Pong!" and optionally includes latency information
 */
export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription(translationService.t('commands.ping.description')),

  async execute(interaction: ChatInputCommandInteraction) {
    // Calculate latency (time between command creation and now)
    const latency = Date.now() - interaction.createdTimestamp;

    await interaction.reply({
      content: translationService.t('commands.ping.response', { latency }),
    });
  },
};


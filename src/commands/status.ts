import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from 'discord.js';
import { statusService } from '../services/statusService.js';
import { translationService } from '../services/translationService.js';

/**
 * Status command - Check user status and marriage information
 */
export default {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription(translationService.t('commands.status.description'))
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription(translationService.t('commands.status.optionUser'))
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild;

      if (!guild) {
      await interaction.reply({
        content: translationService.t('common.serverOnly'),
        ephemeral: false,
      });
      return;
    }

    try {
      // Get user from parameter or default to self
      const targetUser = interaction.options.getUser('user') || interaction.user;

      // Validate user is in server (for @user parameter)
      if (targetUser.id !== interaction.user.id) {
        const member = await guild.members.fetch(targetUser.id).catch(() => null);
        if (!member) {
          await interaction.reply({
            content: translationService.t('commands.status.userNotFound'),
            ephemeral: false,
          });
          return;
        }
      }

      // Fetch Discord user object for display
      const user = await interaction.client.users.fetch(targetUser.id);

      // Fetch guild member for join date
      const member = await guild.members.fetch(targetUser.id).catch(() => null);

      // Get user status from service
      const status = await statusService.getUserStatus(
        targetUser.id,
        guild.id
      );

      // Format embed (pass client for emoji access)
      const { embed, attachment } = await statusService.formatStatusEmbed(
        status,
        user,
        guild.name,
        member,
        interaction.client
      );

      // Send response visible to all (with attachment if exists)
      await interaction.reply({
        embeds: [embed],
        files: attachment ? [attachment] : [],
        ephemeral: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : translationService.t('common.unknownError');
      console.error('Error in status command:', error);

      // Determine specific error message
      // Error messages from services are already in Vietnamese, so check for Vietnamese patterns
      let userMessage = translationService.t('commands.status.fetchError');
      
      if (errorMessage.includes('Không tìm thấy người dùng') || errorMessage.includes('not found') || errorMessage.includes('not in')) {
        userMessage = translationService.t('commands.status.userNotFound');
      } else if (errorMessage.includes('Người dùng không hợp lệ') || errorMessage.includes('Invalid user')) {
        userMessage = translationService.t('commands.status.invalidUser');
      } else if (errorMessage.includes('Không thể lấy') || errorMessage.includes('Failed to fetch')) {
        userMessage = translationService.t('commands.status.fetchError');
      }

      // Try to reply (handle case where interaction already replied)
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: userMessage,
          ephemeral: false,
        });
      } else {
        await interaction.reply({
          content: userMessage,
          ephemeral: false,
        });
      }
    }
  },
};


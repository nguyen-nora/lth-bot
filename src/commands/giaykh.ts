import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from 'discord.js';
import { marriageService } from '../services/marriageService.js';
import { translationService } from '../services/translationService.js';

/**
 * Giaykh command - View marriage certificate
 */
export default {
  data: new SlashCommandBuilder()
    .setName('giaykh')
    .setDescription('Xem giấy kết hôn')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('Xem giấy kết hôn của người dùng khác')
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild;

    if (!guild) {
      await interaction.reply({
        content: translationService.t('common.serverOnly'),
        ephemeral: true,
      });
      return;
    }

    try {
      // Get target user (self or specified user)
      const targetUser = interaction.options.getUser('user') || interaction.user;

      // Get marriage with certificate
      const result = await marriageService.getMarriageWithCertificate(targetUser.id, guild.id);

      if (!result) {
        const message = targetUser.id === interaction.user.id
          ? '❌ Bạn chưa kết hôn. Sử dụng `/kethon @user` để cầu hôn!'
          : `❌ ${targetUser.displayName} chưa kết hôn.`;
        
        await interaction.reply({
          content: message,
          ephemeral: true,
        });
        return;
      }

      const { marriage, certificate } = result;

      // Fetch user objects for display names
      const user1 = await interaction.client.users.fetch(marriage.user1_id);
      const user2 = await interaction.client.users.fetch(marriage.user2_id);

      // Format certificate embed
      const { embed, attachment } = await marriageService.formatCertificateEmbed(
        marriage,
        certificate,
        user1.displayName,
        user2.displayName
      );

      // Send response
      await interaction.reply({
        embeds: [embed],
        files: attachment ? [attachment] : [],
        ephemeral: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : translationService.t('common.unknownError');
      console.error('Error in giaykh command:', error);

      await interaction.reply({
        content: `❌ ${errorMessage}`,
        ephemeral: true,
      });
    }
  },
};

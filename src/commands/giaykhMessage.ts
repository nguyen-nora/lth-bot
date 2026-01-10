import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from 'discord.js';
import { marriageService } from '../services/marriageService.js';
import { translationService } from '../services/translationService.js';

/**
 * Giaykh Message command - Set personal message on marriage certificate
 */
export default {
  data: new SlashCommandBuilder()
    .setName('giaykh-message')
    .setDescription('Đặt lời nhắn cá nhân trên giấy kết hôn')
    .addStringOption((option) =>
      option
        .setName('message')
        .setDescription('Lời nhắn của bạn (tối đa 500 ký tự)')
        .setRequired(true)
        .setMaxLength(500)
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
      const message = interaction.options.getString('message', true);

      // Check if user is married
      const marriage = await marriageService.getMarriage(interaction.user.id, guild.id);

      if (!marriage) {
        await interaction.reply({
          content: '❌ Bạn chưa kết hôn. Sử dụng `/kethon @user` để cầu hôn!',
          ephemeral: true,
        });
        return;
      }

      // Set user message
      await marriageService.setUserMessage(marriage.id, interaction.user.id, message);

      await interaction.reply({
        content: '✅ Đã cập nhật lời nhắn của bạn trên giấy kết hôn! Sử dụng `/giaykh` để xem.',
        ephemeral: true,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : translationService.t('common.unknownError');
      console.error('Error in giaykh-message command:', error);

      await interaction.reply({
        content: `❌ ${errorMessage}`,
        ephemeral: true,
      });
    }
  },
};

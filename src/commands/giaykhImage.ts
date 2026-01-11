import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from 'discord.js';
import { marriageService } from '../services/marriageService.js';
import { imageService } from '../services/imageService.js';
import { translationService } from '../services/translationService.js';

/**
 * Giaykh Image command - Upload custom certificate image
 */
export default {
  data: new SlashCommandBuilder()
    .setName('giaykh-image')
    .setDescription('Tải lên ảnh tùy chỉnh cho giấy kết hôn')
    .addAttachmentOption((option) =>
      option
        .setName('image')
        .setDescription('Ảnh để hiển thị (JPG, PNG, GIF, WebP - tối đa 8MB)')
        .setRequired(true)
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

    // Defer reply since image processing may take time
    await interaction.deferReply({ ephemeral: true });

    try {
      // Check if user is married
      const marriage = await marriageService.getMarriage(interaction.user.id, guild.id);

      if (!marriage) {
        await interaction.editReply({
          content: '❌ Bạn chưa kết hôn. Sử dụng `/kethon @user` để cầu hôn!',
        });
        return;
      }

      const attachment = interaction.options.getAttachment('image', true);

      // Validate image
      imageService.validateImage(attachment);

      // Process image (download, cropping temporarily disabled)
      const processedBuffer = await imageService.processImage(attachment);

      // Save to storage (preserve original extension)
      const imagePath = await imageService.saveToStorage(processedBuffer, 'certificates', attachment.name);

      // Update certificate with new image path (pass userId for authorization)
      await marriageService.setCertificateImage(marriage.id, interaction.user.id, imagePath);

      await interaction.editReply({
        content: '✅ Đã cập nhật ảnh giấy kết hôn! Sử dụng `/giaykh` để xem.',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : translationService.t('common.unknownError');
      console.error('Error in giaykh-image command:', error);

      await interaction.editReply({
        content: `❌ ${errorMessage}`,
      });
    }
  },
};

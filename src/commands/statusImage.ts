import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from 'discord.js';
import { profileService } from '../services/profileService.js';
import { imageService } from '../services/imageService.js';
import { translationService } from '../services/translationService.js';

/**
 * Status Image command - Upload custom status image
 */
export default {
  data: new SlashCommandBuilder()
    .setName('status-image')
    .setDescription('Tải lên ảnh tùy chỉnh cho hồ sơ của bạn')
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
      const attachment = interaction.options.getAttachment('image', true);

      // Validate image
      imageService.validateImage(attachment);

      // Process image (download, cropping temporarily disabled)
      const processedBuffer = await imageService.processImage(attachment);

      // Save to storage (preserve original extension)
      const imagePath = await imageService.saveToStorage(processedBuffer, 'status', attachment.name);

      // Update profile with new image path
      await profileService.setStatusImage(interaction.user.id, guild.id, imagePath);

      await interaction.editReply({
        content: '✅ Đã cập nhật ảnh hồ sơ của bạn! Sử dụng `/status` để xem.',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : translationService.t('common.unknownError');
      console.error('Error in status-image command:', error);

      await interaction.editReply({
        content: `❌ ${errorMessage}`,
      });
    }
  },
};

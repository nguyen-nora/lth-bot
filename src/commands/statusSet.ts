import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from 'discord.js';
import { profileService, RELATIONSHIP_STATUSES, RelationshipStatus, STATUS_TRANSLATIONS } from '../services/profileService.js';
import { translationService } from '../services/translationService.js';

/**
 * Status Set command - Set relationship status
 */
export default {
  data: new SlashCommandBuilder()
    .setName('status-set')
    .setDescription('Đặt trạng thái tình cảm của bạn')
    .addStringOption((option) =>
      option
        .setName('status')
        .setDescription('Trạng thái tình cảm')
        .setRequired(true)
        .addChoices(
          { name: '💔 Độc thân', value: 'single' },
          { name: '🤔 Mập mờ', value: 'complicated' },
          { name: '💍 Đã kết hôn', value: 'married' },
          { name: '💕 Đang hẹn hò', value: 'dating' }
        )
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
      const status = interaction.options.getString('status', true) as RelationshipStatus;

      // Validate status
      if (!RELATIONSHIP_STATUSES.includes(status)) {
        await interaction.reply({
          content: translationService.t('errors.invalidStatus', {
            validStatuses: RELATIONSHIP_STATUSES.join(', '),
          }),
          ephemeral: true,
        });
        return;
      }

      // Update profile status
      await profileService.setStatus(interaction.user.id, guild.id, status);

      // Get translated status for response
      const translatedStatus = STATUS_TRANSLATIONS[status];

      await interaction.reply({
        content: `✅ Đã cập nhật trạng thái của bạn thành: **${translatedStatus}**`,
        ephemeral: true,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : translationService.t('common.unknownError');
      console.error('Error in status-set command:', error);

      await interaction.reply({
        content: `❌ ${errorMessage}`,
        ephemeral: true,
      });
    }
  },
};

import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { attendanceService } from '../services/attendanceService.js';
import { translationService } from '../services/translationService.js';

/**
 * CheckDD command - Check attendance records for a specific date
 */
export default {
  data: new SlashCommandBuilder()
    .setName('checkdd')
    .setDescription(translationService.t('commands.checkdd.description'))
    .addStringOption((option) =>
      option
        .setName('date')
        .setDescription(translationService.t('commands.checkdd.optionDate'))
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
      // Get date parameter or default to today (UTC)
      let dateParam = interaction.options.getString('date');
      
      // If no date provided, use today in UTC
      if (!dateParam) {
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = String(now.getUTCMonth() + 1).padStart(2, '0');
        const day = String(now.getUTCDate()).padStart(2, '0');
        dateParam = `${year}-${month}-${day}`;
      }

      // Get attendance records for the date
      const records = await attendanceService.getAttendanceByDate(
        guild.id,
        dateParam
      );

      // Check if no records found
      if (records.length === 0) {
        await interaction.reply({
          content: translationService.t('commands.checkdd.noRecords', { date: dateParam }),
          ephemeral: false,
        });
        return;
      }

      // Group records by time (HH:MM:SS)
      const recordsByTime = new Map<string, Array<{ userId: string; channelId: string; channelName: string }>>();
      const channelMap = new Map<string, string>();

      // First, fetch all channel names
      const uniqueChannelIds = [...new Set(records.map(r => r.channelId))];
      for (const channelId of uniqueChannelIds) {
        if (!channelMap.has(channelId)) {
          try {
            const channel = await guild.channels.fetch(channelId);
            channelMap.set(channelId, channel?.name || translationService.t('commands.checkdd.unknownChannel'));
          } catch {
            channelMap.set(channelId, translationService.t('commands.checkdd.unknownChannel'));
          }
        }
      }

      // Group records by time
      for (const record of records) {
        const recordedDate = new Date(record.recordedAt);
        const hours = String(recordedDate.getUTCHours()).padStart(2, '0');
        const minutes = String(recordedDate.getUTCMinutes()).padStart(2, '0');
        const seconds = String(recordedDate.getUTCSeconds()).padStart(2, '0');
        const timeString = `${hours}:${minutes}:${seconds}`;

        const channelName = channelMap.get(record.channelId) || translationService.t('commands.checkdd.unknownChannel');
        
        if (!recordsByTime.has(timeString)) {
          recordsByTime.set(timeString, []);
        }
        
        recordsByTime.get(timeString)!.push({
          userId: record.userId,
          channelId: record.channelId,
          channelName: channelName,
        });
      }

      // Create embed
      const embed = new EmbedBuilder()
        .setTitle(translationService.t('commands.checkdd.attendanceFor', { date: dateParam }))
        .setColor(0x00ae86) // Teal color
        .setTimestamp()
        .setFooter({ text: guild.name });

      // Sort times and add fields for each time group
      const sortedTimes = Array.from(recordsByTime.keys()).sort();
      const maxFieldLength = 1024;

      for (const timeString of sortedTimes) {
        const timeRecords = recordsByTime.get(timeString)!;
        let fieldValue = '';

        for (const record of timeRecords) {
          const userMention = `<@${record.userId}>`;
          const entry = `${userMention} (${record.channelName})\n`;
          
          // Check if adding this entry would exceed the limit
          if (fieldValue.length + entry.length > maxFieldLength) {
            // If field already has content, add it and start a new field for the same time
            if (fieldValue.trim()) {
              embed.addFields({
                name: `🕐 ${timeString}`,
                value: fieldValue.trim(),
                inline: false,
              });
              fieldValue = entry;
            } else {
              // Entry itself is too long, truncate
              fieldValue += entry.substring(0, maxFieldLength - fieldValue.length - 3) + '...';
              break;
            }
          } else {
            fieldValue += entry;
          }
        }

        // Add remaining content for this time
        if (fieldValue.trim()) {
          embed.addFields({
            name: `🕐 ${timeString}`,
            value: fieldValue.trim(),
            inline: false,
          });
        }
      }

      // Send embed
      await interaction.reply({
        embeds: [embed],
        ephemeral: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : translationService.t('common.unknownError');
      console.error('Error in checkdd command:', error);

      // Determine specific error message
      // Error messages from services are already in Vietnamese, so check for Vietnamese patterns
      let userMessage = translationService.t('commands.checkdd.fetchError');
      
      if (errorMessage.includes('Định dạng ngày không hợp lệ') || errorMessage.includes('Invalid date format')) {
        userMessage = translationService.t('commands.checkdd.invalidDateFormat');
      } else if (errorMessage.includes('ngày trong tương lai') || errorMessage.includes('future date')) {
        userMessage = translationService.t('commands.checkdd.futureDate');
      } else if (errorMessage.includes('Không tìm thấy bản ghi điểm danh') || errorMessage.includes('No attendance records')) {
        userMessage = errorMessage; // Use the exact message from service
      }

      // Try to reply (handle case where interaction already replied)
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: userMessage,
          ephemeral: true,
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


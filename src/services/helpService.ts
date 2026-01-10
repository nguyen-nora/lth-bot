import { Client, EmbedBuilder } from 'discord.js';
import { Command } from '../utils/loadCommands.js';
import { translationService } from './translationService.js';

/**
 * Command categories for organized help display
 */
const COMMAND_CATEGORIES: Record<string, string[]> = {
  '💍 Hôn nhân': ['kethon', 'lyhon', 'giaykh', 'giaykh-message', 'giaykh-image'],
  '👤 Hồ sơ': ['status', 'status-set', 'status-image'],
  '📋 Điểm danh (Admin)': ['diemdanh', 'checkdd'],
  '🔧 Tiện ích': ['help', 'ping'],
};

/**
 * Help Service
 * Generates help command embeds and organizes commands by permission tier
 */
class HelpService {
  /**
   * Generate help embed for a user
   * @param client Discord client (to access command registry)
   * @param userId User ID to check permissions for
   * @param guild Guild where command was executed (null for DMs)
   * @returns EmbedBuilder with help information
   */
  public async generateHelpEmbed(
    client: Client,
    _userId: string,
    _guild: unknown
  ): Promise<EmbedBuilder> {
    const embed = new EmbedBuilder()
      .setTitle(translationService.t('commands.help.title'))
      .setDescription(translationService.t('commands.help.descriptionText'))
      .setColor(0x5865f2) // Discord blurple
      .setTimestamp();

    // Get all commands
    const commands = client.commands;
    const commandMap = new Map<string, Command>();
    
    for (const [name, command] of commands) {
      commandMap.set(name, command);
    }

    // Add commands by category
    for (const [categoryName, categoryCommands] of Object.entries(COMMAND_CATEGORIES)) {
      const commandList: string[] = [];
      
      for (const cmdName of categoryCommands) {
        const command = commandMap.get(cmdName);
        if (command) {
          const description = translationService.t(`commands.${cmdName}.description`) || command.data.description;
          commandList.push(`\`/${cmdName}\` - ${description}`);
        }
      }
      
      if (commandList.length > 0) {
        embed.addFields({
          name: categoryName,
          value: commandList.join('\n'),
          inline: false,
        });
      }
    }

    // Add any uncategorized commands
    const categorizedCommands = new Set(Object.values(COMMAND_CATEGORIES).flat());
    const uncategorizedList: string[] = [];
    
    for (const [name, command] of commands) {
      if (!categorizedCommands.has(name)) {
        const description = translationService.t(`commands.${name}.description`) || command.data.description;
        uncategorizedList.push(`\`/${name}\` - ${description}`);
      }
    }
    
    if (uncategorizedList.length > 0) {
      embed.addFields({
        name: '📦 Khác',
        value: uncategorizedList.join('\n'),
        inline: false,
      });
    }

    embed.setFooter({
      text: translationService.t('commands.help.footer'),
    });

    return embed;
  }
}

// Export singleton instance
export const helpService = new HelpService();


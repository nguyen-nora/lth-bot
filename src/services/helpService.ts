import { Client, EmbedBuilder } from 'discord.js';
import { Command } from '../utils/loadCommands.js';
import { PermissionTier } from './permissionService.js';
import { translationService } from './translationService.js';

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

    // Separate commands by permission tier
    const adminCommands: Command[] = [];
    const userCommands: Command[] = [];

    for (const [name, command] of commands) {
      // Determine permission tier (default to USER)
      const requiredTier = this.getCommandTier(name);
      
      if (requiredTier === PermissionTier.ADMIN) {
        adminCommands.push(command);
      } else {
        userCommands.push(command);
      }
    }

    // Add admin commands section
    if (adminCommands.length > 0) {
      const adminList = adminCommands
        .map((cmd) => {
          const cmdName = cmd.data.name;
          const description = translationService.t(`commands.${cmdName}.description`) || cmd.data.description;
          return `\`/${cmdName}\` - ${description}`;
        })
        .join('\n');

      embed.addFields({
        name: `${translationService.t('commands.help.adminCommands')} ${translationService.t('commands.help.permissionRequired')}`,
        value: adminList,
        inline: false,
      });
    }

    // Add user commands section
    if (userCommands.length > 0) {
      const userList = userCommands
        .map((cmd) => {
          const cmdName = cmd.data.name;
          const description = translationService.t(`commands.${cmdName}.description`) || cmd.data.description;
          return `\`/${cmdName}\` - ${description}`;
        })
        .join('\n');

      embed.addFields({
        name: `${translationService.t('commands.help.userCommands')} ${translationService.t('commands.help.availableToAll')}`,
        value: userList,
        inline: false,
      });
    }

    embed.setFooter({
      text: translationService.t('commands.help.footer'),
    });

    return embed;
  }

  /**
   * Get permission tier for a command
   * This should match the COMMAND_PERMISSIONS mapping in interactionCreate.ts
   * @param commandName Command name
   * @returns Permission tier required
   */
  private getCommandTier(commandName: string): PermissionTier {
    // Match the permission mapping from interactionCreate.ts
    const adminCommands = ['diemdanh', 'checkdd', 'ping'];
    
    if (adminCommands.includes(commandName)) {
      return PermissionTier.ADMIN;
    }
    
    return PermissionTier.USER;
  }
}

// Export singleton instance
export const helpService = new HelpService();


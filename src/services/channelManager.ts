import {
  Client,
  TextChannel,
  PermissionFlagsBits,
  ChannelType,
} from 'discord.js';
import prisma from '../database/prisma.js';

/**
 * Channel Manager Service
 * Creates and manages notification channels per guild for marriage announcements
 */
class ChannelManagerService {
  private client: Client | null = null;

  /**
   * Set the Discord client (required for channel operations)
   */
  public setClient(client: Client): void {
    this.client = client;
  }

  /**
   * Get or create notification channel for a guild
   * @param guildId Guild ID
   * @param channelName Optional channel name (default: "marriage-announcements")
   * @returns Channel ID
   * @throws Error if channel cannot be created or retrieved
   */
  public async getOrCreateNotificationChannel(
    guildId: string,
    channelName: string = 'marriage-announcements'
  ): Promise<string> {
    if (!this.client) {
      throw new Error('Discord client not set');
    }

    // Check if channel exists in database
    const existingChannel = await this.getNotificationChannel(guildId);
    if (existingChannel) {
      // Verify channel still exists in Discord
      try {
        const channel = await this.client.channels.fetch(existingChannel);
        if (channel && channel.isTextBased()) {
          return existingChannel;
        }
      } catch (error) {
        // Channel doesn't exist, will create new one
        console.log(
          `Channel ${existingChannel} not found, will create new one`
        );
      }
    }

    // Get guild
    const guild = await this.client.guilds.fetch(guildId);
    if (!guild) {
      throw new Error(`Guild ${guildId} not found`);
    }

    // Check if channel with same name already exists
    const existingChannels = guild.channels.cache.filter(
      (channel) =>
        channel.name === channelName &&
        channel.type === ChannelType.GuildText
    );

    if (existingChannels.size > 0) {
      const channel = existingChannels.first() as TextChannel;
      // Save to database
      await this.saveNotificationChannel(guildId, channel.id);
      return channel.id;
    }

    // Create new channel
    try {
      const channel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.SendMessages],
            allow: [PermissionFlagsBits.ViewChannel],
          },
        ],
        reason: 'Auto-created for marriage announcements',
      });

      // Save to database
      await this.saveNotificationChannel(guildId, channel.id);
      console.log(
        `✅ Created notification channel: ${channelName} (${channel.id})`
      );

      return channel.id;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(
        `Failed to create notification channel: ${errorMessage}`
      );
    }
  }

  /**
   * Get notification channel ID for a guild
   * @param guildId Guild ID
   * @returns Channel ID or null if not found
   */
  public async getNotificationChannel(
    guildId: string
  ): Promise<string | null> {
    const channel = await prisma.notificationChannel.findUnique({
      where: { guildId },
    });

    return channel?.channelId || null;
  }

  /**
   * Save notification channel ID to database
   * @param guildId Guild ID
   * @param channelId Channel ID
   */
  private async saveNotificationChannel(
    guildId: string,
    channelId: string
  ): Promise<void> {
    await prisma.notificationChannel.upsert({
      where: { guildId },
      update: { channelId },
      create: { guildId, channelId },
    });
  }
}

// Export singleton instance
export const channelManager = new ChannelManagerService();


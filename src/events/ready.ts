import { Client, REST, Routes } from 'discord.js';
import { getDiscordToken, getGuildId } from '../config/env.js';
import { Command } from '../utils/loadCommands.js';
// Database initialization removed - using Prisma migrations instead

/**
 * Bot ready event handler
 * Registers slash commands with Discord when bot comes online
 */
export default {
  name: 'ready',
  once: true,
  async execute(client: Client) {
    if (!client.user) {
      console.error('❌ Client user is null');
      return;
    }

    console.log(`✅ Bot is online as ${client.user.tag}`);

    // Database is managed by Prisma (migrations run separately)

    // Register slash commands
    try {
      const commands = client.commands.map((cmd: Command) => cmd.data.toJSON());

      const rest = new REST().setToken(getDiscordToken());

      console.log('🔄 Registering slash commands...');

      // Check if GUILD_ID is set for single guild, otherwise register to all guilds
      const specificGuildId = getGuildId();
      
      if (specificGuildId) {
        // Register commands for specific guild (instant updates)
        console.log(`📌 Using guild-specific commands for guild: ${specificGuildId}`);
        const data = await rest.put(
          Routes.applicationGuildCommands(client.user.id, specificGuildId),
          { body: commands }
        );
        console.log(
          `✅ Successfully registered ${(data as any[]).length} application (/) commands for guild ${specificGuildId}.`
        );
      } else {
        // Register commands to ALL guilds the bot is in (instant updates everywhere)
        const guilds = client.guilds.cache;
        console.log(`🚀 Registering commands to ${guilds.size} guild(s) for instant updates...`);
        
        let successCount = 0;
        let failCount = 0;

        for (const [guildId, guild] of guilds) {
          try {
            const data = await rest.put(
              Routes.applicationGuildCommands(client.user.id, guildId),
              { body: commands }
            );
            console.log(
              `  ✅ Registered ${(data as any[]).length} commands to "${guild.name}" (${guildId})`
            );
            successCount++;
          } catch (error) {
            console.error(
              `  ❌ Failed to register commands to "${guild.name}" (${guildId}):`,
              error
            );
            failCount++;
          }
        }

        console.log(
          `\n✅ Command registration complete: ${successCount} success, ${failCount} failed`
        );
        console.log('💡 Commands are now available instantly in all servers!');
      }
    } catch (error) {
      console.error('❌ Error registering commands:', error);
    }
  },
};


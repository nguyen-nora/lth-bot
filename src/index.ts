import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { getDiscordToken } from './config/env.js';
import prisma from './database/prisma.js';
import { loadEvents } from './utils/loadEvents.js';
import { loadCommands } from './utils/loadCommands.js';
import { marriageService } from './services/marriageService.js';
import { channelManager } from './services/channelManager.js';
import { cleanupService } from './services/cleanupService.js';

// Extend Client to include commands collection
declare module 'discord.js' {
  interface Client {
    commands: Collection<string, any>;
  }
}

/**
 * Main bot entry point
 */
async function main() {
  // Initialize Discord client with required intents
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates, // Required for voice channel attendance tracking
    ],
  });

  // Initialize commands collection
  client.commands = new Collection();

  // Verify Prisma connection (Prisma auto-connects on first query)
  try {
    await prisma.$connect();
    console.log('✅ Database connected (Prisma)');
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }

  // Note: Database migrations should be run separately:
  // Development: `npm run prisma:migrate:dev`
  // Production: `npm run prisma:migrate:deploy`

  // Set client on services (required for DM sending and channel operations)
  marriageService.setClient(client);
  channelManager.setClient(client);

  // Run cleanup on startup
  try {
    await cleanupService.markExpiredProposals();
    const cleaned = await cleanupService.cleanupExpiredProposals();
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired proposals on startup`);
    }
  } catch (error) {
    console.error('⚠️  Cleanup on startup failed:', error);
    // Don't exit - cleanup failure is not critical
  }

  // Schedule periodic cleanup (every 24 hours)
  const cleanupInterval = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  setInterval(async () => {
    try {
      await cleanupService.markExpiredProposals();
      const cleaned = await cleanupService.cleanupExpiredProposals();
      if (cleaned > 0) {
        console.log(`🧹 Periodic cleanup: Removed ${cleaned} expired proposals`);
      }
    } catch (error) {
      console.error('⚠️  Periodic cleanup failed:', error);
      // Don't throw - cleanup failure is not critical
    }
  }, cleanupInterval);
  console.log('✅ Scheduled periodic cleanup (every 24 hours)');

  // Load commands
  try {
    await loadCommands(client);
    console.log('✅ Commands loaded');
  } catch (error) {
    console.error('❌ Failed to load commands:', error);
    process.exit(1);
  }

  // Load event handlers
  try {
    await loadEvents(client);
    console.log('✅ Event handlers loaded');
  } catch (error) {
    console.error('❌ Failed to load event handlers:', error);
    process.exit(1);
  }

  // Handle errors
  client.on('error', (error) => {
    console.error('Discord client error:', error);
  });

  process.on('unhandledRejection', (error: unknown) => {
    console.error('Unhandled promise rejection:', error);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await prisma.$disconnect();
    client.destroy();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await prisma.$disconnect();
    client.destroy();
    process.exit(0);
  });

  // Login to Discord
  try {
    const token = getDiscordToken();
    await client.login(token);
    console.log('✅ Bot logged in to Discord');
  } catch (error) {
    console.error('❌ Failed to login to Discord:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Start the bot
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});


import { Client } from 'discord.js';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Event handler interface
 */
interface EventHandler {
  name: string;
  once?: boolean;
  execute: (...args: any[]) => void | Promise<void>;
}

/**
 * Load all event handlers from the events directory
 * @param client Discord client instance
 */
export async function loadEvents(client: Client): Promise<void> {
  const eventsPath = join(__dirname, '../events');
  const eventFiles = readdirSync(eventsPath).filter((file) =>
    file.endsWith('.ts') || file.endsWith('.js')
  );

  for (const file of eventFiles) {
    const filePath = join(eventsPath, file);
    const event: EventHandler = (await import(`file://${filePath}`)).default;

    if (!event.name || !event.execute) {
      console.warn(
        `⚠️  Event at ${filePath} is missing required "name" or "execute" property.`
      );
      continue;
    }

    if (event.once) {
      client.once(event.name, (...args: any[]) => event.execute(...args));
    } else {
      client.on(event.name, (...args: any[]) => event.execute(...args));
    }

    console.log(`📡 Loaded event: ${event.name}`);
  }
}


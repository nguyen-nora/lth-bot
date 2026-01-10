import { Client } from 'discord.js';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Command interface
 */
export interface Command {
  data: {
    name: string;
    description: string;
    toJSON: () => any;
  };
  execute: (interaction: any) => Promise<void>;
}

/**
 * Load all commands from the commands directory
 * @param client Discord client instance
 */
export async function loadCommands(client: Client): Promise<void> {
  const commandsPath = join(__dirname, '../commands');
  const commandFiles = readdirSync(commandsPath).filter((file) =>
    (file.endsWith('.ts') || file.endsWith('.js')) && !file.endsWith('.d.ts')
  );

  for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const command: Command = (await import(`file://${filePath}`)).default;

    if (!command.data || !command.execute) {
      console.warn(
        `⚠️  Command at ${filePath} is missing required "data" or "execute" property.`
      );
      continue;
    }

    client.commands.set(command.data.name, command);
    console.log(`📝 Loaded command: ${command.data.name}`);
  }
}


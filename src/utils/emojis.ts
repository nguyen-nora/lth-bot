/**
 * Custom Emoji Utilities
 * Helper functions for using custom Discord server emojis
 * 
 * HOW TO GET EMOJI IDs:
 * =====================
 * Method 1 (Easiest):
 * 1. Enable Developer Mode in Discord:
 *    - User Settings > Advanced > Developer Mode (toggle ON)
 * 2. In your Discord server, type the emoji: :emoji_48:
 * 3. Right-click on the emoji that appears
 * 4. Click "Copy ID" (this option only appears with Developer Mode enabled)
 * 5. The ID is a long number like: 1234567890123456789
 * 
 * Method 2 (Alternative):
 * 1. Type \:emoji_48: in Discord (with backslash)
 * 2. This shows the raw format: <:emoji_48:1234567890123456789>
 * 3. Extract the ID from the format: <:name:id>
 * 
 * Method 3 (Using Discord API):
 * 1. Use Discord API endpoint: GET /guilds/{guild.id}/emojis
 * 2. Or use a Discord bot command to list emojis
 * 
 * USAGE:
 * ======
 * 1. Add your emoji IDs to the EMOJI_IDS object below
 * 2. Use formatEmoji('emoji_48') in your code
 * 3. Or use formatEmoji('emoji_48', '1234567890123456789') with direct ID
 */

// Server emoji IDs - Add your emoji IDs here
// Format: emoji_name: 'emoji_id'
export const EMOJI_IDS = {
  // Example (replace with your actual emoji):
  // emoji_48: '1234567890123456789',
  
  // Add more emojis here:
  // battle: '1234567890123456789',
  // heart: '1234567890123456789',
  // etc...
} as const;

/**
 * Format a custom emoji for use in Discord messages/embeds
 * @param emojiName The name of the emoji (key from EMOJI_IDS)
 * @param emojiId The emoji ID (optional, will use EMOJI_IDS if not provided)
 * @returns Formatted emoji string (e.g., "<:emoji_48:1234567890123456789>")
 */
export function formatEmoji(emojiName: string, emojiId?: string): string {
  const id = emojiId || EMOJI_IDS[emojiName as keyof typeof EMOJI_IDS];
  
  if (!id) {
    console.warn(`Emoji ID not found for: ${emojiName}`);
    return `:${emojiName}:`; // Fallback to text representation
  }
  
  return `<:${emojiName}:${id}>`;
}

/**
 * Get emoji from Discord client cache
 * This method requires the bot to be in the server and have access to the emoji
 * @param client Discord client instance
 * @param emojiId The emoji ID
 * @returns The emoji object or null if not found
 */
export function getEmojiFromClient(client: any, emojiId: string) {
  if (!client?.emojis) {
    return null;
  }
  return client.emojis.cache.get(emojiId) || null;
}

/**
 * Format emoji using client cache (preferred method if bot is in server)
 * @param client Discord client instance
 * @param emojiId The emoji ID
 * @returns Formatted emoji string or fallback
 */
export function formatEmojiFromClient(client: any, emojiId: string): string {
  const emoji = getEmojiFromClient(client, emojiId);
  if (emoji) {
    return emoji.toString(); // Returns <:name:id> format
  }
  return `:emoji:`;
}

/**
 * Get emoji from a specific guild by name
 * @param client Discord client instance
 * @param guildId The guild ID
 * @param emojiName The emoji name (e.g., "emoji_61", "emoji_41~1", "emoji_41-1")
 * @returns The emoji object or null if not found
 */
export function getEmojiFromGuildByName(
  client: any,
  guildId: string,
  emojiName: string
): any {
  if (!client?.guilds) {
    return null;
  }
  
  let guild = client.guilds.cache.get(guildId);
  if (!guild) {
    // Try to fetch from API if not in cache (async, but we'll handle it)
    console.warn(`Guild ${guildId} not found in cache. Make sure the bot is in the server.`);
    return null;
  }
  
  // Ensure emojis are cached
  if (!guild.emojis.cache.size && guild.emojis) {
    guild.emojis.fetch().catch(() => {
      // Silently fail if we can't fetch emojis
    });
  }
  
  // Try exact match first
  let emoji = guild.emojis.cache.find((e: any) => e.name === emojiName);
  if (emoji) {
    return emoji;
  }
  
  // Try with dash instead of tilde (emoji_41-1 vs emoji_41~1)
  const dashVariant = emojiName.replace(/~1$/, '-1');
  emoji = guild.emojis.cache.find((e: any) => e.name === dashVariant);
  if (emoji) {
    return emoji;
  }
  
  // Try with tilde instead of dash (emoji_41~1 vs emoji_41-1)
  const tildeVariant = emojiName.replace(/-1$/, '~1');
  emoji = guild.emojis.cache.find((e: any) => e.name === tildeVariant);
  if (emoji) {
    return emoji;
  }
  
  // Try without the suffix (for variants like emoji_41~1 or emoji_41-1)
  const baseName = emojiName.replace(/[~-]1$/, '');
  emoji = guild.emojis.cache.find((e: any) => e.name === baseName);
  if (emoji) {
    return emoji;
  }
  
  // Debug: log available emojis if not found
  if (guild.emojis.cache.size > 0) {
    const emojiNames = Array.from(guild.emojis.cache.values()).map((e: any) => e.name);
    console.warn(`Emoji "${emojiName}" not found. Available emojis: ${emojiNames.slice(0, 10).join(', ')}...`);
  }
  
  return null;
}

/**
 * Format emoji from a specific guild by name
 * @param client Discord client instance
 * @param guildId The guild ID
 * @param emojiName The emoji name (e.g., "emoji_61", "emoji_41~1")
 * @returns Formatted emoji string or fallback
 */
export function formatEmojiFromGuildByName(
  client: any,
  guildId: string,
  emojiName: string
): string {
  const emoji = getEmojiFromGuildByName(client, guildId, emojiName);
  if (emoji) {
    return emoji.toString(); // Returns <:name:id> or <a:name:id> for animated
  }
  return `:${emojiName}:`; // Fallback to text representation
}

